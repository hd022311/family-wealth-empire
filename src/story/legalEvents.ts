/** Chapters 3–6: review-only envelopes. No handler in this module commits legal effects. */
import type { State } from "../simulation";
import { sources, type LegalModule } from "../legal/catalog";
import { dateValid } from "../legal/engine";
export type FutureStoryEvent =
  | {
      kind: "parent-intention";
      ownerId: number;
      beneficiaryId: number;
      houseIds: string[];
    }
  | {
      kind: "will-disclosure";
      estateId: string;
      documentId: string;
      houseIds: string[];
      beneficiaryId: number;
    }
  | { kind: "reserved-share-claim"; estateId: string; claimantId: number }
  | {
      kind: "partition-proposal";
      estateId: string;
      houseIds: string[];
      participants: number[];
    }
  | {
      kind: "insurance-review";
      policyholderId: number;
      insuredId: number;
      beneficiaryId: number;
      policyDocumentId: string;
    }
  | {
      kind: "asset-restriction-review";
      estateId: string;
      houseId: string;
      procedureDocumentId: string;
    }
  | { kind: "death-year-tax-review"; estateId: string };
const modules: Record<FutureStoryEvent["kind"], LegalModule[]> = {
  "parent-intention": ["wills", "marital", "gifts"],
  "will-disclosure": [
    "statutory",
    "representation",
    "wills",
    "reserved",
    "marital",
    "debts",
  ],
  "reserved-share-claim": ["reserved", "wills", "gifts"],
  "partition-proposal": ["partition", "marital", "debts", "tax"],
  "insurance-review": ["insurance", "tax"],
  "asset-restriction-review": ["partition"],
  "death-year-tax-review": ["tax"],
};
export function prepareFutureEvent(s: State, event: FutureStoryEvent) {
  if (!s.story) throw Error("此家族沒有本劇情事件架構");
  const estate =
    "estateId" in event
      ? s.clan.estates.find((e) => e.id === event.estateId)
      : undefined;
  if ("estateId" in event && !estate)
    throw Error("必須指定某一位死者的獨立遺產清冊");
  const people = new Set(s.clan.people.map((p) => p.id));
  const pending = [
    "劇情示範、尚未法律驗證；本版不建立有效遺囑、不改變所有權、不分產、不理賠、不產生稅額或處分限制。",
  ];
  const disputes: string[] = [];
  if (estate && !dateValid(estate.deathDate))
    pending.push("死亡日期尚待確認。");
  if ("ownerId" in event && !people.has(event.ownerId))
    throw Error("人物不存在");
  if ("beneficiaryId" in event && !people.has(event.beneficiaryId))
    throw Error("指定對象不存在");
  if (event.kind === "insurance-review") {
    if (!people.has(event.insuredId) || !people.has(event.policyholderId))
      throw Error("要保人或被保險人不存在");
    pending.push(
      "須分開確認要保人、被保險人、受益人、契約效力、除外責任、給付時點及稅務；沒有投保或保證理賠效果。",
    );
  }
  const houseIds =
    "houseIds" in event
      ? event.houseIds
      : "houseId" in event
        ? [event.houseId]
        : [];
  const owner = "ownerId" in event ? event.ownerId : estate?.ownerId;
  const houses = houseIds.map((id) => {
    const h = s.story!.houses.find((h) => h.id === id);
    if (!h) throw Error("房屋不存在");
    return structuredClone(h);
  });
  if (owner !== undefined && houses.some((h) => h.ownerId !== owner))
    disputes.push("提議含他人所有的房屋；需逐筆確認處分權，不視為已有效指定。");
  if (event.kind === "parent-intention")
    pending.push(
      "父母心願屬自主意向，不是有效遺囑、贈與或分割協議；照顧與親密度不建立繼承權。",
    );
  if (event.kind === "asset-restriction-review")
    pending.push(
      "須核實實際程序文件及限制範圍；不能把整筆遺產當作已遭法院凍結。",
    );
  const requirements = modules[event.kind].map((id) => ({
    module: id,
    sources: sources
      .filter((source) => source.id === id)
      .map((source) => ({ ...source })),
    status: "pending" as const,
  }));
  return {
    definitionStatus: "framework" as const,
    event: structuredClone(event),
    label: "劇情示範、尚未法律驗證",
    applicableDate: estate?.deathDate ?? null,
    knownGameFacts: { estate: estate ? structuredClone(estate) : null, houses },
    npcSimulation: ["協商意願可受家庭、財務及記憶影響，法律權利不可因此修改。"],
    disputes,
    pending,
    requirements,
    statutoryShares: null,
    reservedShares: null,
    willDistribution: null,
    partitionAgreement: null,
    maritalClaim: null,
    lifetimeGiftEffect: null,
    insurancePayout: null,
    tax: null,
    restrictions: [],
    effects: [],
  };
}
