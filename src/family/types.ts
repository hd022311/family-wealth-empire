import type { StoryHouse } from "../story/types";
import type { Property } from "../simulation";
import type { SuccessionFacts } from "../legal/engine";
export type Background = "legacy" | "self-made" | "wealthy" | "ordinary";
export type Finances = {
  cash: number;
  home: number;
  stocks: number;
  business: number;
  debt: number;
  income: number;
  expenses: number;
};
export type Person = {
  id: number;
  name: string;
  age: number;
  alive: boolean;
  health: number;
  traits: { duty: number; autonomy: number; security: number; empathy: number };
  values: { home: number; fairness: number; legacy: number };
  risk: number;
  goal: string;
  responsibilities: string[];
  finances: Finances;
};
export type Link = { from: number; to: number; kind: "parent" | "spouse" };
export type Relation = {
  a: number;
  b: number;
  closeness: number;
  trust: number;
  conflict: number;
  careHours: number;
  helpGiven: number;
};
export type Memory = {
  id: string;
  month: number;
  generation: number;
  kind: "fact" | "perception" | "document";
  actor: number;
  subject: number;
  observer: number | null;
  text: string;
  category:
    | "care"
    | "gift"
    | "loan"
    | "promise"
    | "agreement"
    | "conflict"
    | "life"
    | "inheritance";
  documentStatus?: "unreviewed" | "reviewed";
  kept?: boolean;
};
export type FamilyTransaction = {
  id: string;
  month: number;
  label: string;
  postings: { account: string; delta: number }[];
};
export type Decision = {
  personId: number;
  choice: "support" | "counter" | "decline" | "legal";
  preference: "keep" | "sell" | "compensation";
  reasons: string[];
  score: number;
};
export type FamilyEpisode = {
  phase: "illness" | "sibling" | "care" | "inheritance" | "settled-intent";
  fatherId: number;
  started: number;
  careMonthly: number;
  careHours: number;
  lastChoice: string;
  treatment: "none" | "medical" | "shared" | "time" | "defer";
  responses: Decision[];
  reviewMonth: number;
  active: boolean;
};
export type Portfolio = {
  cash: number;
  properties: Property[];
  shares: number[];
  prices: number[];
};
export type Estate = {
  id: string;
  ownerId: number;
  deathDate: string;
  finances: Finances;
  portfolio?: Portfolio;
  storyProperties?: StoryHouse[];
  facts: SuccessionFacts;
  status:
    "awaiting-facts" | "negotiating" | "disputed" | "pending-law" | "held";
  proposal: "keep" | "sell" | "compensation" | null;
  responses: Decision[];
  legalProceedings: boolean;
};
export type Clan = {
  version: 1;
  background: Background;
  activeId: number;
  seed: number;
  sequence: number;
  people: Person[];
  links: Link[];
  relations: Relation[];
  memories: Memory[];
  transactions: FamilyTransaction[];
  promises: {
    id: string;
    personId: number;
    hours: number;
    fulfilled: number;
  }[];
  loans: {
    creditor: number;
    debtor: number;
    amount: number;
    legalStatus: "unreviewed";
    month: number;
  }[];
  episode: FamilyEpisode | null;
  estates: Estate[];
  playerHealth: number;
  workPenaltyMonths: number;
  lastNotice: string;
};
export type FamilyAction =
  | { type: "background"; background: Exclude<Background, "legacy"> }
  | { type: "start-story" }
  | { type: "visit" | "assist" | "loan" | "promise"; personId: number }
  | { type: "care"; choice: "medical" | "shared" | "time" | "defer" }
  | { type: "burden"; choice: "gift" | "loan" | "time" | "meeting" }
  | { type: "meeting"; proposal: "keep" | "sell" | "compensation" }
  | { type: "review-estate"; estateId: string }
  | { type: "legal-route"; estateId: string };
