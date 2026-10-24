import { describe, it, expect } from "vitest";
import {
  initial,
  tick,
  assets,
  net,
  parseSave,
  inherit,
  transact,
} from "../simulation";
import { familyAction, decide, relationship, createClan } from "./engine";
import { statutoryShares } from "../legal/engine";
const steady = () => 0.5;
const ordinary = () =>
  familyAction(initial(), { type: "background", background: "ordinary" });
function story() {
  let s = familyAction(ordinary(), { type: "start-story" });
  s = familyAction(s, { type: "care", choice: "time" });
  s = tick(s, steady);
  s = familyAction(s, { type: "burden", choice: "meeting" });
  return s;
}
describe("家族關係、人性與法律隔離", () => {
  it("背景不同，但父母財產不列入玩家資產，白手起家無父母遺產", () => {
    const a = familyAction(initial(), {
        type: "background",
        background: "self-made",
      }),
      b = familyAction(initial(), {
        type: "background",
        background: "wealthy",
      }),
      c = ordinary();
    expect([a.cash, b.cash, c.cash]).toEqual([300000, 1800000, 600000]);
    expect(assets(b)).toBe(1800000);
    expect(b.clan.people.find((p) => p.id === 10)!.finances.home).toBe(
      18000000,
    );
    expect(
      a.clan.people
        .filter((p) => p.id === 10 || p.id === 11)
        .every((p) => !p.alive && p.finances.cash === 0),
    ).toBe(true);
    expect(() => familyAction(a, { type: "start-story" })).toThrow();
  });
  it("已有資產不能重選背景覆蓋歷史", () => {
    const s = transact(initial(), { type: "buy", id: 0 });
    expect(() =>
      familyAction(s, { type: "background", background: "wealthy" }),
    ).toThrow("已有經營紀錄");
  });
  it("探望投入錢、健康與時間，贈與及借貸同時更新雙邊帳戶且平衡", () => {
    let s = ordinary();
    const before = s.cash;
    s = familyAction(s, { type: "visit", personId: 10 });
    expect(s.cash).toBe(before - 1200);
    expect(s.clan.playerHealth).toBe(99);
    expect(relationship(s.clan, 0, 10).careHours).toBe(4);
    const sibling = s.clan.people.find((p) => p.id === 12)!.finances.cash;
    s = familyAction(s, { type: "assist", personId: 12 });
    expect(s.clan.people.find((p) => p.id === 12)!.finances.cash).toBe(
      sibling + 40000,
    );
    s = familyAction(s, { type: "loan", personId: 12 });
    expect(s.clan.loans[0].legalStatus).toBe("unreviewed");
    expect(
      s.clan.transactions.every(
        (t) => Math.abs(t.postings.reduce((a, p) => a + p.delta, 0)) < 0.01,
      ),
    ).toBe(true);
    expect(
      s.clan.memories.some((m) => m.kind === "fact" && m.category === "gift"),
    ).toBe(true);
  });
  it("固定種子決策可重現；相同親密度下，能力與責任仍改變選擇", () => {
    const c = ordinary().clan;
    const copy = structuredClone(c);
    expect(decide(c, 12, "care")).toEqual(decide(copy, 12, "care"));
    const rich = structuredClone(copy),
      poor = structuredClone(copy);
    rich.people.find((p) => p.id === 12)!.finances.cash = 3000000;
    poor.people.find((p) => p.id === 12)!.finances.cash = 0;
    poor.people.find((p) => p.id === 12)!.finances.expenses = 100000;
    expect(decide(rich, 12, "care").score).toBeGreaterThan(
      decide(poor, 12, "care").score,
    );
  });
  it("疾病、手足壓力、父親死亡與祖厝協商有完整狀態流，沒有暗中分產", () => {
    let s = story();
    expect(s.clan.memories.some((m) => m.kind === "document")).toBe(true);
    let count = 0;
    while (!s.clan.estates.some((e) => e.ownerId === 10) && count++ < 30)
      s = tick(s, steady);
    const estate = s.clan.estates.find((e) => e.ownerId === 10)!;
    expect(estate).toBeDefined();
    expect(estate.finances.home).toBe(4800000);
    expect(
      estate.facts.heirs.some((h) => h.id === 11 && h.relation === "spouse"),
    ).toBe(true);
    expect(
      estate.facts.heirs
        .filter((h) => h.relation === "descendant")
        .map((h) => h.id),
    ).toContain(12);
    const cash = s.cash;
    s = familyAction(s, { type: "review-estate", estateId: estate.id });
    s = familyAction(s, { type: "meeting", proposal: "keep" });
    expect(s.cash).toBe(cash - 2000);
    expect(s.clan.estates[0].proposal).toBe("keep");
    expect(s.clan.estates[0].responses.length).toBeGreaterThan(0);
    expect(s.clan.memories.at(-1)?.documentStatus).toBe("unreviewed");
    expect(statutoryShares(s.clan.estates[0].facts).shares).toBeNull();
    const held = s.clan.estates[0].finances.cash;
    s = familyAction(s, { type: "legal-route", estateId: estate.id });
    expect(s.clan.estates[0].legalProceedings).toBe(true);
    expect(s.clan.estates[0].finances.cash).toBe(held);
  });
  it("關係變動不能改法定候選資料，口頭承諾與客觀履行分開保存", () => {
    let s = ordinary();
    s = familyAction(s, { type: "promise", personId: 10 });
    const before = structuredClone(s.clan.links);
    s = tick(s, steady);
    expect(s.clan.links).toEqual(before);
    expect(
      s.clan.memories.some(
        (m) => m.kind === "perception" && m.category === "promise",
      ),
    ).toBe(true);
    expect(
      s.clan.memories.some(
        (m) =>
          m.kind === "fact" && m.category === "promise" && m.kept === false,
      ),
    ).toBe(true);
  });
  it("歷史記憶、爭議、財產與債務保存到下一代，原遺產不直接均分", () => {
    let s = story();
    s.family.find((m) => m.id === 2)!.age = 30;
    s.dead = true;
    s = transactSetup(s);
    const oldCash = s.cash,
      oldDebt = s.properties[0].debt;
    const next = inherit(s, 2);
    const held = next.clan.estates.find((e) => e.ownerId === 0)!;
    expect(held.finances.cash).toBe(oldCash);
    expect(held.portfolio?.properties[0].debt).toBe(oldDebt);
    expect(next.clan.activeId).toBe(2);
    expect(next.clan.memories.length).toBeGreaterThanOrEqual(
      s.clan.memories.length,
    );
    expect(next.cash).not.toBeCloseTo(net(s) / 2);
    expect(next.properties[0].estateLock).toBe(true);
    expect(() => transact(next, { type: "buy", id: 0 })).toThrow("遺產保管");
  });
  it("v1 存檔遷移不變更資產，v2 來回保存所有人物、記憶與事件", () => {
    const raw = JSON.parse(JSON.stringify(initial()));
    raw.version = 1;
    delete raw.clan;
    const migrated = parseSave(JSON.stringify(raw));
    expect(migrated.version).toBe(4);
    expect(migrated.cash).toBe(raw.cash);
    expect(migrated.clan.background).toBe("legacy");
    const s = story();
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    const corrupt = JSON.parse(JSON.stringify(s));
    corrupt.clan.transactions[0].postings[0].delta = NaN;
    expect(() => parseSave(JSON.stringify(corrupt))).toThrow();
  });
  it("相同背景、動作及固定種子產生相同 NPC 財務與事件，讀檔不補算", () => {
    let a = story(),
      b = story();
    for (let i = 0; i < 4; i++) {
      a = tick(a, steady);
      b = tick(b, steady);
    }
    expect(a).toEqual(b);
    expect(parseSave(JSON.stringify(a))).toEqual(a);
  });
});
function transactSetup(s: ReturnType<typeof initial>) {
  s.properties[0].owned = true;
  s.properties[0].debt = 840000;
  return s;
}
it("退休者探望不扣退休金，工作時間影響只適用在職收入", () => {
  let s = ordinary();
  s.age = 65;
  s = familyAction(s, { type: "visit", personId: 10 });
  s = tick(s, steady);
  expect(s.income).toBe(18000);
  expect(
    s.clan.transactions.filter((t) => t.label.includes("少領薪資")),
  ).toHaveLength(0);
});
