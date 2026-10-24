import { advanceStory } from "./story/engine";
import { validateStory } from "./story/validation";
import type { StoryState } from "./story/types";
import { salary, validateWorld, type World } from "./world/model";
import { advanceWorld } from "./world/engine";
import {
  createClan,
  advanceClan,
  syncActive,
  recordNewMember,
  continueGeneration,
  validateClan,
  recordPortfolioChange,
} from "./family/engine";
import type { Clan } from "./family/types";
import type { CityEvent, CityHistory } from "./cityModel";
import { fictionalMarket } from "./market";
export type Property = {
  id: number;
  name: string;
  kind: "住宅" | "公寓" | "商店";
  value: number;
  rent: number;
  owned: boolean;
  rented: boolean;
  debt: number;
  level: number;
  operating: boolean;
  renovationUntil: number;
  estateLock?: boolean;
};
export type Member = { id: number; name: string; age: number; role: string };
export type State = {
  version: 4;
  story?: StoryState;
  world?: World;
  month: number;
  age: number;
  cash: number;
  properties: Property[];
  prices: number[];
  shares: number[];
  family: Member[];
  dead: boolean;
  climate: string;
  income: number;
  expense: number;
  logs: string[];
  generation: number;
  city: CityHistory;
  clan: Clan;
};
export function initial(): State {
  return {
    version: 4,
    month: 0,
    age: 25,
    cash: 1800000,
    properties: [
      {
        id: 0,
        name: "青禾小宅",
        kind: "住宅",
        value: 1200000,
        rent: 9000,
        owned: false,
        rented: false,
        debt: 0,
        level: 1,
        operating: false,
        renovationUntil: 0,
      },
      {
        id: 1,
        name: "河畔公寓",
        kind: "公寓",
        value: 2800000,
        rent: 21000,
        owned: false,
        rented: false,
        debt: 0,
        level: 1,
        operating: false,
        renovationUntil: 0,
      },
      {
        id: 2,
        name: "轉角商店",
        kind: "商店",
        value: 1900000,
        rent: 15000,
        owned: false,
        rented: false,
        debt: 0,
        level: 1,
        operating: false,
        renovationUntil: 0,
      },
      {
        id: 3,
        name: "日光住宅",
        kind: "住宅",
        value: 1600000,
        rent: 11000,
        owned: false,
        rented: false,
        debt: 0,
        level: 1,
        operating: false,
        renovationUntil: 0,
      },
    ],
    prices: [100, 75, 140],
    shares: [0, 0, 0],
    family: [
      { id: 1, name: "林知夏", age: 25, role: "配偶" },
      { id: 2, name: "林晨", age: 2, role: "子女" },
      { id: 3, name: "林星", age: 0, role: "子女" },
    ],
    dead: false,
    climate: "平穩發展",
    income: 0,
    expense: 0,
    logs: ["第 1 代家主，25 歲，從青禾城開始。"],
    generation: 1,
    city: { sequence: 0, events: [] },
    clan: createClan("legacy", [
      { id: 1, name: "林知夏", age: 25, role: "配偶" },
      { id: 2, name: "林晨", age: 2, role: "子女" },
      { id: 3, name: "林星", age: 0, role: "子女" },
    ]),
  };
}
export const assets = (s: State) =>
  s.cash +
  s.properties.filter((p) => p.owned).reduce((a, p) => a + p.value, 0) +
  s.prices.reduce((a, p, i) => a + p * s.shares[i], 0);
export const debt = (s: State) => s.properties.reduce((a, p) => a + p.debt, 0);
export const net = (s: State) => assets(s) - debt(s);
function emit(s: State, event: Omit<CityEvent, "id" | "month">) {
  s.city ??= { sequence: 0, events: [] };
  s.city.events = [
    ...s.city.events,
    { ...event, id: `${s.generation}:${++s.city.sequence}`, month: s.month },
  ].slice(-40);
}
export const renovationCost = (p: Property) => Math.round(p.value * 0.05);
export const expansionCost = (p: Property) => 150000 * p.level;
export const isUnderConstruction = (s: State, p: Property) =>
  p.renovationUntil > s.month;
