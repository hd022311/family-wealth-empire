import { describe, it, expect } from "vitest";
import {
  initial,
  tick,
  transact,
  net,
  inherit,
  parseSave,
  heirs,
} from "./simulation";
describe("家族模擬", () => {
  it("購房維持淨資產，租金扣除利息維護費後入帳", () => {
    const s = initial();
    const bought = transact(s, { type: "buy", id: 0 });
    expect(net(bought)).toBeCloseTo(net(s));
    expect(s.properties[0].owned).toBe(false);
    const rented = transact(bought, { type: "rent", id: 0 });
    const next = tick(rented, () => 0.5);
    expect(next.income).toBe(61000);
    expect(next.expense).toBeCloseTo(28000 + 360 + 1750);
    expect(next.cash).toBeCloseTo(rented.cash + 61000 - next.expense);
  });
  it("股票買賣維持淨資產，拒絕超賣與不足頭款", () => {
    const s = initial();
    const b = transact(s, { type: "stock", id: 0, quantity: 100 });
    expect(net(b)).toBeCloseTo(net(s));
    expect(transact(b, { type: "stock", id: 0, quantity: -100 }).cash).toBe(
      s.cash,
    );
    expect(() =>
      transact(s, { type: "stock", id: 0, quantity: -100 }),
    ).toThrow();
    s.cash = 0;
    expect(() => transact(s, { type: "buy", id: 0 })).toThrow();
  });
  it("償還本金不改變淨資產，賣出結清債務並扣手續費", () => {
    let s = transact(initial(), { type: "buy", id: 0 });
    const before = net(s);
    s = transact(s, { type: "repay", id: 0 });
    expect(s.properties[0].debt).toBe(740000);
    expect(net(s)).toBeCloseTo(before);
    s = transact(s, { type: "sell", id: 0 });
    expect(s.properties[0].debt).toBe(0);
    expect(net(s)).toBeCloseTo(before - 24000);
  });
  it("720 個月為一生，死亡停止交易及時間，遺產保管且下一代只接續個人資產", () => {
    let s = initial();
    for (let i = 0; i < 720; i++) s = tick(s, () => 0.5);
    expect(s.dead).toBe(true);
    expect(s.age).toBeCloseTo(85);
    expect(tick(s)).toBe(s);
    expect(() => transact(s, { type: "buy", id: 0 })).toThrow();
    const choices = heirs(s);
    expect(choices.length).toBe(2);
    const next = inherit(s, choices[0].id);
    const estate = next.clan.estates.find((e) => e.ownerId === 0)!;
    expect(estate.finances.cash).toBeCloseTo(s.cash);
    expect(next.cash).toBeCloseTo(
      s.clan.people.find((p) => p.id === choices[0].id)!.finances.cash +
        s.clan.people.find((p) => p.id === choices[0].id)!.finances.stocks,
    );
    expect(estate.status).toBe("awaiting-facts");
    expect(next.generation).toBe(2);
    expect(next.properties.every((p) => !p.owned && p.debt === 0)).toBe(true);
  });
  it("存檔往返並拒絕損壞資料", () => {
    const s = initial();
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    expect(() => parseSave("{}")).toThrow();
    s.prices = [-1, 2, 3];
    expect(() => parseSave(JSON.stringify(s))).toThrow();
  });
  it("負遺產不傳遞負現金，沒有成年子女不得繼承", () => {
    let s = initial();
    s.dead = true;
    expect(() => inherit(s, 2)).toThrow();
    s.family[1].age = 30;
    s.cash = -100;
    const n = inherit(s, 2);
    expect(n.cash).toBe(0);
  });
});
