/** Presentation consumes events; it never commits financial or life changes. */
export type CityEventKind =
  | "purchase"
  | "move-in"
  | "vacant"
  | "rent"
  | "sale"
  | "renovation"
  | "business"
  | "expansion"
  | "marriage"
  | "birth"
  | "retirement"
  | "death"
  | "succession"
  | "family";
export type CityEvent = {
  id: string;
  kind: CityEventKind;
  month: number;
  title: string;
  propertyId?: number;
  placeId?: number;
  amount?: number;
  memberId?: number;
};
export type CityHistory = { sequence: number; events: CityEvent[] };
export type CitySettings = {
  quality: "low" | "high";
  reducedMotion: boolean;
  phase: "auto" | "day" | "dusk" | "night";
  weather: "auto" | "sunny" | "cloudy" | "rainy";
};
export const SETTINGS_KEY = "fwe-city-settings-v1";
export function readCitySettings(
  storage: Pick<Storage, "getItem">,
  reduced = false,
  mobile = false,
): CitySettings {
  const defaults: CitySettings = {
    quality: mobile ? "low" : "high",
    reducedMotion: reduced,
    phase: "auto",
    weather: "auto",
  };
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const s = JSON.parse(raw);
    return {
      quality: ["low", "high"].includes(s.quality)
        ? s.quality
        : defaults.quality,
      reducedMotion:
        typeof s.reducedMotion === "boolean" ? s.reducedMotion : reduced,
      phase: ["auto", "day", "dusk", "night"].includes(s.phase)
        ? s.phase
        : "auto",
      weather: ["auto", "sunny", "cloudy", "rainy"].includes(s.weather)
        ? s.weather
        : "auto",
    };
  } catch {
    return defaults;
  }
}
export function environmentAt(activeMs: number, settings: CitySettings) {
  const time = settings.reducedMotion ? 0 : Math.max(0, activeMs);
  const hour = (6 + (time / 90000) * 24) % 24;
  const phase =
    settings.phase === "auto"
      ? hour >= 7 && hour < 17
        ? "day"
        : (hour >= 17 && hour < 20) || (hour >= 5 && hour < 7)
          ? "dusk"
          : "night"
      : settings.phase;
  const weather =
    settings.weather === "auto"
      ? (["sunny", "cloudy", "rainy"] as const)[Math.floor(time / 45000) % 3]
      : settings.weather;
  return {
    phase,
    weather,
    night: phase === "night" ? 1 : phase === "dusk" ? 0.35 : 0,
  };
}
export const clampZoom = (zoom: number) => Math.max(0.7, Math.min(1.8, zoom));
export const ageAppearance = (age: number) =>
  age < 6 ? "baby" : age < 18 ? "child" : age < 65 ? "adult" : "elder";
