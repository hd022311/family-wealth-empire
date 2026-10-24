import { describe, it, expect } from "vitest";
import {
  initial,
  transact,
  tick,
  parseSave,
  net,
  inherit,
  renovationCost,
  expansionCost,
} from "./simulation";
import {
  ageAppearance,
  clampZoom,
  environmentAt,
  readCitySettings,
} from "./cityModel";
import { makeSlot, readLibrary, LIBRARY_KEY } from "./saves";
const stable = () => 0.5;
describe("動態城市與財務同源", () => {
  it("購屋與租客事件只在交易成功後產生，每月收租事件對應真實收入", () => {
    const original = initial(),
      bought = transact(original, { type: "buy", id: 0 });
    expect(original.city.events).toHaveLength(0);
    expect(bought.city.events.at(-1)?.kind).toBe("purchase");
    expect(bought.cash).toBe(original.cash - 360000);
    const rented = transact(bought, { type: "rent", id: 0 });
    expect(rented.city.events.at(-1)?.kind).toBe("move-in");
    const next = tick(rented, stable);
    expect(next.city.events.at(-1)).toMatchObject({
      kind: "rent",
      propertyId: 0,
      amount: 9000,
    });
    expect(next.cash - rented.cash).toBeCloseTo(next.income - next.expense);
    const poor = initial();
    poor.cash = 0;
    expect(() => transact(poor, { type: "buy", id: 0 })).toThrow();
    expect(poor.city.events).toHaveLength(0);
  });
  it("翻修扣款、提升市值租金、施工暫停收租，完成後回復；不可免費升級", () => {
    let s = transact(transact(initial(), { type: "buy", id: 0 }), {
      type: "rent",
      id: 0,
    });
    const cash = s.cash,
      cost = renovationCost(s.properties[0]),
      worth = net(s);
    s = transact(s, { type: "renovate", id: 0 });
    expect(s.cash).toBe(cash - cost);
    expect(s.properties[0].level).toBe(2);
    expect(s.properties[0].rent).toBe(9900);
    expect(net(s)).toBeCloseTo(worth - cost * 0.3);
    expect(() => transact(s, { type: "renovate", id: 0 })).toThrow(
      "工程尚未完成",
    );
    s = tick(s, stable);
    expect(s.income).toBe(52000);
    s = tick(s, stable);
    expect(s.income).toBe(61900);
    expect(s.city.events.at(-1)).toMatchObject({ kind: "rent", amount: 9900 });
  });
  it("商店營運排除重複出租收益，擴張變更成本、收入及資產", () => {
    let s = transact(initial(), { type: "buy", id: 2 });
    s = transact(s, { type: "operate", id: 2 });
    expect(() => transact(s, { type: "rent", id: 2 })).toThrow("停止自行營運");
    const next = tick(s, stable);
    expect(next.income).toBe(58000);
    expect(next.expense).toBeCloseTo(
      28000 + 2500 + 1900000 * 0.0003 + (1330000 * 0.025) / 12,
    );
    const cash = s.cash,
      cost = expansionCost(s.properties[2]);
    s = transact(s, { type: "expand", id: 2 });
    expect(s.cash).toBe(cash - cost);
    expect(s.properties[2].level).toBe(2);
    s = tick(s, stable);
    expect(s.income).toBe(52000);
    s = tick(s, stable);
    expect(s.income).toBe(64000);
    expect(s.city.events.at(-1)).toMatchObject({
      kind: "business",
      amount: 7000,
    });
  });
  it("婚育具有真實費用，年齡外觀及退休、死亡、接班事件由時間狀態觸發", () => {
    let s = initial();
    expect(() => transact(s, { type: "marry" })).toThrow("已有在世配偶");
    s.family = s.family.filter((m) => m.role !== "配偶");
    const before = s.cash;
    s = transact(s, { type: "marry" });
    s = transact(s, { type: "birth" });
    expect(s.cash).toBe(before - 170000);
    expect(s.family.at(-1)?.age).toBe(0);
    expect(tick(s, stable).expense).toBe(31000);
    s.age = 64 + 11 / 12;
    s = tick(s, stable);
    expect(s.city.events.some((e) => e.kind === "retirement")).toBe(true);
    expect(s.income).toBe(18000);
    s.age = 84 + 11 / 12;
    s.family.find((m) => m.role === "子女")!.age = 60;
    s = tick(s, stable);
    expect(s.dead).toBe(true);
    expect(s.city.events.at(-1)?.kind).toBe("death");
    expect(tick(s)).toBe(s);
    expect(inherit(s, 2).city.events[0].kind).toBe("succession");
    expect([2, 12, 25, 70].map(ageAppearance)).toEqual([
      "baby",
      "child",
      "adult",
      "elder",
    ]);
  });
  it("舊版存檔補齊城市欄位，升級與事件保存於家族庫，損壞城市資料被拒絕", () => {
    const old = JSON.parse(JSON.stringify(initial()));
    delete old.city;
    old.properties.forEach((p: Record<string, unknown>) => {
      delete p.level;
      delete p.operating;
      delete p.renovationUntil;
    });
    const migrated = parseSave(JSON.stringify(old));
    expect(migrated.city.events).toEqual([]);
    expect(migrated.properties[0].level).toBe(1);
    const slot = makeSlot("舊家族", old);
    const lib = readLibrary({
      getItem: (k) =>
        k === LIBRARY_KEY
          ? JSON.stringify({ version: 1, active: slot.id, slots: [slot] })
          : null,
    });
    expect(lib.slots[0].state.properties[0].level).toBe(1);
    migrated.properties[0].level = 99;
    expect(() => parseSave(JSON.stringify(migrated))).toThrow("城市存檔");
  });
  it("環境設定不修改遊戲，不補算離線；縮放限制及減少動態模式安全", () => {
    const settings = readCitySettings({ getItem: () => null });
    const s = initial(),
      before = JSON.stringify(s);
    expect(environmentAt(60000, settings).phase).toBe("night");
    expect(environmentAt(50000, settings).weather).toBe("cloudy");
    expect(environmentAt(999999, { ...settings, reducedMotion: true })).toEqual(
      environmentAt(0, settings),
    );
    expect(JSON.stringify(s)).toBe(before);
    expect(clampZoom(9)).toBe(1.8);
    expect(clampZoom(0.1)).toBe(0.7);
    expect(
      readCitySettings({ getItem: () => "{bad" }, true, true).quality,
    ).toBe("low");
  });
});
