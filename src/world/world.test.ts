import { describe, it, expect } from "vitest";
import { createAdventure, type Setup } from "../modes/create";
import {
  initial,
  tick,
  parseSave,
  assets,
  inherit,
  transact,
} from "../simulation";
import { familyAction } from "../family/engine";
import { worldAction } from "./engine";
import { pathTo } from "./navigation";
const config: Setup = {
  mode: "story",
  name: "測試玩家",
  familyName: "測試家族",
  background: "ordinary",
  age: 25,
  spouse: true,
  children: 1,
};
describe("雙模式開放世界", () => {
  it("劇情30歲、兩名手足、父母資產獨立；自由設定不影響劇情", () => {
    const s = createAdventure(config);
    expect(s.age).toBe(30);
    expect(s.family.filter((m) => m.role === "手足")).toHaveLength(2);
    expect(
      s.clan.people.find((p) => p.id === 10)!.finances.home,
    ).toBeGreaterThan(0);
    expect(assets(s)).toBe(s.cash);
    const f = createAdventure({
      ...config,
      mode: "free",
      background: "self-made",
      spouse: false,
      children: 0,
      age: 21,
    });
    expect(f.age).toBe(21);
    expect(f.cash).toBe(300000);
    expect(f.clan.people.find((p) => p.id === 10)!.alive).toBe(false);
  });
  it("求職→領薪→社交→商機→購入資產的財務可保存", () => {
    let s = createAdventure({ ...config, mode: "free" });
    s = worldAction(s, { type: "travel", place: 5 });
    s = worldAction(s, { type: "job", job: "office" });
    expect(s.income).toBe(0);
    s = tick(s, () => 0.5);
    expect(s.world!.paid).toBe(1);
    expect(s.income).toBe(42000);
    const n = s.world!.npcs[0];
    s = worldAction(s, { type: "travel", place: n.place });
    s = worldAction(s, { type: "chat", id: n.id });
    expect(() => worldAction(s, { type: "chat", id: n.id })).toThrow();
    s = worldAction(s, { type: "travel", place: 7 });
    const cash = s.cash;
    s = worldAction(s, { type: "venture" });
    expect(s.cash).toBe(cash - 30000);
    s = tick(s, () => 0.5);
    expect(s.world!.ventureIncome).toBeGreaterThanOrEqual(0);
    s = transact(s, { type: "buy", id: 0 });
    s = transact(s, { type: "rent", id: 0 });
    s = familyAction(s, { type: "visit", personId: 10 });
    expect(s.properties[0].owned).toBe(true);
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    expect(s.clan.transactions.length).toBeGreaterThan(2);
  });
  it("固定種子自主世界，NPC不需互動亦領薪成長；離線讀檔不補算", () => {
    let a = createAdventure(config),
      b = createAdventure(config);
    const old = a.world!.npcs[0].cash;
    for (let i = 0; i < 12; i++) {
      a = tick(a, () => 0.5);
      b = tick(b, () => 0.5);
    }
    expect(a.world).toEqual(b.world);
    expect(a.world!.npcs[0].cash).not.toBe(old);
    expect(a.world!.npcs[0].met).toBe(false);
    expect(parseSave(JSON.stringify(a)).age).toBe(a.age);
  });
  it("場所、能力、現金與不可通行格限制行動", () => {
    const s = createAdventure(config);
    expect(() => worldAction(s, { type: "train" })).toThrow();
    expect(() => worldAction(s, { type: "move", x: 1, y: 1 })).toThrow();
    expect(pathTo({ x: 1, y: 2 }, { x: 7, y: 2 }).length).toBeGreaterThan(6);
    expect(() => worldAction(s, { type: "job", job: "finance" })).toThrow();
    const w = worldAction(s, { type: "move", x: 3, y: 3 });
    expect(w.world!.place).toBe(-1);
    expect(parseSave(JSON.stringify(w)).world!.position).toEqual({
      x: 3,
      y: 3,
    });
  });
  it("v2存檔保留舊薪資；無效模式存檔拒絕", () => {
    const old = { ...initial(), version: 2 };
    expect(tick(parseSave(JSON.stringify(old)), () => 0.5).income).toBe(52000);
    const s = createAdventure(config);
    s.world!.seed = NaN;
    expect(() => parseSave(JSON.stringify(s))).toThrow();
  });
  it("接班保留世界歷史但不直接繼承事業、職位及人脈", () => {
    const s = createAdventure(config);
    s.dead = true;
    s.age = 85;
    s.family.find((m) => m.id === 2)!.age = 30;
    s.clan.people.find((m) => m.id === 2)!.age = 30;
    s.world!.venture = true;
    const n = inherit(s, 2);
    expect(n.world!.mode).toBe("story");
    expect(n.world!.venture).toBe(false);
    expect(n.world!.job).toBe("");
    expect(n.clan.estates.length).toBeGreaterThan(0);
  });
});
