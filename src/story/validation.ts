import type { State } from "../simulation";
import type { StoryState } from "./types";
import { carePlans } from "./definitions";
export function validateStory(s: State) {
  const st = s.story as StoryState,
    finite = (n: unknown) => typeof n === "number" && Number.isFinite(n),
    integer = (n: unknown) => Number.isInteger(n),
    people = new Set(s.clan.people.map((p) => p.id));
  if (
    !st ||
    s.world?.mode !== "story" ||
    st.version !== 1 ||
    st.scenario !== "two-houses-promise" ||
    !integer(st.lastSettledMonth) ||
    st.lastSettledMonth < -1 ||
    st.lastSettledMonth > s.month ||
    !integer(st.startedMonth) ||
    st.startedMonth < 0 ||
    st.startedMonth > s.month ||
    !Array.isArray(st.houses) ||
    st.houses.length !== 2 ||
    !st.time ||
    ![st.time.care, st.time.family, st.time.overtime, st.time.spent].every(
      (n) => integer(n) && n >= 0,
    ) ||
    st.time.care > 24 ||
    st.time.family > 16 ||
    st.time.overtime > 16 ||
    Object.values(st.time).reduce((a, b) => a + b, 0) > 40 ||
    !Array.isArray(st.contacts) ||
    !st.contacts.every((id) => people.has(id)) ||
    !st.lastVisits ||
    !Object.values(st.lastVisits).every(
      (n) => integer(n) && n >= 0 && n <= s.month,
    ) ||
    !integer(st.lastCheckup) ||
    st.lastCheckup < -1 ||
    st.lastCheckup > s.month ||
    !Array.isArray(st.completedEpisodes) ||
    !st.completedEpisodes.every((id) => typeof id === "string") ||
    !Array.isArray(st.parentWishes) ||
    !st.parentWishes.every(
      (w) =>
        people.has(w.personId) &&
        typeof w.text === "string" &&
        w.legalStatus === "intention-only",
    ) ||
    !st.lastSalary ||
    !["base", "bonus", "lost", "housing"].every(
      (k) =>
        finite(st.lastSalary[k as keyof typeof st.lastSalary]) &&
        st.lastSalary[k as keyof typeof st.lastSalary] >= 0,
    ) ||
    typeof st.lastNotice !== "string"
  )
    throw Error("劇情存檔資料無效");
  if (
    new Set(st.houses.map((h) => h.id)).size !== 2 ||
    st.houses.some(
      (h) =>
        !["parents-home", "parents-rental"].includes(h.id) ||
        h.place !== (h.id === "parents-home" ? 8 : 9) ||
        h.use !== (h.id === "parents-home" ? "home" : "rental") ||
        !people.has(h.ownerId) ||
        ![10, 11].includes(h.ownerId) ||
        typeof h.name !== "string" ||
        ![h.value, h.rent, h.maintenance, h.condition].every(
          (n) => finite(n) && n >= 0,
        ) ||
        h.value === 0 ||
        h.condition > 100 ||
        !integer(h.repairUntil) ||
        h.repairUntil < 0 ||
        !integer(h.lastRentMonth) ||
        h.lastRentMonth < -1 ||
        h.lastRentMonth > s.month ||
        !Array.isArray(h.restrictions) ||
        !h.restrictions.every(
          (r) =>
            typeof r.source === "string" &&
            typeof r.scope === "string" &&
            typeof r.verified === "boolean",
        ) ||
        (h.estateId !== undefined &&
          !s.clan.estates.some(
            (e) => e.id === h.estateId && e.ownerId === h.ownerId,
          )),
    )
  )
    throw Error("父母房屋清冊無效");
  const e = st.episode;
  if (e !== null) {
    if (
      !e ||
      typeof e.id !== "string" ||
      ![10, 11].includes(e.parentId) ||
      !people.has(e.parentId) ||
      !integer(e.started) ||
      e.started > s.month ||
      !["needs-plan", "active", "completed", "bereaved"].includes(e.status) ||
      !(e.plan === null || Object.hasOwn(carePlans, e.plan)) ||
      ![
        "monthsTreated",
        "stableMonths",
        "lastPaid",
        "unmetMoney",
        "unmetHours",
      ].every(
        (k) =>
          finite(e[k as keyof typeof e]) &&
          (e[k as keyof typeof e] as number) >= 0,
      ) ||
      !integer(e.lastReviewed) ||
      e.lastReviewed < -1 ||
      e.lastReviewed > s.month ||
      !(
        e.completedMonth === null ||
        (integer(e.completedMonth) && e.completedMonth <= s.month)
      ) ||
      (e.status === "active" && e.plan === null) ||
      !Array.isArray(e.responses) ||
      e.responses.length > 2 ||
      new Set(e.responses.map((r) => r.personId)).size !== e.responses.length ||
      !e.responses.every(
        (r) =>
          [12, 15].includes(r.personId) &&
          people.has(r.personId) &&
          ["support", "counter", "decline", "legal"].includes(r.choice) &&
          ["keep", "sell", "compensation"].includes(r.preference) &&
          finite(r.score) &&
          [r.money, r.hours, r.actualMoney].every((n) => finite(n) && n >= 0) &&
          r.actualMoney <= r.money &&
          Array.isArray(r.reasons) &&
          r.reasons.every((x) => typeof x === "string"),
      )
    )
      throw Error("照顧事件存檔無效");
  }
}
