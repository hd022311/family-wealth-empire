import type { State } from "../simulation";
export const STORY_TITLE = "兩間房子的承諾";
export const storyChapters = [
  {
    id: 1,
    title: "平凡的日子",
    status: "playable",
    events: ["family-routine", "salary", "rental-check"],
    legal: [],
  },
  {
    id: 2,
    title: "父母老了",
    status: "playable",
    events: [
      "health-check",
      "care-plan",
      "sibling-response",
      "care-review",
      "house-repair",
    ],
    legal: [],
  },
  {
    id: 3,
    title: "父母的心願",
    status: "framework",
    events: [
      "independent-parent-intention",
      "will-form-review",
      "optional-insurance-review",
    ],
    legal: ["遺囑形式與效力", "夫妻財產", "保險契約與指定受益人"],
  },
  {
    id: 4,
    title: "遺囑公布",
    status: "framework",
    events: [
      "individual-death-inventory",
      "will-disclosure",
      "reserved-share-review",
    ],
    legal: [
      "法定應繼分",
      "特留分",
      "遺囑指定財產",
      "生前贈與",
      "夫妻財產權利",
      "死亡年度稅務",
    ],
  },
  {
    id: 5,
    title: "繼承爭議",
    status: "framework",
    events: [
      "partition-negotiation",
      "verified-asset-restriction",
      "legal-costs",
      "optional-verified-insurance-claim",
    ],
    legal: ["遺產分割協議", "實際處分限制", "保險金給付與稅務", "法律程序費用"],
  },
  {
    id: 6,
    title: "下一代",
    status: "framework",
    events: ["continue-business", "dispute-history", "successor"],
    legal: ["已確認的所有權與債務", "未決爭議承接"],
  },
] as const;
export function storyStage(s: State) {
  return s.story?.episode || s.story?.completedEpisodes.length ? 2 : 1;
}
export function familyPlace(id: number) {
  return id === 10 || id === 11
    ? 8
    : id === 12 || id === 15 || id >= 16
      ? 7
      : 0;
}
export const carePlans = {
  professional: {
    name: "專業照護",
    initial: 24000,
    monthlyNeed: 28000,
    playerLimit: 20000,
    hours: 4,
  },
  shared: {
    name: "家庭共同照顧",
    initial: 12000,
    monthlyNeed: 18000,
    playerLimit: 10000,
    hours: 12,
  },
  personal: {
    name: "親自陪伴照顧",
    initial: 6000,
    monthlyNeed: 14000,
    playerLimit: 6000,
    hours: 20,
  },
};
export function storyTasks(s: State) {
  const st = s.story!;
  return [
    {
      id: "salary",
      text: "經營自己的職涯，完成一個月工作",
      done: (s.world?.paid ?? 0) > 0,
      place: 5,
    },
    {
      id: "partner",
      text: "回家陪伴配偶與孩子",
      done:
        st.contacts.includes(1) &&
        st.contacts.some((id) => id === 2 || id === 3),
      place: 0,
    },
    {
      id: "parents",
      text: "探望父母，了解兩間房子的生活",
      done: st.contacts.some((id) => id === 10 || id === 11),
      place: 8,
    },
    {
      id: "rental",
      text: "到出租屋整理租客與收支近況",
      done: st.lastVisits["rental"] !== undefined,
      place: 9,
    },
    {
      id: "siblings",
      text: "在社區中心與兩名手足見面",
      done: st.contacts.includes(12) && st.contacts.includes(15),
      place: 7,
    },
    {
      id: "health",
      text: "陪父母健檢，安排照顧與分工",
      done: st.lastCheckup >= st.startedMonth,
      place: 8,
    },
    {
      id: "recovery",
      text: "完成照顧追蹤，回到持續經營的人生",
      done: st.completedEpisodes.length > 0,
      place: 7,
    },
  ];
}
