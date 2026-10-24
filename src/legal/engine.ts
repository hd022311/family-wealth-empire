import { sources, type LawSource } from "./catalog";
export type Heir = {
  id: number;
  name: string;
  relation: "spouse" | "descendant" | "parent" | "sibling" | "grandparent";
  parentId?: number;
  status: "eligible" | "predeceased" | "disqualified" | "renounced" | "unknown";
};
export type SuccessionFacts = {
  deathDate: string | null;
  heirs: Heir[];
  familyComplete: boolean;
  marriageConfirmed: boolean;
  will: "none" | "document" | "unknown";
  maritalProperty: "cleared" | "unknown";
  gifts: "none" | "present" | "unknown";
  insurance: "none" | "present" | "unknown";
  ownershipConfirmed: boolean;
};
export type Fraction = { numerator: number; denominator: number };
export type Share = {
  id: number;
  name: string;
  fraction: Fraction;
  via: number[];
};
export type LegalResult = {
  status: "confirmed" | "test_fixture" | "pending";
  shares: Share[] | null;
  rules: LawSource[];
  facts: SuccessionFacts;
  disputes: string[];
  pending: string[];
  calculation: string[];
  applicableDate: string | null;
  ruleVersion: string;
  amount: null;
};
export const dateValid = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
function selectRules(
  ids: string[],
  date: string,
  catalog: LawSource[],
  allowTestFixtures = false,
) {
  return ids.map((id) => {
    const matches = catalog.filter(
      (s) =>
        s.id === id &&
        (!["statutory","representation"].includes(id)||s.algorithmVersion==="tw-succession-engine-1") &&
        (s.verification === "official_reviewed" ||
          (allowTestFixtures && s.verification === "test_fixture")) &&
        s.effectiveFrom &&
        s.promulgatedOn &&
        s.verifiedOn &&
        s.contentHash &&
        date >= s.effectiveFrom &&
        (!s.effectiveTo || date < s.effectiveTo),
    );
    return matches.length === 1 ? matches[0] : undefined;
  });
}
function fraction(n: number, d: number): Fraction {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(n, d);
  return { numerator: n / g, denominator: d / g };
}
export function statutoryShares(
  facts: SuccessionFacts,
  catalog = sources,
  allowTestFixtures = false,
): LegalResult {
  const pending: string[] = [];
  const disputes: string[] = [];
  const selected =
    facts.deathDate && dateValid(facts.deathDate)
      ? selectRules(
          ["statutory", "representation"],
          facts.deathDate,
          catalog,
          allowTestFixtures,
        )
      : [];
  if (!facts.deathDate || !dateValid(facts.deathDate))
    pending.push("死亡日期尚未確認");
  if (selected.length !== 2 || selected.some((s) => !s))
    pending.push("法定繼承／代位規則及死亡日適用版本尚未完成法律驗證");
  if (!facts.familyComplete || !facts.marriageConfirmed)
    pending.push("親屬清冊或婚姻身分尚未確認");
  if (
    facts.heirs.some((h) => h.status === "renounced" || h.status === "unknown")
  )
    pending.push("拋棄、資格或代位要件須個別確認");
  if (
    facts.heirs.filter(
      (h) => h.relation === "spouse" && h.status === "eligible",
    ).length > 1 ||
    new Set(facts.heirs.map((h) => h.id)).size !== facts.heirs.length
  )
    pending.push("親屬資料矛盾");
  if (facts.will !== "none")
    disputes.push("遺囑或遺囑效力未確認，不能把法定份額當成最終分配");
  if (facts.maritalProperty !== "cleared")
    disputes.push("夫妻財產及剩餘財產請求尚待確認");
  if (facts.gifts !== "none") disputes.push("生前贈與及歸扣要件尚待確認");
  if (facts.insurance !== "none")
    disputes.push("保險契約、受益人及稅務尚待確認");
  if (!facts.ownershipConfirmed) disputes.push("財產歸屬與遺產範圍尚待確認");
  const result: LegalResult = {
    status: "pending",
    shares: null,
    rules: selected.filter((s): s is LawSource => Boolean(s)),
    facts: structuredClone(facts),
    disputes,
    pending,
    calculation: [],
    applicableDate: facts.deathDate,
    ruleVersion: "tw-succession-engine-1",
    amount: null,
  };
  if (pending.length) return result;
  const descendants = facts.heirs.filter((h) => h.relation === "descendant");
  const eligibleBranch = (h: Heir, path: number[]): Share[] => {
    if (path.includes(h.id)) throw Error("親屬資料循環");
    if (h.status === "eligible")
      return [
        {
          id: h.id,
          name: h.name,
          fraction: { numerator: 1, denominator: 1 },
          via: path,
        },
      ];
    if (h.status !== "predeceased" && h.status !== "disqualified") return [];
    const branches = descendants
      .filter((c) => c.parentId === h.id)
      .map((c) => eligibleBranch(c, [...path, h.id]))
      .filter((c) => c.length);
    return branches.flatMap((branch) =>
      branch.map((leaf) => ({
        ...leaf,
        fraction: fraction(
          leaf.fraction.numerator,
          leaf.fraction.denominator * branches.length,
        ),
      })),
    );
  };
  let branches: Share[][] = [];
  try {
    if (
      descendants.some(
        (h) =>
          h.parentId !== undefined &&
          !descendants.some((p) => p.id === h.parentId),
      )
    )
      throw Error("代位支系父母資料缺漏");
    branches = descendants
      .filter((h) => h.parentId === undefined)
      .map((h) => eligibleBranch(h, []))
      .filter((b) => b.length);
    // Unreachable / cyclic descendant data cannot quietly become a different heir order.
    for (const h of descendants) {
      const seen = new Set<number>();
      let at: Heir | undefined = h;
      while (at?.parentId !== undefined) {
        if (seen.has(at.id)) throw Error("親屬資料循環");
        seen.add(at.id);
        at = descendants.find((p) => p.id === at!.parentId);
      }
    }
  } catch (e) {
    result.pending.push((e as Error).message);
    return result;
  }
  const spouse = facts.heirs.find(
    (h) => h.relation === "spouse" && h.status === "eligible",
  );
  let shares: Share[] = [];
  if (branches.length) {
    const denominator = branches.length + (spouse ? 1 : 0);
    shares = branches.flatMap((b) =>
      b.map((h) => ({
        ...h,
        fraction: fraction(
          h.fraction.numerator,
          h.fraction.denominator * denominator,
        ),
      })),
    );
    if (spouse)
      shares.push({
        id: spouse.id,
        name: spouse.name,
        fraction: fraction(1, denominator),
        via: [],
      });
    result.calculation.push(
      `以 ${branches.length} 個子女支系${spouse ? "及配偶" : ""}為基礎，代位支系再按支內分配`,
    );
  } else {
    const order = (["parent", "sibling", "grandparent"] as const)
      .map((relation) => ({
        relation,
        people: facts.heirs.filter(
          (h) => h.relation === relation && h.status === "eligible",
        ),
      }))
      .find((g) => g.people.length);
    const spouseFraction = spouse
      ? order
        ? order.relation === "grandparent"
          ? fraction(2, 3)
          : fraction(1, 2)
        : fraction(1, 1)
      : fraction(0, 1);
    if (spouse)
      shares.push({
        id: spouse.id,
        name: spouse.name,
        fraction: spouseFraction,
        via: [],
      });
    if (order) {
      const remainder = fraction(
        spouseFraction.denominator - spouseFraction.numerator,
        spouseFraction.denominator,
      );
      shares.push(
        ...order.people.map((h) => ({
          id: h.id,
          name: h.name,
          fraction: fraction(
            remainder.numerator,
            remainder.denominator * order.people.length,
          ),
          via: [],
        })),
      );
      result.calculation.push(
        `順位：${order.relation}，同順位內均分非配偶部分`,
      );
    }
  }
  if (!shares.length) {
    result.pending.push("無適格繼承人；無人承認繼承等程序尚未實作");
    return result;
  }
  result.shares = shares;
  result.status = result.rules.some((r) => r.verification === "test_fixture")
    ? "test_fixture"
    : "confirmed";
  return result;
}
export type TaxTable = {
  year: number;
  source: LawSource;
  exemption: number;
  deductionsVerified: boolean;
};
export const annualTaxTables: TaxTable[] = [];
export function inheritanceTax(
  deathDate: string,
  tables = annualTaxTables,
): {
  status: "pending";
  amount: null;
  year: number | null;
  reason: string;
  sources: LawSource[];
} {
  const year = dateValid(deathDate) ? Number(deathDate.slice(0, 4)) : null;
  const row = tables.find(
    (t) => t.year === year && t.source.verification === "official_reviewed",
  );
  return {
    status: "pending",
    amount: null,
    year,
    reason: row
      ? "稅基、扣除額、居住身分與計算模組尚待核實"
      : "死亡年度免稅額、扣除額及稅率資料尚未完成法律驗證",
    sources: row ? [row.source] : [],
  };
}
export function reservedShare(deathDate: string, catalog = sources) {
  return {
    status: "pending" as const,
    amount: null,
    fraction: null,
    rules: dateValid(deathDate)
      ? selectRules(["reserved"], deathDate, catalog).filter(
          (s): s is LawSource => Boolean(s),
        )
      : [],
    reason: "特留分版本及個案要件尚未完成法律驗證；不預設 2026 修正已生效",
  };
}
export function willAssessment(kind: "none" | "oral-promise" | "document") {
  return {
    status: kind === "none" ? "no-will-reported" : "pending",
    valid: null,
    reason:
      kind === "oral-promise"
        ? "口頭承諾不是已確認有效遺囑；口授遺囑須另外審查法定要件"
        : kind === "document"
          ? "文件存在不等於遺囑有效，須審查形式與實質要件"
          : "僅記錄當事人申報無遺囑，仍需查證",
    rules: sources.filter((s) => s.id === "wills"),
  };
}
