import { describe, it, expect } from "vitest";
import { sources, searchTopics, type LawSource } from "./catalog";
import {
  statutoryShares,
  inheritanceTax,
  reservedShare,
  willAssessment,
  type SuccessionFacts,
  type Heir,
} from "./engine";
// Explicit synthetic provenance for algorithm tests ONLY. These are not authenticated Taiwan legal snapshots.
const fixtures: LawSource[] = sources.map((s) => ({
  ...s,
  verification: "test_fixture",
  promulgatedOn: "2000-01-01",
  effectiveFrom: "2000-01-01",
  effectiveTo: null,
  verifiedOn: "2026-10-23",
  revision: "TEST-ONLY-algorithm",
  contentHash: "TEST-NOT-OFFICIAL",
  algorithmVersion: "tw-succession-engine-1",
}));
const person = (
  id: number,
  relation: Heir["relation"],
  extra: Partial<Heir> = {},
): Heir => ({ id, name: `人物${id}`, relation, status: "eligible", ...extra });
const facts = (heirs: Heir[]): SuccessionFacts => ({
  deathDate: "2026-10-23",
  heirs,
  familyComplete: true,
  marriageConfirmed: true,
  will: "none",
  maritalProperty: "cleared",
  gifts: "none",
  insurance: "none",
  ownershipConfirmed: true,
});
const calculate = (heirs: Heir[]) =>
  statutoryShares(facts(heirs), fixtures, true);
describe("台灣法律引擎：未核對資料封鎖與規則演算法分開驗證", () => {
  it("配偶與三名子女：演算法為各 1/4，但測試來源絕不當成正式法律", () => {
    const result = calculate([
      person(1, "spouse"),
      person(2, "descendant"),
      person(3, "descendant"),
      person(4, "descendant"),
    ]);
    expect(result.status).toBe("test_fixture");
    expect(result.shares).toHaveLength(4);
    expect(
      result.shares!.every(
        (s) => s.fraction.numerator === 1 && s.fraction.denominator === 4,
      ),
    ).toBe(true);
    expect(
      statutoryShares(facts([person(1, "spouse")]), fixtures).shares,
    ).toBeNull();
  });
  it("順位：有子女排除父母；配偶+父母、手足及祖父母的支序分別處理", () => {
    expect(
      calculate([person(1, "descendant"), person(2, "parent")]).shares!.map(
        (s) => s.id,
      ),
    ).toEqual([1]);
    for (const relation of ["parent", "sibling"] as const)
      expect(
        calculate([person(1, "spouse"), person(2, relation)]).shares!.find(
          (s) => s.id === 1,
        )?.fraction,
      ).toEqual({ numerator: 1, denominator: 2 });
    expect(
      calculate([person(1, "spouse"), person(2, "grandparent")]).shares!.find(
        (s) => s.id === 1,
      )?.fraction,
    ).toEqual({ numerator: 2, denominator: 3 });
  });
  it("代位按支系：一名子女及先亡子女的兩名子女為 1/2、1/4、1/4", () => {
    const result = calculate([
      person(1, "descendant"),
      person(2, "descendant", { status: "predeceased" }),
      person(3, "descendant", { parentId: 2 }),
      person(4, "descendant", { parentId: 2 }),
    ]);
    expect(result.shares?.map((s) => s.fraction.denominator)).toEqual([
      2, 4, 4,
    ]);
    expect(result.shares?.find((s) => s.id === 3)?.via).toEqual([2]);
  });
  it("拋棄、親屬缺漏或循環不假裝完成法律判斷", () => {
    expect(
      calculate([person(1, "descendant", { status: "renounced" })]).shares,
    ).toBeNull();
    expect(
      calculate([person(2, "descendant", { parentId: 77 })]).shares,
    ).toBeNull();
    expect(
      calculate([
        person(1, "descendant", { parentId: 2 }),
        person(2, "descendant", { parentId: 1 }),
      ]).shares,
    ).toBeNull();
  });
  it("有遺囑、無遺囑及口頭承諾分開；有文件不視為必然有效", () => {
    expect(willAssessment("oral-promise").valid).toBeNull();
    expect(willAssessment("document").status).toBe("pending");
    expect(willAssessment("none").status).toBe("no-will-reported");
    const f = facts([person(1, "descendant")]);
    f.will = "document";
    expect(statutoryShares(f, fixtures, true).disputes.join()).toContain(
      "遺囑",
    );
  });
  it("不同日期特留分均不套未知修法，年度稅額缺漏不能顯示零", () => {
    for (const date of ["2025-12-31", "2026-10-23", "2030-01-01"]) {
      expect(reservedShare(date).fraction).toBeNull();
      const tax = inheritanceTax(date);
      expect(tax.amount).toBeNull();
      expect(tax.year).toBe(Number(date.slice(0, 4)));
      expect(tax.reason).toContain("尚未完成法律驗證");
    }
  });
  it("規則依適用日期選版；未知／重疊期間不默認最新版本", () => {
    const historical = fixtures.map((s) => ({
      ...s,
      effectiveTo: "2026-01-01",
    }));
    expect(
      statutoryShares(
        { ...facts([person(1, "descendant")]), deathDate: "2025-12-31" },
        historical,
        true,
      ).status,
    ).toBe("test_fixture");
    expect(
      statutoryShares(facts([person(1, "descendant")]), historical, true)
        .shares,
    ).toBeNull();
    expect(
      statutoryShares(
        facts([person(1, "descendant")]),
        [...fixtures, ...fixtures],
        true,
      ).shares,
    ).toBeNull();
  });
  it("每個可計算結果可追溯規則及適用日；預設正式目錄缺法源時無數字", () => {
    const r = calculate([person(1, "descendant")]);
    expect(
      r.rules.every(
        (s) =>
          s.url.startsWith("https://law.moj.gov.tw/") &&
          s.articles.length &&
          s.revision &&
          s.effectiveFrom &&
          s.contentHash,
      ),
    ).toBe(true);
    expect(r.applicableDate).toBe("2026-10-23");
    const actual = statutoryShares(
      facts([person(1, "spouse"), person(2, "descendant")]),
    );
    expect(actual.status).toBe("pending");
    expect(actual.shares).toBeNull();
    expect(actual.amount).toBeNull();
  });
  it("條號、法律名與主題可搜尋，無虛構判決", () => {
    expect(searchTopics("民法第1138條").map((t) => t.id)).toContain(
      "statutory",
    );
    expect(searchTopics("遺囑").length).toBeGreaterThan(0);
    expect(searchTopics("不存在99999")).toEqual([]);
    expect(searchTopics("").every((t) => t.judgments.length === 0)).toBe(true);
  });
});
it("同一法律事實下，附帶的親密或信任資訊不能改變應繼分", () => {
  const f = facts([person(1, "spouse"), person(2, "descendant")]);
  const friendly = Object.assign(structuredClone(f), {
    closeness: 100,
    trust: 100,
  });
  const hostile = Object.assign(structuredClone(f), { closeness: 0, trust: 0 });
  expect(statutoryShares(friendly, fixtures, true).shares).toEqual(
    statutoryShares(hostile, fixtures, true).shares,
  );
});