function log(s: State, msg: string) {
  s.logs = [`第 ${s.month} 月｜${msg}`, ...s.logs].slice(0, 40);
}
export function tick(input: State, random = Math.random): State {
  if (input.dead) return input;
  const s = structuredClone(input);
  s.month++;
  s.age = (Math.round(s.age * 12) + 1) / 12;
  s.family.forEach((m) => {
    if (s.clan.people.find((p) => p.id === m.id)?.alive === false) return;
    const before = m.age;
    m.age = (Math.round(m.age * 12) + 1) / 12;
    if (before < 85 && m.age >= 85 - 1e-8)
      emit(s, { kind: "death", memberId: m.id, title: `${m.name}辭世` });
  });
  if (!s.world && input.age < 65 && s.age >= 65 - 1e-8)
    emit(s, {
      kind: "retirement",
      memberId: 0,
      title: "家主退休，退休收入開始入帳",
    });
  const market = fictionalMarket.next(s.prices, random);
  s.prices = market.prices;
  s.climate = market.climate;
  advanceWorld(s);
  s.income = s.world
    ? salary(s.world) + s.world.ventureIncome
    : s.age < 65
      ? 52000
      : 18000;
  s.expense =
    (s.world ? 18000 + (s.world.venture ? 2000 : 0) : 28000) +
    s.family.filter((m) => m.role === "子女" && m.id >= 4 && m.age < 18)
      .length *
      3000;
  s.properties.forEach((p) => {
    p.value *= 1 + market.growth;
    if (p.owned) {
      if (p.rented && !isUnderConstruction(s, p)) {
        s.income += p.rent;
        emit(s, {
          kind: "rent",
          propertyId: p.id,
          amount: p.rent,
          title: `${p.name} 收租 +＄${Math.round(p.rent).toLocaleString()}`,
        });
      }
      if (p.operating && !isUnderConstruction(s, p)) {
        const revenue = Math.round(
          6000 * p.level * Math.max(0.5, 1 + market.growth * 10),
        );
        s.income += revenue;
        s.expense += 2500 * p.level;
        emit(s, {
          kind: "business",
          propertyId: p.id,
          amount: revenue - 2500 * p.level,
          title: `${p.name} 營運淨收入 +＄${revenue - 2500 * p.level}`,
        });
      }
      s.expense += p.value * 0.0003 + (p.debt * 0.025) / 12;
    }
  });
  s.cash += s.income - s.expense;
  if (s.age >= 85 - 1e-8) {
    s.dead = true;
    log(s, "家主離世。請選擇下一代。");
    emit(s, {
      kind: "death",
      memberId: 0,
      title: "家主離世，家族等待下一代接班",
    });
  }
  recordPortfolioChange(input, s, "玩家月度收支與市場估值");
  advanceClan(s);
  advanceStory(s);
  log(
    s,
    `收入 ${Math.round(s.income).toLocaleString()}，支出 ${Math.round(s.expense).toLocaleString()}，租金已入帳。`,
  );
  return s;
}
export type Action =
  | {
      type:
        "buy" | "rent" | "sell" | "repay" | "renovate" | "expand" | "operate";
      id: number;
    }
  | { type: "stock"; id: number; quantity: number }
  | { type: "marry" }
  | { type: "birth" };
