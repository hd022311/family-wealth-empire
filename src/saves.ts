import { initial, parseSave, type State } from "./simulation";
export type Generation = { generation: number; atMonth: number; state: State };
export type Slot = {
  id: string;
  name: string;
  state: State;
  revision: number;
  owner: string | null;
  dirty: boolean;
  updatedAt: number;
  generations: Generation[];
};
export type Library = { version: 1; active: string; slots: Slot[] };
export const LIBRARY_KEY = "fwe-library-v1";
export function makeSlot(name: string, state = initial()): Slot {
  return {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 60) || "新的家族",
    state,
    revision: 0,
    owner: null,
    dirty: true,
    updatedAt: Date.now(),
    generations: [],
  };
}
export function validateSlot(v: Slot): Slot {
  if (
    !v ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      v.id,
    ) ||
    typeof v.name !== "string" ||
    !v.name.trim() ||
    v.name.length > 60 ||
    !Number.isInteger(v.revision) ||
    v.revision < 0 ||
    !(v.owner === null || typeof v.owner === "string") ||
    typeof v.dirty !== "boolean" ||
    !Number.isFinite(v.updatedAt) ||
    !Array.isArray(v.generations) ||
    v.generations.length > 200
  )
    throw Error("家族存檔資料無效");
  v.state = parseSave(JSON.stringify(v.state));
  v.generations.forEach((g) => {
    if (!Number.isInteger(g.generation) || !Number.isFinite(g.atMonth))
      throw Error("世代紀錄無效");
    g.state = parseSave(JSON.stringify(g.state));
  });
  return v;
}
export function readLibrary(storage: Pick<Storage, "getItem">): Library {
  const raw = storage.getItem(LIBRARY_KEY);
  if (raw) {
    const lib = JSON.parse(raw) as Library;
    if (
      lib.version !== 1 ||
      !Array.isArray(lib.slots) ||
      !lib.slots.length ||
      lib.slots.length > 100
    )
      throw Error("家族列表損壞");
    lib.slots.forEach(validateSlot);
    if (
      new Set(lib.slots.map((s) => s.id)).size !== lib.slots.length ||
      !lib.slots.some((s) => s.id === lib.active)
    )
      throw Error("家族列表損壞");
    return lib;
  }
  const old = storage.getItem("family-wealth-empire-v1");
  const slot = makeSlot("林家・第一個家族", old ? parseSave(old) : initial());
  return { version: 1, active: slot.id, slots: [slot] };
}
export function updateSlot(slot: Slot, state: State): Slot {
  const generations = [...slot.generations];
  if (state.generation > slot.state.generation)
    generations.push({
      generation: slot.state.generation,
      atMonth: slot.state.month,
      state: structuredClone(slot.state),
    });
  return { ...slot, state, dirty: true, updatedAt: Date.now(), generations };
}
export function returnSummary(slot: Slot, now = Date.now()): string {
  const hours = Math.max(0, (now - slot.updatedAt) / 3600000);
  // Phase 1 safe bound: ZERO offline financial progress. No age, debt or price changes.
  return hours < 0.1
    ? "已接續家族進度。"
    : `離開約 ${Math.floor(hours)} 小時；年齡、資產、房貸與虛構股價均未離線推進。可繼續處理房產、投資與家族事件。`;
}
export type CloudRow = {
  id: string;
  name: string;
  revision: number;
  snapshot: unknown;
  owner_id: string;
  updated_at: string;
};
export function fromCloud(row: CloudRow): Slot {
  const payload = row.snapshot as { state: State; generations: Generation[] };
  return validateSlot({
    id: row.id,
    name: row.name,
    revision: row.revision,
    owner: row.owner_id,
    dirty: false,
    updatedAt: Date.parse(row.updated_at),
    state: payload.state,
    generations: payload.generations,
  });
}
export function syncDecision(
  local: Slot,
  remote: Slot | undefined,
  uid: string,
): "upload" | "download" | "conflict" | "unchanged" | "foreign" {
  if (local.owner && local.owner !== uid) return "foreign";
  if (!remote) return local.revision === 0 ? "upload" : "conflict";
  if (remote.owner !== uid) return "foreign";
  if (remote.revision !== local.revision)
    return local.dirty ? "conflict" : "download";
  return local.dirty ? "upload" : "unchanged";
}
