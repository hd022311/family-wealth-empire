import type { Decision } from "../family/types";
export type StoryHouse = {
  id: "parents-home" | "parents-rental";
  place: 8 | 9;
  ownerId: number;
  name: string;
  use: "home" | "rental";
  value: number;
  rent: number;
  maintenance: number;
  condition: number;
  repairUntil: number;
  lastRentMonth: number;
  estateId?: string;
  restrictions: { source: string; scope: string; verified: boolean }[];
};
export type CarePlan = "professional" | "shared" | "personal";
export type CareResponse = Decision & {
  money: number;
  hours: number;
  actualMoney: number;
};
export type CareEpisode = {
  id: string;
  parentId: number;
  started: number;
  status: "needs-plan" | "active" | "completed" | "bereaved";
  plan: CarePlan | null;
  monthsTreated: number;
  stableMonths: number;
  lastReviewed: number;
  responses: CareResponse[];
  lastPaid: number;
  unmetMoney: number;
  unmetHours: number;
  completedMonth: number | null;
};
export type StoryState = {
  version: 1;
  scenario: "two-houses-promise";
  startedMonth: number;
  lastSettledMonth: number;
  houses: StoryHouse[];
  time: { care: number; family: number; overtime: number; spent: number };
  contacts: number[];
  lastVisits: Record<string, number>;
  lastCheckup: number;
  episode: CareEpisode | null;
  completedEpisodes: string[];
  parentWishes: {
    personId: number;
    text: string;
    legalStatus: "intention-only";
  }[];
  lastSalary: { base: number; bonus: number; lost: number; housing: number };
  lastNotice: string;
};
export type StoryAction =
  | { type: "visit"; personId: number }
  | { type: "inspect-rental" }
  | { type: "checkup"; parentId: number }
  | { type: "plan"; care: number; family: number; overtime: number }
  | { type: "choose-care"; plan: CarePlan }
  | { type: "ask-siblings" }
  | { type: "repair"; place: 8 | 9; funding: "parent" | "player" };