export function transact(input: State, action: Action): State {
  if (input.dead) throw Error("請先選擇繼承人");
  const s = structuredClone(input);
  if (action.type === "marry" || action.type === "birth") {
    if (s.age < 18 || s.age >= (action.type === "birth" ? 60 : 75))
      throw Error("不符合此家庭事件的年齡條件");
    const spouse = s.family.some((m) => m.role === "配偶" && m.age < 85);
    const cost = action.type === "marry" ? 120000 : 50000;
    if (action.type === "marry" && spouse) throw Error("已有在世配偶");
    if (
      action.type === "birth" &&
      (!spouse || s.family.filter((m) => m.role === "子女").length >= 6)
    )
      throw Error("需有在世配偶，且子女數少於六位");
    if (s.cash < cost) throw Error("家庭準備金不足");
    s.cash -= cost;
    const id = Math.max(3, ...s.clan.people.map((m) => m.id)) + 1;
    const member = {
      id,
      name: action.type === "marry" ? "新伴侶" : `林小${id}`,
      role: action.type === "marry" ? "配偶" : "子女",
      age: action.type === "marry" ? s.age : 0,
    };
    s.family.push(member);
    recordNewMember(s, member, action.type === "marry" ? "marriage" : "birth");
    const title =
      action.type === "marry"
        ? "結婚：家庭準備金支出 120,000 元"
        : `${member.name}誕生：育兒準備金支出 50,000 元`;
    emit(s, {
      kind: action.type === "marry" ? "marriage" : "birth",
      memberId: id,
      amount: -cost,
      title,
    });
    log(s, title);
    syncActive(s);
    return s;
  }
  if (action.type === "stock") {
    if (
      !Number.isInteger(action.quantity) ||
      !action.quantity ||
      action.id < 0 ||
      action.id > 2
    )
      throw Error("無效交易");
    const cost = s.prices[action.id] * action.quantity;
    if (cost > s.cash || s.shares[action.id] + action.quantity < 0)
      throw Error("現金或持股不足");
    s.cash -= cost;
    s.shares[action.id] += action.quantity;
    log(
      s,
      `${action.quantity > 0 ? "買入" : "賣出"}虛構股票 ${Math.abs(action.quantity)} 股`,
    );
    recordPortfolioChange(input, s, "股票交易");
    syncActive(s);
    return s;
  }
  const p = s.properties.find((p) => p.id === action.id);
  if (!p) throw Error("找不到房產");
  if (action.type === "buy") {
    if (p.estateLock) throw Error("此建築仍在遺產保管中，不能重複購入");
    if (p.owned) throw Error("已持有此房產");
    if (s.cash < p.value * 0.3) throw Error("頭期款不足（需 30%）");
    s.cash -= p.value * 0.3;
    p.debt = p.value * 0.7;
    p.owned = true;
    emit(s, {
      kind: "purchase",
      propertyId: p.id,
      amount: -p.value * 0.3,
      title: `取得資產：${p.name}`,
    });
  } else {
    if (!p.owned) throw Error("尚未持有此房產");
    if (action.type === "rent") {
      if (p.operating) throw Error("請先停止自行營運，才能出租");
      if (isUnderConstruction(s, p)) throw Error("施工完成後才能變更出租");
      p.rented = !p.rented;
      emit(s, {
        kind: p.rented ? "move-in" : "vacant",
        propertyId: p.id,
        title: p.rented ? `${p.name} 租客入住` : `${p.name} 已空置`,
      });
    }
    if (action.type === "operate") {
      if (p.kind !== "商店") throw Error("只有商店可以自行營運");
      if (p.rented) throw Error("請先停止出租，才能自行營運");
      if (isUnderConstruction(s, p)) throw Error("施工完成後才能營運");
      p.operating = !p.operating;
      emit(s, {
        kind: "business",
        propertyId: p.id,
        title: p.operating ? "商店開始營運" : "商店停止營運",
      });
    }
    if (action.type === "renovate" || action.type === "expand") {
      if (p.level >= 3) throw Error("建築已達最高等級");
      if (isUnderConstruction(s, p)) throw Error("工程尚未完成");
      if (action.type === "expand" && (p.kind !== "商店" || !p.operating))
        throw Error("請先啟動商店營運");
      const cost =
        action.type === "expand" ? expansionCost(p) : renovationCost(p);
      if (s.cash < cost) throw Error("工程款不足");
      s.cash -= cost;
      p.value += cost * 0.7;
      p.rent = Math.round(p.rent * 1.1);
      p.level++;
      p.renovationUntil = s.month + 2;
      emit(s, {
        kind: action.type === "expand" ? "expansion" : "renovation",
        propertyId: p.id,
        amount: -cost,
        title: `${p.name} ${action.type === "expand" ? "企業擴張" : "翻修"} Lv.${p.level}，工程款 ＄${Math.round(cost).toLocaleString()}`,
      });
    }
    if (action.type === "sell") {
      if (s.cash + p.value * 0.98 - p.debt < 0)
        throw Error("現金不足以清償賣出後債務");
      s.cash += p.value * 0.98 - p.debt;
      p.owned = false;
      p.rented = false;
      p.operating = false;
      p.debt = 0;
      emit(s, { kind: "sale", propertyId: p.id, title: `${p.name} 已出售` });
    }
    if (action.type === "repay") {
      const amount = Math.min(100000, p.debt, Math.max(0, s.cash));
      if (amount <= 0) throw Error("無可償還房貸或現金不足");
      p.debt -= amount;
      s.cash -= amount;
    }
  }
  log(
    s,
    `${p.name}：${{ buy: "購入（七成房貸）", rent: p.rented ? "開始出租" : "停止出租", sell: "售出（手續費 2%）", repay: "償還房貸", renovate: "翻修施工", expand: "企業擴張", operate: p.operating ? "自行營運" : "停止營運" }[action.type]}`,
  );
  recordPortfolioChange(input, s, `房產交易：${action.type}`);
  syncActive(s);
  return s;
}
// Adult gameplay successors; this is NOT the legal-heir determination engine.
export const heirs = (s: State) =>
  s.family.filter((m) => m.role === "子女" && m.age >= 18 && m.age < 85);
