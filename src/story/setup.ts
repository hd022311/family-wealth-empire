import type { State } from "../simulation";
import type { StoryState } from "./types";
export function setupStory(s: State): StoryState {
  const c = s.clan;
  const father = c.people.find((p) => p.id === 10)!,
    mother = c.people.find((p) => p.id === 11)!;
  father.finances = {
    cash: 800000,
    home: 9600000,
    stocks: 800000,
    business: 0,
    debt: 0,
    income: 24000,
    expenses: 22000,
  };
  mother.finances = {
    cash: 500000,
    home: 6400000,
    stocks: 300000,
    business: 0,
    debt: 0,
    income: 18000,
    expenses: 20000,
  };
  father.health = 74;
  mother.health = 82;
  father.goal = "保留自住房、維持自己的生活與醫療準備";
  mother.goal = "照顧家人，同時保留自己的租金與晚年安排";
  father.responsibilities = ["自負生活與醫療支出", "維護自住房"];
  mother.responsibilities = ["管理出租房", "保留晚年準備金"];
  const brother = c.people.find((p) => p.id === 12)!;
  brother.goal = "保住房貸與孩子的教育安排";
  brother.traits.duty = 78;
  brother.traits.empathy = 65;
  brother.traits.security = 80;
  brother.risk = 35;
  const sister = c.people.find((p) => p.id === 15)!;
  sister.traits.duty = 65;
  sister.traits.empathy = 82;
  sister.traits.security = 60;
  sister.goal = "爭取升遷，同時照顧幼兒與父母";
  sister.finances.debt = 120000;
  sister.responsibilities = [
    "幼兒托育與家庭生活費",
    "職涯進修",
    "父母照顧協商",
  ];
  const partner = structuredClone(c.people.find((p) => p.id === 13)!);
  partner.id = 16;
  partner.name = "周志遠";
  partner.age = 29;
  partner.goal = "建立家庭備用金";
  partner.finances = {
    cash: 100000,
    home: 0,
    stocks: 0,
    business: 0,
    debt: 0,
    income: 40000,
    expenses: 34000,
  };
  partner.traits.security = 78;
  const child = structuredClone(c.people.find((p) => p.id === 14)!);
  child.id = 17;
  child.name = "周小禾";
  child.age = 2;
  child.finances = {
    cash: 0,
    home: 0,
    stocks: 0,
    business: 0,
    debt: 0,
    income: 0,
    expenses: 0,
  };
  child.goal = "探索與成長";
  child.responsibilities = [];
  c.people.push(partner, child);
  c.links.push(
    { from: 15, to: 16, kind: "spouse" },
    { from: 15, to: 17, kind: "parent" },
    { from: 16, to: 17, kind: "parent" },
  );
  return {
    version: 1,
    scenario: "two-houses-promise",
    startedMonth: s.month,
    lastSettledMonth: -1,
    houses: [
      {
        id: "parents-home",
        place: 8,
        ownerId: 10,
        name: "父母自住房",
        use: "home",
        value: 9600000,
        rent: 0,
        maintenance: 1000,
        condition: 86,
        repairUntil: 0,
        lastRentMonth: -1,
        restrictions: [],
      },
      {
        id: "parents-rental",
        place: 9,
        ownerId: 11,
        name: "父母出租房",
        use: "rental",
        value: 6400000,
        rent: 24000,
        maintenance: 1500,
        condition: 78,
        repairUntil: 0,
        lastRentMonth: -1,
        restrictions: [],
      },
    ],
    time: { care: 0, family: 6, overtime: 4, spent: 0 },
    contacts: [],
    lastVisits: {},
    lastCheckup: -1,
    episode: null,
    completedEpisodes: [],
    parentWishes: [
      {
        personId: 10,
        text: "希望在熟悉的家生活，照顧與修繕一起討論；財產安排由我自己決定。",
        legalStatus: "intention-only",
      },
      {
        personId: 11,
        text: "租金是我的晚年準備，希望家人保有各自生活；未作成遺囑或受益人安排。",
        legalStatus: "intention-only",
      },
    ],
    lastSalary: { base: 42000, bonus: 0, lost: 0, housing: 0 },
    lastNotice: "先過好自己的日子：工作、回家陪伴、探望父母，順路看看出租屋。",
  };
}
