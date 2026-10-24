import { salary } from "../world/model";
import type { State, Member } from "../simulation";
import type {
  Background,
  Clan,
  Person,
  Finances,
  Memory,
  FamilyAction,
  Relation,
  Decision,
  Estate,
  Portfolio,
} from "./types";
import type { Heir } from "../legal/engine";
export const zeroFinances = (): Finances => ({
  cash: 0,
  home: 0,
  stocks: 0,
  business: 0,
  debt: 0,
  income: 0,
  expenses: 0,
});
function random(clan: Clan) {
  clan.seed = (Math.imul(clan.seed, 1664525) + 1013904223) >>> 0;
  return clan.seed / 4294967296;
}
function person(id: number, name: string, age: number, seed: number): Person {
  return {
    id,
    name,
    age,
    alive: age < 85,
    health: 85,
    traits: {
      duty: 40 + (seed % 51),
      autonomy: 30 + ((seed * 7) % 61),
      security: 35 + ((seed * 3) % 61),
      empathy: 25 + ((seed * 11) % 71),
    },
    values: {
      home: 30 + ((seed * 13) % 61),
      fairness: 40 + ((seed * 17) % 51),
      legacy: 45 + ((seed * 19) % 51),
    },
    risk: 20 + ((seed * 5) % 70),
    goal:
      id === 12
        ? "維持房貸與子女教育"
        : id === 10
          ? "保留祖厝與生活自主"
          : "維持健康與家庭安全",
    responsibilities: [],
    finances: zeroFinances(),
  };
}
export function createClan(
  background: Background,
  members: Member[],
  age = 25,
): Clan {
  const c: Clan = {
    version: 1,
    background,
    activeId: 0,
    seed: 20261023,
    sequence: 0,
    people: [
      person(0, "家主", age, 7),
      ...members.map((m) => person(m.id, m.name, m.age, m.id * 23)),
    ],
    links: members.flatMap<import("./types").Link>((m) =>
      m.role === "配偶"
        ? [{ from: 0, to: m.id, kind: "spouse" as const }]
        : m.role === "子女"
          ? [
              { from: 0, to: m.id, kind: "parent" as const },
              { from: 1, to: m.id, kind: "parent" as const },
            ]
          : [],
    ),
    relations: [],
    memories: [],
    transactions: [],
    promises: [],
    loans: [],
    episode: null,
    estates: [],
    playerHealth: 100,
    workPenaltyMonths: 0,
    lastNotice: "家庭背景可在家族面板選擇；既有資產不會被自動改寫。",
  };
  if (background !== "legacy") {
    const father = person(10, "林建國", 61, 15),
      mother = person(11, "陳玉蘭", 59, 17),
      sibling = person(12, "林承安", 30, 19),
      partner = person(13, "王怡君", 30, 21),
      niece = person(14, "林小雨", 6, 24);
    father.alive = mother.alive = background !== "self-made";
    if (background === "wealthy") {
      father.finances = {
        cash: 3000000,
        home: 18000000,
        stocks: 9000000,
        business: 12000000,
        debt: 4000000,
        income: 100000,
        expenses: 45000,
      };
      mother.finances = {
        cash: 2000000,
        home: 6000000,
        stocks: 2000000,
        business: 0,
        debt: 0,
        income: 30000,
        expenses: 24000,
      };
    }
    if (background === "ordinary") {
      father.finances = {
        cash: 600000,
        home: 4800000,
        stocks: 0,
        business: 0,
        debt: 0,
        income: 20000,
        expenses: 18000,
      };
      mother.finances = {
        cash: 400000,
        home: 0,
        stocks: 0,
        business: 0,
        debt: 0,
        income: 16000,
        expenses: 16000,
      };
    }
    sibling.finances = {
      cash: 85000,
      home: 2800000,
      stocks: 20000,
      business: 0,
      debt: 1800000,
      income: 48000,
      expenses: 45500,
    };
    sibling.responsibilities = ["房貸每月利息", "子女教育費", "照顧分工"];
    partner.finances = {
      cash: 40000,
      home: 0,
      stocks: 0,
      business: 0,
      debt: 0,
      income: 34000,
      expenses: 32000,
    };
    partner.values.home = 85;
    c.people.push(father, mother, sibling, partner, niece);
    c.links.push(
      { from: 10, to: 11, kind: "spouse" },
      { from: 10, to: 0, kind: "parent" },
      { from: 11, to: 0, kind: "parent" },
      { from: 10, to: 12, kind: "parent" },
      { from: 11, to: 12, kind: "parent" },
      { from: 12, to: 13, kind: "spouse" },
      { from: 12, to: 14, kind: "parent" },
      { from: 13, to: 14, kind: "parent" },
    );
  }
  c.people
    .filter((p) => p.id !== 0)
    .forEach((p) =>
      c.relations.push({
        a: 0,
        b: p.id,
        closeness: background === "self-made" ? 55 : 65,
        trust: 60,
        conflict: 10,
        careHours: 0,
        helpGiven: 0,
      }),
    );
  return c;
}
export function relationship(c: Clan, a: number, b: number): Relation {
  let r = c.relations.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a),
  );
  if (!r) {
    r = {
      a,
      b,
      closeness: 50,
      trust: 50,
      conflict: 10,
      careHours: 0,
      helpGiven: 0,
    };
    c.relations.push(r);
  }
  return r;
}
function clamp(r: Relation) {
  r.closeness = Math.max(0, Math.min(100, r.closeness));
  r.trust = Math.max(0, Math.min(100, r.trust));
  r.conflict = Math.max(0, Math.min(100, r.conflict));
}
export function remember(
  s: State,
  m: Omit<Memory, "id" | "month" | "generation">,
) {
  const c = s.clan;
  c.memories.push({
    ...m,
    id: `m${++c.sequence}`,
    month: s.month,
    generation: s.generation,
  });
}
export function ledger(
  s: State,
  label: string,
  postings: { account: string; delta: number }[],
) {
  if (
    postings.some((p) => !Number.isFinite(p.delta)) ||
    Math.abs(postings.reduce((a, p) => a + p.delta, 0)) > 0.01
  )
    throw Error("家庭交易不平衡");
  s.clan.transactions.push({
    id: `tx${++s.clan.sequence}`,
    month: s.month,
    label,
    postings,
  });
}
function pay(s: State, amount: number, label: string, recipient?: Person) {
  if (s.cash < amount) throw Error("現金不足，不能承諾未持有的款項");
  s.cash -= amount;
  if (recipient) recipient.finances.cash += amount;
  ledger(s, label, [
    { account: `person:${s.clan.activeId}:cash`, delta: -amount },
    {
      account: recipient ? `person:${recipient.id}:cash` : "external:care",
      delta: amount,
    },
  ]);
}
function city(s: State, title: string, memberId?: number) {
  s.city.events = [
    ...s.city.events,
    {
      id: `${s.generation}:${++s.city.sequence}`,
      month: s.month,
      kind: "family" as const,
      title,
      memberId,
    },
  ].slice(-40);
  s.clan.lastNotice = title;
  s.logs = [`第 ${s.month} 月｜${title}`, ...s.logs].slice(0, 40);
}
export function relativeRole(c: Clan, id: number) {
  const active = c.activeId;
  if (id === active) return "家主";
  if (
    c.links.some(
      (l) =>
        l.kind === "spouse" &&
        ((l.from === active && l.to === id) ||
          (l.to === active && l.from === id)),
    )
  )
    return "配偶";
  if (
    c.links.some((l) => l.kind === "parent" && l.from === active && l.to === id)
  )
    return "子女";
  if (
    c.links.some((l) => l.kind === "parent" && l.to === active && l.from === id)
  )
    return "父母";
  const parents = c.links
    .filter((l) => l.kind === "parent" && l.to === active)
    .map((l) => l.from);
  if (
    c.links.some(
      (l) => l.kind === "parent" && parents.includes(l.from) && l.to === id,
    )
  )
    return "手足";
  return "家人";
}
export function projectFamily(s: State) {
  s.family = s.clan.people
    .filter((p) => p.id !== s.clan.activeId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      role: relativeRole(s.clan, p.id),
    }));
}
export function syncActive(s: State) {
  const c = s.clan;
  const active = c.people.find((p) => p.id === c.activeId)!;
  active.age = s.age;
  active.alive = !s.dead;
  active.health = c.playerHealth;
  active.finances = {
    cash: s.cash,
    home: s.properties
      .filter((p) => p.owned && p.kind !== "商店")
      .reduce((a, p) => a + p.value, 0),
    stocks: s.prices.reduce((a, p, i) => a + p * s.shares[i], 0),
    business: s.properties
      .filter((p) => p.owned && p.kind === "商店")
      .reduce((a, p) => a + p.value, 0),
    debt: s.properties.reduce((a, p) => a + p.debt, 0),
    income: s.world ? salary(s.world) : s.age < 65 ? 52000 : 18000,
    expenses: 28000,
  };
  s.family.forEach((m) => {
    const p = c.people.find((p) => p.id === m.id);
    if (p) {
      p.age = m.age;
      p.name = m.name;
    }
  });
}
export function decide(
  c: Clan,
  id: number,
  mode: "care" | "estate",
  proposal: "keep" | "sell" | "compensation" = "keep",
): Decision {
  const p = c.people.find((p) => p.id === id)!;
  const r = relationship(c, c.activeId, id),
    f = p.finances;
  const pressure = Math.min(
    100,
    Math.max(
      0,
      (f.expenses + (f.debt * 0.025) / 12 - f.income) / 1000 +
        50 -
        f.cash / 5000,
    ),
  );
  const spouseLink = c.links.find(
    (l) => l.kind === "spouse" && (l.from === id || l.to === id),
  );
  const spouse = spouseLink
    ? c.people.find(
        (q) =>
          q.id === (spouseLink.from === id ? spouseLink.to : spouseLink.from),
      )
    : undefined;
  const advice = spouse ? (spouse.traits.security - 50) * 0.1 : 0;
  const broken = c.memories.filter(
    (m) =>
      m.category === "promise" && m.actor === c.activeId && m.kept === false,
  ).length;
  const score = Math.round(
    p.traits.duty * 0.2 +
      p.traits.empathy * 0.12 +
      r.trust * 0.12 +
      r.closeness * 0.05 +
      (100 - pressure) * 0.3 +
      p.values.fairness * 0.1 -
      r.conflict * 0.13 -
      advice -
      broken * 4 +
      (random(c) - 0.5) * 12,
  );
  const preference =
    pressure > 35
      ? "compensation"
      : p.values.home > 65
        ? "keep"
        : p.risk < 45
          ? "sell"
          : "compensation";
  const adjusted =
    mode === "estate" ? score + (proposal === preference ? 12 : -12) : score;
  const choice =
    adjusted > 64
      ? "support"
      : adjusted > 43
        ? "counter"
        : r.conflict > 65
          ? "legal"
          : "decline";
  return {
    personId: id,
    choice,
    preference,
    score: adjusted,
    reasons: [
      `可用現金 ${Math.round(f.cash).toLocaleString()}，每月支出 ${Math.round(f.expenses).toLocaleString()}`,
      `責任：${p.responsibilities.join("、") || p.goal}`,
      `安全價值 ${p.traits.security}／自主性 ${p.traits.autonomy}／風險偏好 ${p.risk}`,
      spouse
        ? `${spouse.name}重視家庭安全，提供意見但沒有決定權`
        : "依自己的財務與價值判斷",
      `照顧與承諾記憶、信任及壓力共同影響；不是單一好感度`,
    ],
  };
}
function applyDecisionMemory(s: State, d: Decision) {
  const p = s.clan.people.find((p) => p.id === d.personId)!;
  remember(s, {
    kind: "perception",
    actor: p.id,
    subject: s.clan.activeId,
    observer: p.id,
    text: `${p.name}選擇${{ support: "支持", counter: "提出條件", decline: "拒絕目前方案", legal: "尋求法律途徑" }[d.choice]}。${d.reasons.join("；")}`,
    category: "agreement",
  });
}
export function gameDate(month: number) {
  return `${2026 + Math.floor(month / 12)}-${String((month % 12) + 1).padStart(2, "0")}-01`;
}
function heirsOf(c: Clan, ownerId: number): Heir[] {
  const spouse = c.links
    .filter(
      (l) => l.kind === "spouse" && (l.from === ownerId || l.to === ownerId),
    )
    .map((l) => (l.from === ownerId ? l.to : l.from));
  const descendants: Heir[] = [];
  const seen = new Set<number>();
  const walk = (parent: number, parentBranch?: number) => {
    if (seen.has(parent)) return;
    seen.add(parent);
    c.links
      .filter((l) => l.kind === "parent" && l.from === parent)
      .forEach((l) => {
        const p = c.people.find((p) => p.id === l.to);
        if (p) {
          descendants.push({
            id: p.id,
            name: p.name,
            relation: "descendant",
            status: p.alive ? "eligible" : "predeceased",
            ...(parentBranch !== undefined ? { parentId: parentBranch } : {}),
          });
          walk(p.id, p.id);
        }
      });
  };
  walk(ownerId);
  return [
    ...descendants,
    ...spouse.flatMap((id) => {
      const p = c.people.find((p) => p.id === id);
      return p?.alive
        ? [
            {
              id,
              name: p.name,
              relation: "spouse" as const,
              status: "eligible" as const,
            },
          ]
        : [];
    }),
  ];
}
export function openEstate(
  s: State,
  ownerId: number,
  portfolio?: Portfolio,
): Estate {
  const c = s.clan,
    old = c.estates.find((e) => e.ownerId === ownerId);
  if (old) return old;
  const p = c.people.find((p) => p.id === ownerId)!;
  const e: Estate = {
    id: `estate:${ownerId}:${s.month}`,
    ownerId,
    deathDate: gameDate(s.month),
    finances: structuredClone(p.finances),
    ...(portfolio ? { portfolio: structuredClone(portfolio) } : {}),
    facts: {
      deathDate: gameDate(s.month),
      heirs: heirsOf(c, ownerId),
      familyComplete: true,
      marriageConfirmed: true,
      will: "unknown",
      maritalProperty: "unknown",
      gifts: "unknown",
      insurance: "unknown",
      ownershipConfirmed: true,
    },
    status: "awaiting-facts",
    proposal: null,
    responses: [],
    legalProceedings: false,
  };
  if (s.story) {
    e.facts.ownershipConfirmed = false;
    e.storyProperties = structuredClone(
      s.story.houses.filter((h) => h.ownerId === ownerId),
    );
    s.story.houses
      .filter((h) => h.ownerId === ownerId)
      .forEach((h) => {
        h.estateId = e.id;
      });
  }
  c.estates.push(e);
  ledger(s, `${p.name}死亡：財產轉入遺產保管，未分給玩家`, [
    { account: `person:${ownerId}:cash`, delta: -p.finances.cash },
    { account: `${e.id}:cash`, delta: p.finances.cash },
  ]);
  p.finances = zeroFinances();
  p.alive = false;
  remember(s, {
    kind: "fact",
    actor: ownerId,
    subject: ownerId,
    observer: null,
    text: `${p.name}於遊戲日期 ${e.deathDate}辭世，資產與債務已建立獨立清冊；法源及稅務核實前不分產。`,
    category: "inheritance",
  });
  city(s, `${p.name}辭世，請召開祖厝與遺產家庭會議`, ownerId);
  if (c.episode?.fatherId === ownerId) {
    c.episode.phase = "inheritance";
    c.episode.careMonthly = 0;
  }
  return e;
}
export function familyAction(input: State, action: FamilyAction): State {
  if (input.dead) throw Error("請先選擇下一代經營視角");
  const s = structuredClone(input),
    c = s.clan;
  syncActive(s);
  if (action.type === "background") {
    if (
      c.background !== "legacy" ||
      s.month !== 0 ||
      s.properties.some((p) => p.owned) ||
      s.shares.some(Boolean) ||
      s.city.sequence > 0
    )
      throw Error("已有經營紀錄，請建立新家族再選背景，避免覆蓋資產");
    s.cash =
      action.background === "self-made"
        ? 300000
        : action.background === "ordinary"
          ? 600000
          : 1800000;
    s.clan = createClan(action.background, s.family, s.age);
    projectFamily(s);
    syncActive(s);
    city(
      s,
      `開局背景：${{ "self-made": "白手起家", ordinary: "一般家庭", wealthy: "富裕家庭" }[action.background]}，父母財產獨立記帳`,
    );
    return s;
  }
  if (action.type === "start-story") {
    if (s.story)
      throw Error(
        "本劇情請到父母住家或社區中心陪同健檢，不啟用舊版必然惡化病程。",
      );
    const father = c.people.find(
      (p) => relativeRole(c, p.id) === "父母" && p.alive,
    );
    if (!father || c.episode) throw Error("需要健在父母，且照顧故事尚未開始");
    father.health = 25;
    c.episode = {
      phase: "illness",
      fatherId: father.id,
      started: s.month,
      careMonthly: 0,
      careHours: 0,
      lastChoice: "尚未協商",
      treatment: "none",
      responses: [],
      reviewMonth: s.month + 1,
      active: true,
    };
    remember(s, {
      kind: "fact",
      actor: father.id,
      subject: father.id,
      observer: null,
      text: "虛構病程：父親重大疾病，需要治療與長期照顧；醫療金額為遊戲情境，不是實際醫療或法律判定。",
      category: "care",
    });
    city(s, "父親重大疾病：請協商醫療費與照顧分工", father.id);
    return s;
  }
  if (
    action.type === "visit" ||
    action.type === "assist" ||
    action.type === "loan" ||
    action.type === "promise"
  ) {
    const p = c.people.find(
      (p) => p.id === action.personId && p.alive && p.id !== c.activeId,
    );
    if (!p) throw Error("沒有可互動的在世家人");
    const r = relationship(c, c.activeId, p.id);
    if (action.type === "visit") {
      pay(s, 1200, "探望交通與餐食");
      r.closeness += 5;
      r.trust += 2;
      r.careHours += 4;
      c.playerHealth = Math.max(0, c.playerHealth - 1);
      if (!s.story) c.workPenaltyMonths = Math.max(c.workPenaltyMonths, 1);
      c.promises
        .filter((x) => x.personId === p.id)
        .forEach((x) => (x.fulfilled += 4));
      remember(s, {
        kind: "fact",
        actor: c.activeId,
        subject: p.id,
        observer: null,
        text: `探望 ${p.name}，投入 4 小時、支出 1,200 元；本月後續工作收入受時間投入影響。`,
        category: "care",
      });
    }
    if (action.type === "assist" || action.type === "loan") {
      const amount = action.type === "assist" ? 40000 : 60000;
      pay(
        s,
        amount,
        action.type === "assist" ? "家人自願贈與" : "借款交付紀錄",
        p,
      );
      r.helpGiven += amount;
      r.trust += 4;
      if (action.type === "loan")
        c.loans.push({
          creditor: c.activeId,
          debtor: p.id,
          amount,
          legalStatus: "unreviewed",
          month: s.month,
        });
      remember(s, {
        kind: "fact",
        actor: c.activeId,
        subject: p.id,
        observer: null,
        text: `交付 ${amount.toLocaleString()} 元${action.type === "assist" ? "自願援助" : "借款意向"}；${action.type === "loan" ? "債權效力待確認，不計入可支配現金或已確認資產" : "贈與稅與歸扣分別待確認"}。`,
        category: action.type === "assist" ? "gift" : "loan",
      });
    }
    if (action.type === "promise") {
      c.promises.push({
        id: `promise:${++c.sequence}`,
        personId: p.id,
        hours: 12,
        fulfilled: 0,
      });
      remember(s, {
        kind: "perception",
        actor: c.activeId,
        subject: p.id,
        observer: p.id,
        text: `口頭承諾每月投入 12 小時照顧 ${p.name}；不是有效遺囑或已審查法律文件。`,
        category: "promise",
      });
      r.trust += 1;
    }
    clamp(r);
    city(
      s,
      `${p.name}：${{ visit: "完成探望", assist: "收到援助", loan: "已記錄借款交付", promise: "已記錄口頭承諾" }[action.type]}`,
      p.id,
    );
    syncActive(s);
    return s;
  }
  if (action.type === "care") {
    const episode = c.episode;
    if (!episode || episode.phase !== "illness")
      throw Error("沒有待處理的疾病照顧事件");
    const p = c.people.find((p) => p.id === episode.fatherId)!;
    const options = {
      medical: { cost: 120000, monthly: 18000, hours: 4, health: 25 },
      shared: { cost: 40000, monthly: 10000, hours: 8, health: 12 },
      time: { cost: 18000, monthly: 6000, hours: 24, health: 8 },
      defer: { cost: 0, monthly: 0, hours: 0, health: -5 },
    };
    const o = options[action.choice];
    pay(s, o.cost, "疾病治療與照顧情境費用");
    p.health = Math.max(0, p.health + o.health);
    episode.careMonthly = o.monthly;
    episode.careHours = o.hours;
    episode.phase = "care";
    episode.lastChoice = action.choice;
    episode.treatment = action.choice;
    episode.reviewMonth = s.month + 1;
    c.playerHealth = Math.max(0, c.playerHealth - Math.floor(o.hours / 6));
    c.workPenaltyMonths = o.hours >= 20 ? 2 : c.workPenaltyMonths;
    const participants = c.people.filter(
      (person) =>
        person.alive &&
        person.id !== c.activeId &&
        ["父母", "手足"].includes(relativeRole(c, person.id)),
    );
    episode.responses = participants.map((person) =>
      decide(c, person.id, "care"),
    );
    episode.responses.forEach((d) => applyDecisionMemory(s, d));
    const r = relationship(c, c.activeId, p.id);
    r.careHours += o.hours;
    r.trust += action.choice === "defer" ? -8 : 4;
    r.conflict += action.choice === "defer" ? 8 : -2;
    clamp(r);
    remember(s, {
      kind: "fact",
      actor: c.activeId,
      subject: p.id,
      observer: null,
      text: `照顧方案 ${action.choice}：一次 ${o.cost} 元、每月 ${o.monthly} 元、每月 ${o.hours} 小時。這是自願安排，非扶養義務判決。`,
      category: "care",
    });
    city(s, "照顧方案已執行；下個遊戲月將檢視手足的負擔", p.id);
    syncActive(s);
    return s;
  }
  if (action.type === "burden") {
    const episode = c.episode;
    if (!episode || episode.phase !== "sibling")
      throw Error("沒有待協商的手足負擔事件");
    const sibling = c.people.find(
      (p) => relativeRole(c, p.id) === "手足" && p.alive,
    );
    if (!sibling) throw Error("沒有在世手足");
    if (action.choice === "gift" || action.choice === "loan") {
      const amount = action.choice === "gift" ? 40000 : 60000;
      pay(s, amount, "照顧困境：家人金錢協助", sibling);
      if (action.choice === "loan")
        c.loans.push({
          creditor: c.activeId,
          debtor: sibling.id,
          amount,
          legalStatus: "unreviewed",
          month: s.month,
        });
      remember(s, {
        kind: "fact",
        actor: c.activeId,
        subject: sibling.id,
        observer: null,
        text: `照顧困境中提供${action.choice === "gift" ? "贈與" : "借款"} ${amount} 元；借貸、贈與稅及歸扣要件仍須各別確認。`,
        category: action.choice === "gift" ? "gift" : "loan",
      });
    } else if (action.choice === "time") {
      episode.careHours += 12;
      c.workPenaltyMonths = 2;
      c.playerHealth = Math.max(0, c.playerHealth - 4);
      remember(s, {
        kind: "fact",
        actor: c.activeId,
        subject: episode.fatherId,
        observer: null,
        text: "承擔額外 12 小時照顧，降低手足照顧責任，但自己的健康與工作時間受影響。",
        category: "care",
      });
    } else {
      pay(s, 2000, "家庭會議交通與文件");
      remember(s, {
        kind: "document",
        actor: c.activeId,
        subject: sibling.id,
        observer: null,
        text: "照顧家庭會議紀錄：尚未形成有效費用分擔協議，沒有法院結果。",
        category: "agreement",
        documentStatus: "unreviewed",
      });
    }
    const d = decide(c, sibling.id, "care");
    episode.responses = [
      ...episode.responses.filter((old) => old.personId !== sibling.id),
      d,
    ];
    applyDecisionMemory(s, d);
    episode.phase = "care";
    episode.lastChoice = `burden:${action.choice}`;
    city(s, "手足已自主回應照顧分工；結果記入家族記憶", sibling.id);
    syncActive(s);
    return s;
  }
  const estate = c.estates.find(
    (e) =>
      ("estateId" in action && e.id === action.estateId) ||
      (action.type === "meeting" && e.status !== "held"),
  );
  if (!estate) throw Error("沒有待協商的遺產");
  if (action.type === "review-estate") {
    estate.status = "negotiating";
    remember(s, {
      kind: "fact",
      actor: c.activeId,
      subject: estate.ownerId,
      observer: null,
      text: "已整理遊戲資產與身分清冊；遺囑、贈與、保單、夫妻財產及年度稅額尚待確認，未將口頭承諾當成遺囑。",
      category: "inheritance",
    });
    city(s, "遺產清冊已整理，可提出祖厝方案；尚未分產");
    return s;
  }
  if (action.type === "legal-route") {
    pay(s, 6000, "自願尋求法律諮詢情境費用");
    estate.legalProceedings = true;
    estate.status = "disputed";
    remember(s, {
      kind: "fact",
      actor: c.activeId,
      subject: estate.ownerId,
      observer: null,
      text: "尋求法律諮詢，支出 6,000 元（虛構情境費用）；尚無裁判結果，不預設勝敗。",
      category: "conflict",
    });
    city(s, "已記錄法律途徑意向，司法結果待確認");
    syncActive(s);
    return s;
  }
  if (action.type === "meeting") {
    if (estate.status === "awaiting-facts") throw Error("請先整理遺產清冊");
    pay(s, 2000, "遺產家庭會議");
    estate.proposal = action.proposal;
    // Closest living household representatives supply preliminary opinions, not legal votes.
    const ids = estate.facts.heirs
      .filter((h) => {
        if (h.status !== "eligible" || h.id === c.activeId) return false;
        let parent = h.parentId;
        const seen = new Set<number>();
        while (parent !== undefined) {
          if (seen.has(parent)) return false;
          seen.add(parent);
          const ancestor = estate.facts.heirs.find((a) => a.id === parent);
          if (ancestor?.status === "eligible") return false;
          parent = ancestor?.parentId;
        }
        return true;
      })
      .map((h) => h.id);
    estate.responses = ids.map((id) =>
      decide(c, id, "estate", action.proposal),
    );
    estate.responses.forEach((d) => applyDecisionMemory(s, d));
    estate.status = estate.responses.every((d) => d.choice === "support")
      ? "pending-law"
      : "disputed";
    remember(s, {
      kind: "document",
      actor: c.activeId,
      subject: estate.ownerId,
      observer: null,
      text: `祖厝方案：${action.proposal}；僅為會議意向，非有效遺囑或已完成分割協議。法定份額未改變，尚未出售或轉移遺產。`,
      category: "agreement",
      documentStatus: "unreviewed",
    });
    city(s, "祖厝家庭會議完成：方案與分歧已保存，遺產維持保管");
    syncActive(s);
    return s;
  }
  return s;
}
/** One call per committed game month. Never invoked by Phaser or offline catch-up. */
export function advanceClan(s: State) {
  const c = s.clan;
  syncActive(s);
  const familyIds = new Set(s.family.map((m) => m.id));
  const postings: { account: string; delta: number }[] = [];
  c.people.forEach((p) => {
    if (p.id === c.activeId || !p.alive) return;
    if (!familyIds.has(p.id)) p.age = (Math.round(p.age * 12) + 1) / 12;
    if (p.age >= 85) {
      openEstate(s, p.id);
      return;
    }
    if (p.age >= 65 && relativeRole(c, p.id) !== "父母")
      p.finances.income = Math.min(p.finances.income, 18000);
    if (
      p.age >= 18 &&
      p.finances.income === 0 &&
      relativeRole(c, p.id) !== "父母"
    ) {
      p.finances.income = 36000;
      p.finances.expenses = 26000;
      p.goal = p.risk > 60 ? "探索工作與投資" : "建立緊急預備金";
    }
    const f = p.finances;
    const delta =
      p.age < 18
        ? 0
        : f.income - f.expenses - Math.round((f.debt * 0.025) / 12);
    f.cash += delta;
    if (delta)
      postings.push(
        { account: `person:${p.id}:cash`, delta },
        { account: "external:npc-life", delta: -delta },
      );
    if (
      f.cash > Math.max(200000, f.expenses * 6) &&
      p.risk > 60 &&
      random(c) < 0.12
    ) {
      const investment = Math.min(5000, Math.floor(f.cash * 0.02));
      f.cash -= investment;
      f.stocks += investment;
      postings.push(
        { account: `person:${p.id}:cash`, delta: -investment },
        { account: `person:${p.id}:stocks`, delta: investment },
      );
    }
    // Adult descendants independently form households when resources, values and seed support it.
    const hasChildren = c.links.some(
        (l) => l.kind === "parent" && l.from === p.id,
      ),
      hasSpouse = c.links.some(
        (l) => l.kind === "spouse" && (l.from === p.id || l.to === p.id),
      );
    if (
      relativeRole(c, p.id) === "子女" &&
      p.age >= 28 &&
      p.age < 45 &&
      !hasChildren &&
      !hasSpouse &&
      f.cash > 200000 &&
      p.values.legacy > 60 &&
      random(c) < 0.08
    ) {
      const id = Math.max(...c.people.map((q) => q.id)) + 1,
        partner = person(id, `${p.name}的伴侶`, p.age, id * 17),
        child = person(id + 1, `${p.name}的子女`, 0, (id + 1) * 17);
      partner.finances = {
        ...zeroFinances(),
        cash: 100000,
        income: 36000,
        expenses: 27000,
      };
      f.cash -= 50000;
      c.people.push(partner, child);
      c.links.push(
        { from: p.id, to: partner.id, kind: "spouse" },
        { from: p.id, to: child.id, kind: "parent" },
        { from: partner.id, to: child.id, kind: "parent" },
      );
      postings.push(
        { account: `person:${p.id}:cash`, delta: -50000 },
        { account: "external:npc-birth", delta: 50000 },
      );
      remember(s, {
        kind: "fact",
        actor: p.id,
        subject: child.id,
        observer: null,
        text: `${p.name}依家庭目標及財務能力自主建立家庭並迎接子女，準備金支出 50,000 元。`,
        category: "life",
      });
    }
  });
  if (postings.length) ledger(s, "NPC 本月獨立生活與自主投資", postings);
  if (c.workPenaltyMonths > 0) {
    c.workPenaltyMonths--;
    if (s.world ? salary(s.world) > 0 : s.age < 65) {
      const lost = s.world ? Math.min(8000, salary(s.world)) : 8000;
      s.cash -= lost;
      s.income -= lost;
      ledger(s, "照顧時間影響工作：本月少領薪資 8,000 元", [
        { account: `person:${c.activeId}:cash`, delta: -lost },
        { account: "external:foregone-salary", delta: lost },
      ]);
    }
  }
  const e = c.episode;
  if (e && e.active) {
    const father = c.people.find((p) => p.id === e.fatherId)!;
    if (father.alive && e.phase !== "illness") {
      const paid = Math.min(e.careMonthly, Math.max(0, s.cash));
      if (paid) {
        pay(s, paid, "本月自願照顧支出");
        s.expense += paid;
      }
      if (paid < e.careMonthly) {
        father.health -= 2;
        remember(s, {
          kind: "fact",
          actor: c.activeId,
          subject: father.id,
          observer: null,
          text: "照顧預算不足，只支付可用現金；沒有自動借貸或判定扶養責任。",
          category: "care",
        });
      }
      e.responses.forEach((d) => {
        const npc = c.people.find((p) => p.id === d.personId);
        if (!npc?.alive) return;
        const contribution =
          d.choice === "support" ? 3000 : d.choice === "counter" ? 1500 : 0;
        const actual = Math.min(
          contribution,
          Math.max(0, npc.finances.cash - npc.finances.expenses),
        );
        if (actual) {
          npc.finances.cash -= actual;
          ledger(s, `${npc.name}自主分擔照顧費`, [
            { account: `person:${npc.id}:cash`, delta: -actual },
            { account: "external:care", delta: actual },
          ]);
          relationship(c, c.activeId, npc.id).helpGiven += actual;
        }
      });
      father.health = Math.max(
        0,
        father.health -
          (e.treatment === "medical" ? 2 : e.treatment === "defer" ? 6 : 4),
      );
      c.playerHealth = Math.max(
        0,
        c.playerHealth - Math.floor(e.careHours / 12),
      );
      c.promises
        .filter((p) => p.personId === father.id)
        .forEach((p) => (p.fulfilled += e.careHours));
      if (
        e.phase === "care" &&
        s.month >= e.reviewMonth &&
        !e.lastChoice.startsWith("burden:")
      ) {
        e.phase = "sibling";
        city(s, "手足房貸與子女教育費吃緊，請重新協商照顧分工", 12);
      }
      if (father.health <= 0) openEstate(s, father.id);
    }
  }
  c.promises
    .filter((p) => c.people.find((person) => person.id === p.personId)?.alive)
    .forEach((p) => {
      const kept = p.fulfilled >= p.hours,
        r = relationship(c, c.activeId, p.personId);
      r.trust += kept ? 2 : -4;
      r.conflict += kept ? -1 : 2;
      clamp(r);
      remember(s, {
        kind: "fact",
        actor: c.activeId,
        subject: p.personId,
        observer: null,
        text: `本月照顧承諾 ${p.hours} 小時，實際 ${p.fulfilled} 小時，${kept ? "履行" : "未達成"}。`,
        category: "promise",
        kept,
      });
      p.fulfilled = 0;
    });
  if (!s.story && !c.episode && c.background !== "legacy" && s.month >= 6) {
    const father = c.people.find(
      (p) => relativeRole(c, p.id) === "父母" && p.alive,
    );
    const chance =
      c.background === "wealthy"
        ? 0.012
        : c.background === "ordinary"
          ? 0.035
          : 0;
    if (father && random(c) < chance) {
      const next = familyAction(s, { type: "start-story" });
      Object.assign(s, next);
    }
  }
  projectFamily(s);
  syncActive(s);
}
export function recordNewMember(
  s: State,
  member: Member,
  kind: "marriage" | "birth",
) {
  const c = s.clan,
    p = person(member.id, member.name, member.age, member.id * 23);
  c.people.push(p);
  if (kind === "marriage")
    c.links.push({ from: c.activeId, to: p.id, kind: "spouse" });
  else {
    c.links.push({ from: c.activeId, to: p.id, kind: "parent" });
    const spouse = c.links.find(
      (l) =>
        l.kind === "spouse" && (l.from === c.activeId || l.to === c.activeId),
    );
    if (spouse)
      c.links.push({
        from: spouse.from === c.activeId ? spouse.to : spouse.from,
        to: p.id,
        kind: "parent",
      });
  }
  remember(s, {
    kind: "fact",
    actor: c.activeId,
    subject: p.id,
    observer: null,
    text:
      kind === "birth"
        ? `${p.name}出生，準備金 50,000 元`
        : `與 ${p.name}結婚，情境準備金 120,000 元；夫妻財產制未據此假定`,
    category: "life",
  });
  ledger(s, kind === "birth" ? "新生兒準備金" : "結婚準備金", [
    {
      account: `person:${c.activeId}:cash`,
      delta: kind === "birth" ? -50000 : -120000,
    },
    {
      account: "external:family-life",
      delta: kind === "birth" ? 50000 : 120000,
    },
  ]);
}
export function continueGeneration(input: State, id: number): State {
  const s = structuredClone(input);
  syncActive(s);
  const c = s.clan;
  const member = s.family.find(
    (m) => m.id === id && m.role === "子女" && m.age >= 18 && m.age < 85,
  );
  if (!input.dead || !member) throw Error("無效接班人");
  const next = c.people.find((p) => p.id === id)!;
  if (!next?.alive) throw Error("接班人須在世");
  openEstate(s, c.activeId, {
    cash: s.cash,
    properties: s.properties,
    prices: s.prices,
    shares: s.shares,
  });
  const personal = structuredClone(next.finances);
  c.activeId = id;
  s.age = next.age;
  s.dead = false;
  s.generation++;
  s.cash = personal.cash;
  s.shares = [Math.floor(personal.stocks / s.prices[0]), 0, 0];
  s.cash += personal.stocks - s.shares[0] * s.prices[0];
  s.properties = s.properties.map((p) => ({
    ...p,
    estateLock: p.estateLock || p.owned,
    owned: false,
    rented: false,
    operating: false,
    debt: 0,
  }));
  s.income = 0;
  s.expense = 0;
  s.city = { sequence: 0, events: [] };
  c.playerHealth = next.health;
  c.workPenaltyMonths = 0;
  city(
    s,
    `${next.name}接續第 ${s.generation} 代，使用自己的資產；原家主遺產保管、法律與稅務待確認`,
    id,
  );
  s.city.events[s.city.events.length - 1].kind = "succession";
  projectFamily(s);
  syncActive(s);
  return s;
}
export function validateClan(value: unknown): asserts value is Clan {
  const c = value as Clan;
  const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
  if (
    !c ||
    c.version !== 1 ||
    !["legacy", "self-made", "wealthy", "ordinary"].includes(c.background) ||
    !Number.isInteger(c.activeId) ||
    !Number.isInteger(c.seed) ||
    !Number.isInteger(c.sequence) ||
    !finite(c.playerHealth) ||
    !Number.isInteger(c.workPenaltyMonths) ||
    !Array.isArray(c.people) ||
    c.people.length > 1000 ||
    !c.people.length ||
    !c.people.every(
      (p) =>
        Number.isInteger(p.id) &&
        typeof p.name === "string" &&
        finite(p.age) &&
        p.age >= 0 &&
        typeof p.alive === "boolean" &&
        finite(p.health) &&
        p.traits &&
        Object.values(p.traits).every(finite) &&
        p.values &&
        Object.values(p.values).every(finite) &&
        finite(p.risk) &&
        typeof p.goal === "string" &&
        Array.isArray(p.responsibilities) &&
        p.responsibilities.every((x) => typeof x === "string") &&
        p.finances &&
        Object.keys(zeroFinances()).every((k) =>
          finite(p.finances[k as keyof Finances]),
        ),
    ) ||
    new Set(c.people.map((p) => p.id)).size !== c.people.length ||
    !c.people.some((p) => p.id === c.activeId)
  )
    throw Error("家族人物存檔無效");
  const ids = new Set(c.people.map((p) => p.id));
  if (
    !Array.isArray(c.links) ||
    !c.links.every(
      (l) =>
        ids.has(l.from) &&
        ids.has(l.to) &&
        l.from !== l.to &&
        ["parent", "spouse"].includes(l.kind),
    ) ||
    !Array.isArray(c.relations) ||
    !c.relations.every(
      (r) =>
        ids.has(r.a) &&
        ids.has(r.b) &&
        ["closeness", "trust", "conflict", "careHours", "helpGiven"].every(
          (k) => finite(r[k as keyof Relation]),
        ),
    ) ||
    !Array.isArray(c.memories) ||
    !c.memories.every(
      (m) =>
        typeof m.id === "string" &&
        typeof m.text === "string" &&
        Number.isInteger(m.month) &&
        ["fact", "perception", "document"].includes(m.kind),
    ) ||
    !Array.isArray(c.transactions) ||
    !c.transactions.every(
      (t) =>
        typeof t.id === "string" &&
        typeof t.label === "string" &&
        Number.isInteger(t.month) &&
        Array.isArray(t.postings) &&
        t.postings.every(
          (p) => typeof p.account === "string" && finite(p.delta),
        ) &&
        Math.abs(t.postings.reduce((a, p) => a + p.delta, 0)) < 0.01,
    ) ||
    !Array.isArray(c.loans) ||
    !c.loans.every(
      (l) =>
        ids.has(l.creditor) &&
        ids.has(l.debtor) &&
        finite(l.amount) &&
        l.amount >= 0 &&
        l.legalStatus === "unreviewed",
    ) ||
    !Array.isArray(c.promises) ||
    !c.promises.every(
      (p) => ids.has(p.personId) && finite(p.hours) && finite(p.fulfilled),
    ) ||
    !Array.isArray(c.estates) ||
    !c.estates.every(
      (e) =>
        typeof e.id === "string" &&
        ids.has(e.ownerId) &&
        typeof e.deathDate === "string" &&
        e.finances &&
        Object.values(e.finances).every(finite) &&
        e.facts &&
        Array.isArray(e.facts.heirs) &&
        Array.isArray(e.responses) &&
        [
          "awaiting-facts",
          "negotiating",
          "disputed",
          "pending-law",
          "held",
        ].includes(e.status),
    ) ||
    !(
      c.episode === null ||
      (c.episode &&
        ids.has(c.episode.fatherId) &&
        [
          "illness",
          "sibling",
          "care",
          "inheritance",
          "settled-intent",
        ].includes(c.episode.phase) &&
        finite(c.episode.careMonthly) &&
        finite(c.episode.careHours) &&
        Array.isArray(c.episode.responses))
    )
  )
    throw Error("家族記憶或交易存檔無效");
}
/** Balanced game-bookkeeping journal; this does not certify legal ownership or tax treatment. */
export function recordPortfolioChange(
  before: State,
  after: State,
  label: string,
) {
  const account = `person:${after.clan.activeId}`;
  const property = (s: State) =>
    s.properties.filter((p) => p.owned).reduce((a, p) => a + p.value, 0);
  const stocks = (s: State) =>
    s.prices.reduce((a, p, i) => a + p * s.shares[i], 0);
  const debt = (s: State) => s.properties.reduce((a, p) => a + p.debt, 0);
  const postings = [
    { account: `${account}:cash`, delta: after.cash - before.cash },
    {
      account: `${account}:property`,
      delta: property(after) - property(before),
    },
    { account: `${account}:stocks`, delta: stocks(after) - stocks(before) },
    { account: `${account}:liability`, delta: debt(before) - debt(after) },
  ].filter((p) => Math.abs(p.delta) > 0.0000001);
  if (!postings.length) return;
  postings.push({
    account: "external:portfolio-or-economy",
    delta: -postings.reduce((a, p) => a + p.delta, 0) || 0,
  });
  ledger(after, label, postings);
}