export function inherit(input: State, id: number): State {
  const next = continueGeneration(input, id);
  if (next.world) {
    const w = next.world;
    w.previousCareers.push(w.job);
    w.name = next.clan.people.find((p) => p.id === id)!.name;
    w.job = "";
    w.experience = 0;
    w.paid = 0;
    w.venture = false;
    w.ventureIncome = 0;
    w.skill = w.talent[id] ?? 8;
    w.npcs.forEach((n) => {
      n.met = false;
      n.trust = 0;
      n.lastChat = -1;
    });
  }
  return next;
}
export function parseSave(raw: string): State {
  const s = JSON.parse(raw) as State;
  const validNumber = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n);
  if (
    ![1, 2, 3, 4].includes((s as { version: number }).version) ||
    !validNumber(s.cash) ||
    !validNumber(s.age) ||
    s.age < 0 ||
    !validNumber(s.month) ||
    !Number.isInteger(s.month) ||
    !Number.isInteger(s.generation) ||
    typeof s.dead !== "boolean" ||
    typeof s.climate !== "string" ||
    !validNumber(s.income) ||
    !validNumber(s.expense) ||
    !Array.isArray(s.properties) ||
    s.properties.length !== 4 ||
    !Array.isArray(s.prices) ||
    s.prices.length !== 3 ||
    !s.prices.every((p) => validNumber(p) && p > 0) ||
    !Array.isArray(s.shares) ||
    s.shares.length !== 3 ||
    !s.shares.every((p) => Number.isInteger(p) && p >= 0) ||
    !Array.isArray(s.family) ||
    !s.family.every(
      (m) =>
        validNumber(m.age) &&
        typeof m.name === "string" &&
        typeof m.role === "string" &&
        Number.isInteger(m.id),
    ) ||
    !Array.isArray(s.logs) ||
    !s.logs.every((l) => typeof l === "string") ||
    !s.properties.every(
      (p, i) =>
        p.id === i &&
        typeof p.name === "string" &&
        ["住宅", "公寓", "商店"].includes(p.kind) &&
        validNumber(p.value) &&
        p.value > 0 &&
        validNumber(p.rent) &&
        p.rent >= 0 &&
        validNumber(p.debt) &&
        p.debt >= 0 &&
        typeof p.owned === "boolean" &&
        typeof p.rented === "boolean",
    )
  )
    throw Error("存檔格式無效或版本不支援");
  s.city ??= { sequence: 0, events: [] };
  for (const p of s.properties) {
    p.level ??= 1;
    p.operating ??= false;
    p.renovationUntil ??= 0;
  }
  if (
    !Number.isInteger(s.city.sequence) ||
    s.city.sequence < 0 ||
    !Array.isArray(s.city.events) ||
    s.city.events.length > 40 ||
    !s.city.events.every(
      (e) =>
        typeof e.id === "string" &&
        typeof e.title === "string" &&
        Number.isInteger(e.month) &&
        [
          "purchase",
          "move-in",
          "vacant",
          "rent",
          "sale",
          "renovation",
          "business",
          "expansion",
          "marriage",
          "birth",
          "retirement",
          "death",
          "succession",
          "family",
        ].includes(e.kind) &&
        (e.amount === undefined || validNumber(e.amount)) &&
        (e.placeId === undefined ||
          (Number.isInteger(e.placeId) && e.placeId >= 0 && e.placeId <= 9)) &&
        (e.propertyId === undefined ||
          (Number.isInteger(e.propertyId) &&
            e.propertyId >= 0 &&
            e.propertyId < 4)),
    ) ||
    !s.properties.every(
      (p) =>
        Number.isInteger(p.level) &&
        p.level >= 1 &&
        p.level <= 3 &&
        typeof p.operating === "boolean" &&
        (!p.operating || (p.owned && p.kind === "商店" && !p.rented)) &&
        Number.isInteger(p.renovationUntil) &&
        p.renovationUntil >= 0,
    )
  )
    throw Error("城市存檔資料無效");
  if ((s as { version: number }).version === 1 && !s.clan)
    s.clan = createClan("legacy", s.family, s.age);
  validateClan(s.clan);
  if (s.world) validateWorld(s.world);
  if (s.story) validateStory(s);
  s.version = 4;
  return s;
}
