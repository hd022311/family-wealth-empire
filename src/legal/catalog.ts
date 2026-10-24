export type LegalModule =
  | "statutory"
  | "representation"
  | "reserved"
  | "wills"
  | "gifts"
  | "marital"
  | "debts"
  | "partition"
  | "tax"
  | "insurance"
  | "support";
export type LawSource = {
  id: string;
  law: string;
  articles: string[];
  url: string;
  promulgatedOn: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  revision: string;
  verification: "pending" | "official_reviewed" | "test_fixture";
  verifiedOn: string | null;
  conditions: string;
  contentHash: string | null;
  algorithmVersion: string | null;
};
export type LawTopic = {
  id: LegalModule;
  title: string;
  plain: string;
  example: string;
  disputes: string[];
  sourceIds: string[];
  judgments: { title: string; url: string }[];
};
const civil = (articles: string[], id: string): LawSource => ({
  id,
  law: "民法",
  articles,
  url: `https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0000001&flno=${articles[0]}`,
  promulgatedOn: null,
  effectiveFrom: null,
  effectiveTo: null,
  revision: "pending-official-review-2026-10-23",
  verification: "pending",
  verifiedOn: null,
  conditions:
    "須核對官方條文及死亡日適用版本；本機網路 CONNECT 403，未完成法源驗證",
  contentHash: null,
  algorithmVersion: null,
});
export const sources: LawSource[] = [
  civil(["1138", "1139", "1144"], "statutory"),
  civil(["1140"], "representation"),
  civil(["1223", "1224", "1225"], "reserved"),
  civil(
    ["1187", "1189", "1190", "1191", "1192", "1193", "1194", "1195", "1197"],
    "wills",
  ),
  civil(["1173"], "gifts"),
  civil(["1030-1"], "marital"),
  civil(["1148", "1153"], "debts"),
  civil(["1151", "1164", "1165"], "partition"),
  {
    ...civil(["18", "17", "13", "22", "19"], "tax"),
    law: "遺產及贈與稅法",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340003",
  },
  {
    ...civil(["112"], "insurance"),
    law: "保險法",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390002",
  },
  civil(["1114", "1115", "1117", "1119"], "support"),
];
export const topics: LawTopic[] = [
  {
    id: "statutory",
    title: "法定繼承人與應繼分",
    plain:
      "配偶與不同順位血親的繼承資格及份額，須依親屬、存歿、資格與死亡日期確認，不能用親密度改寫。",
    example:
      "父親過世，先確認配偶、子女、死亡日期及身分，再計算份額；父親生前財產不是玩家財產。",
    disputes: [
      "親子或婚姻身分不明",
      "拋棄、失權及親屬資料不完整",
      "份額不等於每項財產可以直接出售",
    ],
    sourceIds: ["statutory"],
    judgments: [],
  },
  {
    id: "representation",
    title: "代位繼承",
    plain:
      "直系卑親屬有符合代位要件的情形，才按支系處理；不能將所有孫子女和子女混合平均。",
    example:
      "某子女先於父親死亡，其符合要件的子女是否代位，需核實適用條文及事實。",
    disputes: [
      "先死亡、喪失繼承權與拋棄繼承不可混為一談",
      "支系及最近親等須確認",
    ],
    sourceIds: ["representation", "statutory"],
    judgments: [],
  },
  {
    id: "reserved",
    title: "特留分與法律版本",
    plain:
      "特留分與應繼分不同；須選死亡日期適用的條文版本，再檢查遺囑、財產範圍及侵害爭議。",
    example:
      "2025 與 2026 的案件分別查版本；未核實修法施行日期時，不能直接套網站最新文字。",
    disputes: ["不預設 2026 年修法已施行", "侵害、扣減及個別案件效果待確認"],
    sourceIds: ["reserved"],
    judgments: [],
  },
  {
    id: "wills",
    title: "遺囑形式與效力",
    plain:
      "遺囑形式、能力及其他要件須逐項審查。口頭承諾不能直接當成有效遺囑；口授遺囑也有特別要件。",
    example: "父親說過「祖厝留給你」只記為承諾，不自動移轉產權或視為有效遺囑。",
    disputes: ["文件真偽、見證及法定形式", "有效性不明時不直接排除法定繼承人"],
    sourceIds: ["wills"],
    judgments: [],
  },
  {
    id: "gifts",
    title: "生前贈與與歸扣",
    plain:
      "生前贈與先確認財產移轉、用途與歸扣要件；不是所有贈與都用同一公式加回。",
    example: "協助手足的生活費、借款與特定用途贈與分別記帳，不自動扣其應繼分。",
    disputes: ["贈與性質及歸扣要件", "贈與稅與民法歸扣是不同問題"],
    sourceIds: ["gifts", "tax"],
    judgments: [],
  },
  {
    id: "marital",
    title: "夫妻財產與剩餘財產請求",
    plain:
      "先確認財產所有權、夫妻財產制及是否有差額分配請求，再界定遺產；不能把夫妻所有財產都放進遺產。",
    example: "母親自己的存款與父親遺產分開；可能的夫妻財產請求列待確認。",
    disputes: ["婚前、婚後、特有財產及證據", "不能以婚姻關係直接推定各半"],
    sourceIds: ["marital"],
    judgments: [],
  },
  {
    id: "debts",
    title: "遺產債務與責任",
    plain:
      "需清查遺產及債務、分辨個人與遺產責任，並確認法律限制與例外；不把遺債無條件扣入玩家個人帳戶。",
    example: "父親的房貸留在其資產清冊，未完成法律處理前不轉成玩家私人房貸。",
    disputes: ["擔保、清冊、清償程序與例外責任"],
    sourceIds: ["debts"],
    judgments: [],
  },
  {
    id: "partition",
    title: "遺產共有與分割協議",
    plain:
      "法定份額與具體分割是兩件事。家人可以協商，但有效協議與不動產處分要件必須另外確認。",
    example:
      "會議記錄保留祖厝的意向，並不等於完成產權登記；任何一方反對也不代表其必然勝訴。",
    disputes: [
      "未一致同意的方案",
      "不動產處分、登記與協議效力",
      "法院裁量不可自行預測",
    ],
    sourceIds: ["partition"],
    judgments: [],
  },
  {
    id: "tax",
    title: "遺產稅、贈與稅及年度金額",
    plain:
      "年度免稅額、扣除額、級距及適用身分需要官方公告。資料缺少時不估一個看似精確的稅額。",
    example:
      "死亡年度 2025、2026 分別查表；沒有經核實資料即顯示待確認，而非零稅額。",
    disputes: ["居住、國籍、財產估價與扣除證明", "年度調整公告及適用日"],
    sourceIds: ["tax"],
    judgments: [],
  },
  {
    id: "insurance",
    title: "保險契約與受益人",
    plain:
      "須分別確認要保人、被保險人、受益人與契約條款；保險給付、遺產範圍及稅務不可一概處理。",
    example: "清冊列有保單但受益人不明，先列待確認，不直接加進遺產現金。",
    disputes: ["契約效力與受益人指定", "民法財產歸屬與課稅處理不同"],
    sourceIds: ["insurance", "tax"],
    judgments: [],
  },
  {
    id: "support",
    title: "扶養義務與照顧費用",
    plain:
      "扶養資格、順位、需要與能力及費用分擔須依要件判斷。遊戲中的自願付費不等於法院已認定任何人的法定責任。",
    example:
      "手足有房貸與育兒壓力，會影響協商能力，但不能單憑遊戲壓力值認定免除扶養義務。",
    disputes: ["受扶養需要與各人的負擔能力", "費用請求的法律依據與證據"],
    sourceIds: ["support"],
    judgments: [],
  },
];
export function searchTopics(query: string, topic = "all") {
  const key = query.trim().toLowerCase();
  const article = key.match(/(?:第)?(\d+(?:-\d+)?)(?:條)?/);
  return topics.filter(
    (t) =>
      (topic === "all" || t.id === topic) &&
      (!key ||
        (article &&
          t.sourceIds.some((id) =>
            sources.find((s) => s.id === id)?.articles.includes(article[1]),
          )) ||
        `${t.title} ${t.plain} ${t.example} ${t.sourceIds.flatMap((id) => sources.find((s) => s.id === id)?.articles ?? []).join(" ")} ${t.sourceIds.map((id) => sources.find((s) => s.id === id)?.law).join(" ")}`
          .toLowerCase()
          .includes(key)),
  );
}
