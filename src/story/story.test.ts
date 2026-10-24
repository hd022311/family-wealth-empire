import { prepareFutureEvent } from "./legalEvents";
import { describe, it, expect } from "vitest";
import { createAdventure, type Setup } from "../modes/create";
import { initial, tick, assets, parseSave, transact } from "../simulation";
import { openEstate, relationship } from "../family/engine";
import { worldAction } from "../world/engine";
import { storyAction, advanceStory } from "./engine";
import { storyChapters } from "./definitions";
const config: Setup = {
  mode: "story",
  name: "林家安",
  familyName: "測試家族",
  background: "ordinary",
  age: 30,
  spouse: true,
  children: 2,
};
const start = () => createAdventure(config);
const go = (s: ReturnType<typeof start>, place: number) =>
  worldAction(s, { type: "travel", place });
function care() {
  let s = go(start(), 8);
  s = storyAction(s, { type: "checkup", parentId: 10 });
  s = storyAction(s, { type: "choose-care", plan: "shared" });
  return s;
}
describe("兩間房子的承諾：可玩垂直切片", () => {
  it("兩間房屋分別歸父母，兩名手足都有家庭；租金不歸玩家", () => {
    const s = start();
    expect(s.story!.houses.map((h) => h.ownerId)).toEqual([10, 11]);
    expect(s.family.filter((p) => p.role === "手足")).toHaveLength(2);
    expect(
      s.clan.links.some(
        (l) => l.from === 15 && l.to === 16 && l.kind === "spouse",
      ),
    ).toBe(true);
    const next = tick(s, () => 0.5);
    expect(assets(next)).toBe(next.cash);
    expect(next.story!.houses[1].lastRentMonth).toBe(1);
    const motherBefore = s.clan.people.find((p) => p.id === 11)!.finances.cash;
    expect(
      next.clan.people.find((p) => p.id === 11)!.finances.cash - motherBefore,
    ).toBe(18000 - 20000 + 24000 - 1500);
    expect(next.income).toBe(43400);
    expect(next.cash - s.cash).toBe(43400 - 18000 - 10000);
  });
  it("場所、每月時間與重複訪問限制；陪伴改變關係與長期記憶", () => {
    let s = start();
    expect(() => storyAction(s, { type: "visit", personId: 10 })).toThrow();
    s = go(s, 8);
    const before = relationship(structuredClone(s.clan), 0, 10).trust;
    s = storyAction(s, { type: "visit", personId: 10 });
    expect(s.cash).toBe(1798800);
    expect(s.story!.time.spent).toBe(4);
    expect(relationship(s.clan, 0, 10).trust).toBeGreaterThan(before);
    expect(() => storyAction(s, { type: "visit", personId: 10 })).toThrow();
    expect(() =>
      storyAction(s, { type: "plan", care: 24, family: 16, overtime: 16 }),
    ).toThrow();
    expect(s.clan.memories.some((m) => m.text.includes("相聚"))).toBe(true);
  });
  it("工作、照顧、休息與家庭時間有實際月度影響，未就業不產生加班費", () => {
    let s = start();
    s = storyAction(s, { type: "plan", care: 12, family: 0, overtime: 8 });
    const before = relationship(structuredClone(s.clan), 0, 1).conflict;
    s = tick(s, () => 0.5);
    expect(s.story!.lastSalary).toEqual({
      base: 42000,
      bonus: 2800,
      lost: 3000,
      housing: 10000,
    });
    expect(s.income).toBe(41800);
    expect(relationship(s.clan, 0, 1).conflict).toBeGreaterThan(before);
    s.world!.job = "";
    s = tick(s, () => 0.5);
    expect(s.income).toBe(0);
    expect(s.story!.lastSalary.lost).toBe(0);
  });
  it("父母健檢→照顧→手足自主回應→健康改善結案，之後仍可交易與生活", () => {
    let s = care();
    expect(s.story!.episode!.status).toBe("active");
    expect(s.story!.episode!.responses).toHaveLength(2);
    expect(
      s.story!.episode!.responses.some((r) => r.money === 0 && r.hours > 0),
    ).toBe(true);
    expect(() => storyAction(s, { type: "ask-siblings" })).toThrow();
    for (let i = 0; i < 5; i++) s = tick(s, () => 0.5);
    expect(s.story!.episode!.status).toBe("completed");
    expect(s.story!.completedEpisodes).toHaveLength(1);
    expect(s.story!.time.care).toBe(0);
    expect(s.clan.people.find((p) => p.id === 10)!.alive).toBe(true);
    s = transact(s, { type: "stock", id: 0, quantity: 100 });
    expect(s.shares[0]).toBe(100);
    const month = s.month;
    s = tick(s, () => 0.5);
    expect(s.month).toBe(month + 1);
    expect(s.dead).toBe(false);
  });
  it("三種照顧方案都可依財務與時間條件完成，沒有唯一正解", () => {
    for (const plan of ["professional", "shared", "personal"] as const) {
      let s = go(start(), 8);
      s = storyAction(s, { type: "checkup", parentId: 10 });
      s = storyAction(s, { type: "choose-care", plan });
      for (let i = 0; i < 4; i++) s = tick(s, () => 0.5);
      expect(s.story!.episode!.status).toBe("completed");
      expect(s.clan.people.find((p) => p.id === 10)!.alive).toBe(true);
    }
  });
  it("相同種子與財務條件可重現；手足現金緊張時不強制掏錢且每筆交易平衡", () => {
    let a = care(),
      b = care();
    for (let i = 0; i < 4; i++) {
      a = tick(a, () => 0.5);
      b = tick(b, () => 0.5);
    }
    expect(a).toEqual(b);
    expect(
      a.clan.transactions.every(
        (t) => Math.abs(t.postings.reduce((sum, p) => sum + p.delta, 0)) < 0.01,
      ),
    ).toBe(true);
    expect(a.story!.episode!.responses[0].money).toBe(0);
  });
  it("醫療預算不足仍可改方案，不自動借貸、分產或製造保險金", () => {
    let s = care();
    s.cash = 0;
    s.world!.job = "";
    s.story!.time.overtime = 0;
    s.clan.people.find((p) => p.id === 10)!.finances.cash = 0;
    s.clan.people.find((p) => p.id === 10)!.finances.income = 0;
    for (const id of [12, 15]) {
      const p = s.clan.people.find((p) => p.id === id)!;
      p.finances.cash = 0;
      p.finances.income = 0;
    }
    s = tick(s, () => 0.5);
    expect(s.story!.episode!.unmetMoney).toBeGreaterThan(0);
    expect(s.properties.some((p) => p.owned)).toBe(false);
    expect(s.clan.estates).toHaveLength(0);
    expect(
      s.story!.parentWishes.every((w) => w.legalStatus === "intention-only"),
    ).toBe(true);
  });
  it("持續缺乏醫療資源且健康耗盡時，死亡僅建立該父母的獨立清冊", () => {
    let s = care();
    s.cash = 0;
    s.world!.job = "";
    const p = s.clan.people.find((p) => p.id === 10)!;
    p.health = 1;
    p.finances.cash = 0;
    p.finances.income = 0;
    for (const id of [12, 15]) {
      const npc = s.clan.people.find((p) => p.id === id)!;
      npc.finances.cash = 0;
      npc.finances.income = 0;
    }
    s = tick(s, () => 0.5);
    expect(s.story!.episode!.status).toBe("bereaved");
    expect(s.clan.people.find((p) => p.id === 10)!.alive).toBe(false);
    expect(s.clan.people.find((p) => p.id === 11)!.alive).toBe(true);
    expect(s.clan.estates).toHaveLength(1);
    expect(s.clan.estates[0].ownerId).toBe(10);
  });
  it("修繕由指定帳戶支出、施工停租一個月、次月恢復，不改所有權", () => {
    let s = go(start(), 9);
    const player = s.cash,
      mother = s.clan.people.find((p) => p.id === 11)!.finances.cash;
    s = storyAction(s, { type: "repair", place: 9, funding: "parent" });
    expect(s.cash).toBe(player);
    expect(s.clan.people.find((p) => p.id === 11)!.finances.cash).toBe(
      mother - 8000,
    );
    expect(s.story!.houses[1].ownerId).toBe(11);
    s = tick(s, () => 0.5);
    const nextCash = s.clan.people.find((p) => p.id === 11)!.finances.cash;
    expect(
      s.city.events.filter((e) => e.placeId === 9 && e.kind === "rent"),
    ).toHaveLength(0);
    s = tick(s, () => 0.5);
    expect(
      s.clan.people.find((p) => p.id === 11)!.finances.cash - nextCash,
    ).toBe(18000 - 20000 + 24000 - 1500);
  });
  it("存讀檔、月結冪等與 v1/v2/v3 遷移保留既有資產，不注入父母房屋", () => {
    const s = tick(care(), () => 0.5);
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    const duplicate = structuredClone(s);
    advanceStory(duplicate);
    expect(duplicate).toEqual(s);
    for (const version of [1, 2, 3]) {
      const old = { ...initial(), version };
      const loaded = parseSave(JSON.stringify(old));
      expect(loaded.version).toBe(4);
      expect(loaded.cash).toBe(old.cash);
      expect(loaded.story).toBeUndefined();
    }
    const oldStory = start();
    delete oldStory.story;
    const migrated = parseSave(JSON.stringify({ ...oldStory, version: 3 }));
    expect(migrated.story).toBeUndefined();
    expect(migrated.clan).toEqual(oldStory.clan);
  });
  it("劇情與自由模式隔離；非法房屋、事件與時間存檔拒絕", () => {
    const s = start(),
      free = createAdventure({ ...config, mode: "free" });
    expect(free.story).toBeUndefined();
    expect(() =>
      storyAction(free, { type: "checkup", parentId: 10 }),
    ).toThrow();
    expect(() => go(free, 8)).toThrow();
    const bad = structuredClone(s);
    bad.story!.houses[1].ownerId = 999;
    expect(() => parseSave(JSON.stringify(bad))).toThrow();
    const badTime = structuredClone(s);
    badTime.story!.time.spent = 100;
    expect(() => parseSave(JSON.stringify(badTime))).toThrow();
    expect(createAdventure({ ...config, mode: "free" })).toEqual(free);
  });
  it("後續遺囑、保險與處分限制事件僅可檢視待核實資料，不能生效", () => {
    const s = start(),
      before = JSON.stringify(s);
    const intent = prepareFutureEvent(s, {
      kind: "parent-intention",
      ownerId: 10,
      beneficiaryId: 0,
      houseIds: ["parents-home", "parents-rental"],
    });
    expect(intent.disputes).toHaveLength(1);
    expect(intent.willDistribution).toBeNull();
    expect(intent.effects).toEqual([]);
    const insurance = prepareFutureEvent(s, {
      kind: "insurance-review",
      policyholderId: 10,
      insuredId: 10,
      beneficiaryId: 0,
      policyDocumentId: "未驗證的虛構文件",
    });
    expect(insurance.insurancePayout).toBeNull();
    expect(insurance.tax).toBeNull();
    expect(JSON.stringify(s)).toBe(before);
    const e = openEstate(s, 10);
    const restricted = prepareFutureEvent(s, {
      kind: "asset-restriction-review",
      estateId: e.id,
      houseId: "parents-home",
      procedureDocumentId: "尚待核實",
    });
    expect(restricted.restrictions).toEqual([]);
    expect(restricted.effects).toEqual([]);
    expect(restricted.applicableDate).toBe(e.deathDate);
    expect(restricted.requirements[0].sources[0].verification).toBe("pending");
  });
  it("父母先後死亡各有獨立清冊；租金可進個別遺產帳，不合併、不分給玩家或假定全凍結", () => {
    let s = start();
    const player = s.cash;
    const father = openEstate(s, 10);
    expect(s.cash).toBe(player);
    s = tick(s, () => 0.5);
    const beforeMother = s.cash;
    const mother = openEstate(s, 11);
    expect(father.deathDate).not.toBe(mother.deathDate);
    expect(
      father.facts.heirs.some((h) => h.id === 11 && h.relation === "spouse"),
    ).toBe(true);
    expect(
      mother.facts.heirs.some((h) => h.id === 10 && h.relation === "spouse"),
    ).toBe(false);
    expect(father.id).not.toBe(mother.id);
    expect(father.storyProperties!.map((h) => h.ownerId)).toEqual([10]);
    expect(mother.storyProperties!.map((h) => h.ownerId)).toEqual([11]);
    expect(father.finances.home).toBe(9600000);
    expect(mother.finances.home).toBe(6400000);
    expect(s.cash).toBe(beforeMother);
    expect(s.story!.houses.every((h) => h.restrictions.length === 0)).toBe(
      true,
    );
    expect(father.facts.ownershipConfirmed).toBe(false);
    const balance = mother.finances.cash;
    s = tick(s, () => 0.5);
    expect(s.clan.estates.find((e) => e.id === mother.id)!.finances.cash).toBe(
      balance + 24000 - 1500,
    );
    expect(parseSave(JSON.stringify(s)).clan.estates).toHaveLength(2);
    expect(storyChapters.filter((c) => c.status === "framework")).toHaveLength(
      4,
    );
  });
});
