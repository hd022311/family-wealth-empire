import type { State } from "../simulation";
import type { Person } from "../family/types";
import {
  familyAction,
  openEstate,
  relationship,
  decide,
  remember,
  ledger,
  syncActive,
} from "../family/engine";
import { salary, random } from "../world/model";
import { carePlans, familyPlace } from "./definitions";
import type { StoryAction, CareResponse, StoryHouse } from "./types";
export function storyEvent(
  s: State,
  text: string,
  actor: number = s.clan.activeId,
  subject: number = actor,
  place = 8,
  amount?: number,
) {
  remember(s, {
    kind: "fact",
    actor,
    subject,
    observer: null,
    text,
    category: "care",
  });
  s.story!.lastNotice = text;
  s.city.events = [
    ...s.city.events,
    {
      id: `${s.generation}:${++s.city.sequence}`,
      month: s.month,
      kind: "family" as const,
      title: text,
      placeId: place,
      ...(amount !== undefined ? { amount } : {}),
    },
  ].slice(-40);
}
function spendTime(s: State, hours: number) {
  const t = s.story!.time;
  if (t.care + t.family + t.overtime + t.spent + hours > 40)
    throw Error("本月可安排時間不足；請減少加班或家庭預留，或等下個月再來。");
  t.spent += hours;
}
function playerPay(s: State, cost: number, label: string) {
  if (s.cash < cost) throw Error("現金不足，請調整安排，不會自動借貸。");
  s.cash -= cost;
  s.expense += cost;
  ledger(s, label, [
    { account: `person:${s.clan.activeId}:cash`, delta: -cost },
    { account: "external:story-services", delta: cost },
  ]);
}
function cashSpend(s: State, p: Person, amount: number, label: string) {
  if (!amount) return;
  p.finances.cash -= amount;
  ledger(s, label, [
    { account: `person:${p.id}:cash`, delta: -amount },
    { account: "external:story-services", delta: amount },
  ]);
}
function requirePlace(s: State, places: number[]) {
  if (!places.includes(s.world?.place ?? -1))
    throw Error("請先前往父母住家、出租房或社區中心的對應場所。");
}
function reviewSiblings(s: State) {
  const st = s.story!,
    e = st.episode!;
  if (e.lastReviewed === s.month) return;
  e.responses = [12, 15].flatMap((id) => {
    const p = s.clan.people.find((p) => p.id === id);
    if (!p?.alive) return [];
    const decision = decide(s.clan, id, "care");
    const reserve = p.finances.expenses * 3;
    const capacity = Math.max(0, p.finances.cash - reserve);
    const children = s.clan.links.filter(
      (l) => l.from === id && l.kind === "parent",
    ).length;
    const money =
      decision.choice === "support"
        ? Math.min(5000, capacity)
        : decision.choice === "counter"
          ? Math.min(2000, capacity)
          : 0;
    const hours =
      decision.choice === "support"
        ? Math.max(4, 12 - children * 4)
        : decision.choice === "counter"
          ? 4
          : p.traits.empathy >= 65
            ? 2
            : 0;
    const response: CareResponse = {
      ...decision,
      money,
      hours,
      actualMoney: 0,
      reasons: [
        ...decision.reasons,
        `保留三個月生活費 ${reserve.toLocaleString()}；子女照顧 ${children} 人，提出 ${money.toLocaleString()} 元／${hours} 小時。`,
      ],
    };
    remember(s, {
      kind: "perception",
      actor: id,
      subject: e.parentId,
      observer: id,
      text: `${p.name}自主提出照顧方式：${money} 元、${hours} 小時；${response.reasons.join("；")}`,
      category: "agreement",
    });
    return [response];
  });
  e.lastReviewed = s.month;
}
function openCare(s: State, parent: Person) {
  const st = s.story!;
  st.episode = {
    id: `care:${parent.id}:${s.month}`,
    parentId: parent.id,
    started: s.month,
    status: "needs-plan",
    plan: null,
    monthsTreated: 0,
    stableMonths: 0,
    lastReviewed: -1,
    responses: [],
    lastPaid: 0,
    unmetMoney: 0,
    unmetHours: 0,
    completedMonth: null,
  };
  parent.health = Math.min(parent.health, 66);
  storyEvent(
    s,
    `${parent.name}健檢發現慢性疾病與照顧需求，請安排醫療追蹤與家庭分工；病程與費用均為虛構情境。`,
    parent.id,
    parent.id,
    7,
  );
}
export function storyAction(input: State, a: StoryAction): State {
  if (!input.story || input.world?.mode !== "story" || input.dead)
    throw Error("此行動僅適用目前的劇情家族。");
  let s = structuredClone(input);
  const st = s.story!;
  if (a.type === "visit") {
    const p = s.clan.people.find(
      (p) => p.id === a.personId && p.alive && p.id !== s.clan.activeId,
    );
    if (!p) throw Error("家人目前無法見面。");
    const place = familyPlace(p.id);
    requirePlace(s, [place]);
    if (st.lastVisits[p.id] === s.month)
      throw Error("本月已陪伴這位家人，留些時間照顧自己，下個月再來。");
    spendTime(s, 4);
    s = familyAction(s, { type: "visit", personId: p.id });
    s.expense += 1200;
    const next = s.story!;
    next.contacts = Array.from(new Set([...next.contacts, p.id]));
    next.lastVisits[p.id] = s.month;
    storyEvent(
      s,
      `與${p.name}相聚：花費 1,200 元與 4 小時。${p.goal}；彼此的生活與財產仍獨立。`,
      s.clan.activeId,
      p.id,
      place,
      -1200,
    );
  } else if (a.type === "plan") {
    if (
      ![a.care, a.family, a.overtime].every(
        (n) => Number.isInteger(n) && n >= 0,
      ) ||
      a.care > 24 ||
      a.family > 16 ||
      a.overtime > 16 ||
      a.care + a.family + a.overtime + st.time.spent > 40
    )
      throw Error("照顧、家庭、加班與已用時間合計不得超過每月 40 小時。");
    st.time = {
      ...st.time,
      care: a.care,
      family: a.family,
      overtime: a.overtime,
    };
    storyEvent(
      s,
      `更新時間安排：照顧 ${a.care}h、家庭 ${a.family}h、加班 ${a.overtime}h，將於月結算影響收入與關係。`,
    );
  } else if (a.type === "inspect-rental") {
    requirePlace(s, [9]);
    if (st.lastVisits.rental === s.month)
      throw Error("本月已整理過出租屋近況。");
    spendTime(s, 2);
    st.lastVisits.rental = s.month;
    const h = st.houses.find((h) => h.place === 9)!;
    const owner = s.clan.people.find((p) => p.id === h.ownerId)!;
    const r = relationship(s.clan, s.clan.activeId, owner.id);
    r.trust = Math.min(100, r.trust + 2);
    storyEvent(
      s,
      `整理出租屋帳目：月租 ${h.rent.toLocaleString()} 元歸 ${owner.name}${h.estateId ? "的獨立遺產帳戶" : "本人"}，維護費另計；玩家無權出售或領取租金。`,
      s.clan.activeId,
      owner.id,
      9,
    );
  } else if (a.type === "checkup") {
    requirePlace(s, [8, 7]);
    const parent = s.clan.people.find(
      (p) => p.id === a.parentId && [10, 11].includes(p.id) && p.alive,
    );
    if (!parent) throw Error("沒有可陪同的在世父母。");
    if (st.lastCheckup === s.month) throw Error("本月已完成父母健檢。");
    if (st.episode && ["needs-plan", "active"].includes(st.episode.status))
      throw Error("請先處理目前的照顧需求。");
    spendTime(s, 4);
    playerPay(s, 3000, "陪同父母健檢交通與情境費用");
    st.lastCheckup = s.month;
    if (parent.health <= 75) openCare(s, parent);
    else
      storyEvent(
        s,
        `${parent.name}健檢後暫無新增照顧需求，保留定期追蹤。`,
        s.clan.activeId,
        parent.id,
        7,
        -3000,
      );
  } else if (a.type === "choose-care") {
    requirePlace(s, [8, 7]);
    const e = st.episode;
    if (!e || !["needs-plan", "active"].includes(e.status))
      throw Error("目前沒有待安排的照顧事件。");
    const plan = carePlans[a.plan];
    if (!plan) throw Error("未知照顧方案。");
    if (e.plan === a.plan) throw Error("目前已採此方案。");
    if (plan.hours + st.time.family + st.time.overtime + st.time.spent > 40)
      throw Error("時間不足，請先減少家庭預留或加班，或下個月再安排。");
    playerPay(s, plan.initial, `${plan.name}啟動費（虛構服務支出）`);
    st.time.care = plan.hours;
    e.plan = a.plan;
    e.status = "active";
    reviewSiblings(s);
    storyEvent(
      s,
      `採用${plan.name}：啟動費 ${plan.initial.toLocaleString()} 元，醫療與照護總需求每月 ${plan.monthlyNeed.toLocaleString()} 元；依父母與手足實際分擔扣款，玩家上限 ${plan.playerLimit.toLocaleString()} 元。`,
      s.clan.activeId,
      e.parentId,
      7,
      -plan.initial,
    );
  } else if (a.type === "ask-siblings") {
    requirePlace(s, [7, 8]);
    const e = st.episode;
    if (!e || !["needs-plan", "active"].includes(e.status))
      throw Error("目前沒有待協商照顧事件。");
    if (e.lastReviewed === s.month)
      throw Error("手足本月已提出方案，無法重抽決定。");
    spendTime(s, 3);
    playerPay(s, 1500, "照顧家庭會議交通與文件");
    reviewSiblings(s);
    storyEvent(
      s,
      "家庭照顧會議完成，手足保有自主選擇；意見不等於法律上的扶養分擔判決。",
      s.clan.activeId,
      e.parentId,
      7,
      -1500,
    );
  } else {
    const h = st.houses.find((h) => h.place === a.place);
    if (!h) throw Error("找不到房屋。");
    requirePlace(s, [h.place]);
    if (h.estateId)
      throw Error("所有權與遺產管理權待法律核實，本版不代替管理人處分財產。");
    if (h.repairUntil > s.month || h.condition >= 100)
      throw Error("目前不需要重複修繕。");
    const owner = s.clan.people.find((p) => p.id === h.ownerId && p.alive);
    if (!owner) throw Error("屋主狀況待確認。");
    spendTime(s, 4);
    const cost = 8000;
    if (
      owner.finances.cash < owner.finances.expenses * 2 &&
      a.funding === "parent"
    )
      throw Error("屋主希望先保留生活準備金，暫不支出修繕費。");
    if (a.funding === "player") playerPay(s, cost, "自願支援父母房屋修繕");
    else cashSpend(s, owner, cost, `${owner.name}自主同意支付房屋修繕`);
    h.condition = 100;
    h.repairUntil = s.month + 2;
    storyEvent(
      s,
      `${owner.name}同意安排${h.name}修繕，${a.funding === "player" ? "玩家自願" : "屋主自行"}支付 8,000 元。出租屋下一個月停租施工，所有權不變。`,
      s.clan.activeId,
      owner.id,
      h.place,
      a.funding === "player" ? -cost : undefined,
    );
  }
  syncActive(s);
  return s;
}
function settleHouse(s: State, h: StoryHouse) {
  if (h.lastRentMonth === s.month) return;
  h.lastRentMonth = s.month;
  const owner = s.clan.people.find((p) => p.id === h.ownerId)!;
  const estate = h.estateId
    ? s.clan.estates.find((e) => e.id === h.estateId)
    : undefined;
  if (!owner.alive && !estate) return;
  const cash = estate ? estate.finances : owner.finances;
  const rent = h.use === "rental" && h.repairUntil <= s.month ? h.rent : 0;
  const paid = Math.min(h.maintenance, Math.max(0, cash.cash + rent));
  cash.cash += rent - paid;
  ledger(
    s,
    `${h.name}月度租金與維護（${owner.name}${estate ? "的遺產帳戶" : ""}）`,
    [
      {
        account: estate ? `${estate.id}:cash` : `person:${owner.id}:cash`,
        delta: rent - paid,
      },
      { account: "external:parent-property", delta: paid - rent },
    ],
  );
  h.condition = Math.max(0, h.condition - (paid < h.maintenance ? 3 : 1));
  if (rent) {
    s.city.events = [
      ...s.city.events,
      {
        id: `${s.generation}:${++s.city.sequence}`,
        month: s.month,
        kind: "rent" as const,
        placeId: h.place,
        title: `${owner.name}${estate ? "的遺產帳戶" : ""}收租（不是玩家收入）`,
        amount: rent,
      },
    ].slice(-40);
  }
}
export function advanceStory(s: State) {
  const st = s.story;
  if (!st || st.lastSettledMonth === s.month) return;
  st.lastSettledMonth = s.month;
  for (const h of st.houses) settleHouse(s, h);
  const t = st.time,
    base = s.world ? salary(s.world) : 0,
    bonus = base ? t.overtime * 350 : 0,
    lost = Math.min(base, t.care * 250);
  const housing = s.properties.some(
    (p) => p.owned && p.kind !== "商店" && !p.rented,
  )
    ? 0
    : 10000;
  s.cash += bonus - lost - housing;
  s.income += bonus - lost;
  s.expense += housing;
  ledger(s, "劇情月度時間安排與自家租屋支出", [
    {
      account: `person:${s.clan.activeId}:cash`,
      delta: bonus - lost - housing,
    },
    {
      account: "external:work-time-and-housing",
      delta: housing + lost - bonus,
    },
  ]);
  st.lastSalary = { base, bonus, lost, housing };
  for (const id of [1, 2, 3]) {
    const p = s.clan.people.find((p) => p.id === id && p.alive);
    if (p && id !== s.clan.activeId) {
      const r = relationship(s.clan, s.clan.activeId, id);
      r.trust = Math.max(0, Math.min(100, r.trust + (t.family >= 6 ? 1 : -1)));
      r.conflict = Math.max(
        0,
        Math.min(100, r.conflict + (t.family < 4 ? 2 : -1)),
      );
    }
  }
  const rest = Math.max(0, 40 - t.care - t.family - t.overtime - t.spent);
  s.clan.playerHealth = Math.max(
    0,
    Math.min(100, s.clan.playerHealth + (rest >= 8 ? 1 : -2)),
  );
  const e = st.episode;
  if (e && ["needs-plan", "active"].includes(e.status)) {
    const p = s.clan.people.find((p) => p.id === e.parentId)!;
    if (!p.alive) {
      e.status = "bereaved";
      t.care = 0;
      storyEvent(
        s,
        `${p.name}已建立獨立遺產清冊；本次照顧結束，未驗證的法律效果不執行。`,
        p.id,
        p.id,
      );
    } else if (e.status === "active" && e.plan) {
      reviewSiblings(s);
      const plan = carePlans[e.plan];
      let remaining = plan.monthlyNeed;
      const parentPaid = Math.min(
        8000,
        Math.max(0, p.finances.cash - 30000),
        remaining,
      );
      cashSpend(s, p, parentPaid, `${p.name}支付自己的醫療費`);
      remaining -= parentPaid;
      for (const r of e.responses) {
        const npc = s.clan.people.find((p) => p.id === r.personId)!;
        if (npc.alive) {
          const lost = Math.min(npc.finances.income, r.hours * 100);
          cashSpend(s, npc, lost, `${npc.name}調整工作時間以分擔照顧`);
          relationship(s.clan, s.clan.activeId, npc.id).careHours += r.hours;
        }
        const actual = npc.alive
          ? Math.min(
              r.money,
              Math.max(0, npc.finances.cash - npc.finances.expenses * 3),
              remaining,
            )
          : 0;
        r.actualMoney = actual;
        cashSpend(s, npc, actual, `${npc.name}自主分擔照顧費`);
        remaining -= actual;
      }
      const playerPaid = Math.min(
        plan.playerLimit,
        Math.max(0, s.cash),
        remaining,
      );
      if (playerPaid) playerPay(s, playerPaid, "本月自願醫療與照顧分擔");
      remaining -= playerPaid;
      const npcHours = e.responses
        .filter((r) => s.clan.people.find((p) => p.id === r.personId)?.alive)
        .reduce((sum, r) => sum + r.hours, 0);
      e.unmetHours = Math.max(0, plan.hours - t.care - npcHours);
      e.unmetMoney = remaining;
      e.lastPaid =
        parentPaid +
        e.responses.reduce((sum, r) => sum + r.actualMoney, 0) +
        playerPaid;
      e.monthsTreated++;
      const stable = remaining === 0 && e.unmetHours === 0;
      e.stableMonths = stable ? e.stableMonths + 1 : 0;
      p.health = Math.max(0, Math.min(100, p.health + (stable ? 5 : -3)));
      const r = relationship(s.clan, s.clan.activeId, p.id);
      r.careHours += t.care;
      r.trust = Math.max(0, Math.min(100, r.trust + (stable ? 2 : -1)));
      storyEvent(
        s,
        `照顧月結：${p.name}健康 ${p.health.toFixed(0)}；父母自付 ${parentPaid}、手足 ${e.responses.reduce((sum, r) => sum + r.actualMoney, 0)}、玩家 ${playerPaid} 元。尚缺 ${remaining} 元／${e.unmetHours}h；${stable ? "病況穩定" : "需要調整分工"}。`,
        s.clan.activeId,
        p.id,
        7,
      );
      if (p.health <= 0) {
        openEstate(s, p.id);
        e.status = "bereaved";
        t.care = 0;
        storyEvent(
          s,
          `${p.name}病況惡化後辭世，已建立個別遺產清冊，未執行分配或稅務。`,
          p.id,
          p.id,
        );
      }
      if (
        e.status === "active" &&
        e.monthsTreated >= 3 &&
        e.stableMonths >= 2 &&
        p.health >= 75
      ) {
        e.status = "completed";
        e.completedMonth = s.month;
        st.completedEpisodes.push(e.id);
        t.care = 0;
        storyEvent(
          s,
          `${p.name}照顧追蹤階段完成，健康改善。家族可繼續工作、投資與日常生活，不強制結局。`,
          s.clan.activeId,
          p.id,
          8,
        );
      }
    } else p.health = Math.max(1, p.health - 1);
  }
  if (!st.episode && s.month - st.startedMonth >= 3) {
    const p = s.clan.people.find((p) => p.id === 10 && p.alive);
    if (p && p.age >= 60 && p.health <= 75 && random(s.world!) < 0.12)
      openCare(s, p);
  }
  st.time.spent = 0;
  syncActive(s);
}
