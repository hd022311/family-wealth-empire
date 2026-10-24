import { pathTo } from "./navigation";
export const places = [
  { name: "住宅區", x: 1, y: 2 },
  { name: "商業區", x: 5, y: 2 },
  { name: "商店", x: 2, y: 5 },
  { name: "住宅街", x: 5, y: 6 },
  { name: "銀行", x: 6, y: 3 },
  { name: "公司", x: 7, y: 2 },
  { name: "公園", x: 6, y: 6 },
  { name: "社區中心", x: 1, y: 6 },
  { name: "父母自住房", x: 0, y: 1 },
  { name: "父母出租房", x: 6, y: 7 },
];
export const jobs = [
  { id: "office", name: "企劃專員", place: 5, pay: 42000, skill: 0 },
  { id: "retail", name: "門市營運", place: 2, pay: 35000, skill: 0 },
  { id: "finance", name: "金融行政", place: 4, pay: 48000, skill: 12 },
  { id: "freelance", name: "社區數位接案", place: 7, pay: 32000, skill: 12 },
];
export type Citizen = {
  id: number;
  name: string;
  age: number;
  cash: number;
  job: number;
  skill: number;
  goal: string;
  duty: number;
  risk: number;
  household: string;
  place: number;
  met: boolean;
  trust: number;
  lastChat: number;
};
export type World = {
  version: 1;
  mode: "story" | "free";
  seed: number;
  name: string;
  familyName: string;
  place: number;
  position: { x: number; y: number };
  job: string;
  skill: number;
  experience: number;
  paid: number;
  venture: boolean;
  ventureIncome: number;
  visits: number[];
  npcs: Citizen[];
  memories: string[];
  trained: number;
  talent: Record<string, number>;
  previousCareers: string[];
};
export function salary(world?: World) {
  return world
    ? (jobs.find((j) => j.id === world.job)?.pay ?? 0) +
        (world.job ? Math.floor(world.experience / 12) * 2000 : 0)
    : 52000;
}
export function random(w: World) {
  w.seed = (Math.imul(w.seed, 1664525) + 1013904223) >>> 0;
  return w.seed / 4294967296;
}
export function newWorld(
  mode: World["mode"],
  name: string,
  familyName: string,
): World {
  return {
    version: 1,
    mode,
    seed: 20261023,
    name,
    familyName,
    place: 0,
    position: { x: 1, y: 2 },
    job: mode === "story" ? "office" : "",
    skill: 8,
    experience: 0,
    paid: 0,
    venture: false,
    ventureIncome: 0,
    visits: [0],
    memories: [],
    trained: -1,
    talent: {},
    previousCareers: [],
    npcs: [
      "陳美玲",
      "吳志豪",
      "黃心怡",
      "蔡宇軒",
      "張雅婷",
      "李明哲",
      "許家慧",
      "周子安",
    ].map((name, i) => ({
      id: 100 + i,
      name,
      age: 25 + i * 3,
      cash: 120000 + i * 20000,
      job: i % 4,
      skill: 8 + i,
      goal: ["穩定家庭", "創業", "培養專業", "照顧長輩"][i % 4],
      duty: 30 + i * 7,
      risk: 20 + i * 9,
      household: i % 2 ? "與配偶育有一名子女" : "與父母共同生活",
      place: [5, 2, 4, 7][i % 4],
      met: false,
      trust: 0,
      lastChat: -1,
    })),
  };
}
export function validateWorld(w: World) {
  const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
  if (
    !w ||
    w.version !== 1 ||
    !["story", "free"].includes(w.mode) ||
    !Number.isInteger(w.seed) ||
    w.seed < 0 ||
    w.seed > 4294967295 ||
    !Number.isInteger(w.place) ||
    !(w.place === -1 || places[w.place]) ||
    !finite(w.position?.x) ||
    !finite(w.position?.y) ||
    w.position.x < 0 ||
    w.position.x > 7 ||
    w.position.y < 0 ||
    w.position.y > 7 ||
    !pathTo(w.position, w.position).length ||
    typeof w.name !== "string" ||
    typeof w.familyName !== "string" ||
    !(w.job === "" || jobs.some((j) => j.id === w.job)) ||
    ![w.skill, w.experience, w.paid, w.ventureIncome, w.trained].every(
      finite,
    ) ||
    typeof w.venture !== "boolean" ||
    !Array.isArray(w.npcs) ||
    w.npcs.length !== 8 ||
    !Array.isArray(w.memories) ||
    w.memories.length > 150 ||
    !w.memories.every((m) => typeof m === "string") ||
    !Array.isArray(w.visits) ||
    !w.visits.every((p) => Number.isInteger(p) && !!places[p]) ||
    !w.talent ||
    !Object.values(w.talent).every(finite) ||
    !Array.isArray(w.previousCareers) ||
    !w.previousCareers.every((j) => typeof j === "string")
  )
    throw Error("人生存檔資料無效");
  if (
    new Set(w.npcs.map((n) => n.id)).size !== 8 ||
    w.npcs.some(
      (n) =>
        typeof n.name !== "string" ||
        typeof n.goal !== "string" ||
        typeof n.household !== "string" ||
        !Number.isInteger(n.id) ||
        ![n.age, n.cash, n.skill, n.trust, n.lastChat, n.duty, n.risk].every(
          finite,
        ) ||
        !Number.isInteger(n.job) ||
        !jobs[n.job] ||
        !places[n.place] ||
        typeof n.met !== "boolean",
    )
  )
    throw Error("城市人物存檔資料無效");
}
