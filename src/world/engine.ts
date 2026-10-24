import { storyStage } from "../story/definitions";
import { pathTo } from "./navigation";
import type { State } from "../simulation";
import { recordPortfolioChange, syncActive, ledger } from "../family/engine";
import { jobs, places, random, type World } from "./model";
export type WorldAction =
  | { type: "move"; x: number; y: number }
  | { type: "travel"; place: number }
  | { type: "job"; job: string }
  | { type: "chat"; id: number }
  | { type: "train" }
  | { type: "venture" }
  | { type: "mentor"; id: number };
const note = (w: World, text: string) => {
  w.memories.unshift(text);
  w.memories = w.memories.slice(0, 150);
};
export function worldAction(input: State, a: WorldAction): State {
  if (!input.world || input.dead) throw Error("目前無法進行人生行動");
  const s = structuredClone(input),
    w = s.world!;
  if (a.type === "move") {
    if (
      !pathTo(
        w.position,
        { x: a.x, y: a.y },
        s.story
          ? [
              { x: 0, y: 0 },
              { x: 7, y: 7 },
            ]
          : [],
      ).length
    )
      throw Error("無法通行");
    w.position = { x: a.x, y: a.y };
    w.place = -1;
  } else if (a.type === "travel") {
    if (
      !Number.isInteger(a.place) ||
      !places[a.place] ||
      !pathTo(
        w.position,
        places[a.place],
        s.story
          ? [
              { x: 0, y: 0 },
              { x: 7, y: 7 },
            ]
          : [],
      ).length
    )
      throw Error("未知場所");
    if (a.place >= 8 && !s.story)
      throw Error("此家族沒有劇情房屋，原有資產保持不變。");
    w.place = a.place;
    w.position = { x: places[a.place].x, y: places[a.place].y };
    if (!w.visits.includes(a.place)) w.visits.push(a.place);
  } else if (a.type === "job") {
    const job = jobs.find((j) => j.id === a.job);
    if (!job || job.place !== w.place) throw Error("請先前往工作場所面試");
    if (w.skill < job.skill) throw Error("專業能力不足，請到社區中心進修");
    w.job = job.id;
    w.experience = 0;
    note(w, `第 ${s.month} 月：就任${job.name}，按遊戲月領薪。`);
  } else if (a.type === "chat") {
    const n = w.npcs.find((n) => n.id === a.id);
    if (!n || n.place !== w.place) throw Error("請前往人物所在場所");
    if (n.lastChat === s.month) throw Error("本月已交流，下個月再分享近況");
    n.met = true;
    n.trust = Math.min(
      100,
      n.trust + Math.max(1, Math.round((n.duty + w.skill) / 25)),
    );
    n.lastChat = s.month;
    w.skill++;
    note(w, `${n.name}分享${n.goal}與家庭責任；信任累積至 ${n.trust}。`);
  } else if (a.type === "train") {
    if (w.place !== 7) throw Error("請先到社區中心");
    if (w.trained === s.month) throw Error("本月課程已完成");
    if (s.cash < 1000) throw Error("現金不足");
    s.cash -= 1000;
    s.expense += 1000;
    w.skill += 3;
    w.trained = s.month;
    note(w, "進修支出 1,000，專業能力 +3。");
  } else if (a.type === "venture") {
    if (w.place !== 7 || !w.paid || !w.npcs.some((n) => n.met) || w.venture)
      throw Error("請先領薪、結識市民，再到社區中心啟動商機");
    if (s.cash < 30000) throw Error("現金不足");
    s.cash -= 30000;
    s.expense += 30000;
    w.venture = true;
    note(w, "投入 30,000 啟動數位服務試營運；收入隨市場波動，非保證收益。");
  } else {
    if (w.place !== 7) throw Error("請到社區中心培養人才");
    const child = s.family.find(
      (m) => m.id === a.id && m.role === "子女" && m.age >= 6,
    );
    if (!child) throw Error("需要六歲以上子女");
    if (w.talent[`month:${a.id}`] === s.month) throw Error("本月已完成指導");
    if (s.cash < 3000) throw Error("現金不足");
    s.cash -= 3000;
    s.expense += 3000;
    w.talent[a.id] = (w.talent[a.id] ?? 0) + 3;
    w.talent[`month:${a.id}`] = s.month;
    note(w, `${child.name}參與能力培養，支出 3,000。`);
  }
  recordPortfolioChange(input, s, `人生行動：${a.type}`);
  syncActive(s);
  return s;
}
export function advanceWorld(s: State) {
  const w = s.world;
  if (!w) return;
  if (w.job) {
    w.experience++;
    w.paid++;
  }
  w.ventureIncome = w.venture ? Math.floor(random(w) * 9001) : 0;
  const postings: { account: string; delta: number }[] = [];
  for (const n of w.npcs) {
    n.age += 1 / 12;
    const pay = jobs[n.job].pay + Math.floor(n.skill / 12) * 1000;
    const expense = 18000 + (n.household.includes("子女") ? 8000 : 5000);
    n.cash += pay - expense;
    postings.push(
      { account: `citizen:${n.id}:cash`, delta: pay - expense },
      { account: "external:citizen-life", delta: expense - pay },
    );
    if (random(w) < 0.1 + n.duty / 400) {
      n.skill++;
      if (n.skill % 6 === 0)
        note(w, `${n.name}自主進修，累積專業 ${n.skill}。`);
    }
    if (n.cash > 180000 && n.skill >= 12 && random(w) < n.risk / 500) {
      n.job = (n.job + 1) % jobs.length;
      note(w, `${n.name}考量${n.goal}，轉職${jobs[n.job].name}。`);
    }
    n.place = s.month % 3 === 0 ? 6 : s.month % 3 === 1 ? jobs[n.job].place : 7;
  }
  ledger(s, "城市市民自主生活月度收支", postings);
}
export const chapters = [
  "家族起點",
  "各自人生",
  "父母晚年",
  "繼承與選擇",
  "下一代開始",
];
export function chapter(s: State) {
  if (s.story) return storyStage(s) - 1;
  if (s.generation > 1) return 4;
  if (s.clan.estates.length) return 3;
  if (
    s.clan.episode ||
    s.clan.people.some((p) => (p.id === 10 || p.id === 11) && p.age >= 70)
  )
    return 2;
  if (
    s.world?.paid &&
    s.world.npcs.some((n) => n.met) &&
    s.properties.some((p) => p.owned)
  )
    return 1;
  return 0;
}
