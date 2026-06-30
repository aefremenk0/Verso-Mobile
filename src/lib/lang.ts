// Language support: two languages, English and German. The canonical data keys
// (e.g. the city value "München") stay German so we never break data/IDs when
// switching language — only the *display* labels are mapped per language.
export type Lang = "en" | "de";

// City display labels. Keys are the canonical City values (German); values are
// the English display names. In German we show the canonical key itself.
const CITY_EN: Record<string, string> = {
  München: "Munich",
  Wien: "Vienna",
  Zürich: "Zurich",
  Berlin: "Berlin",
  Hamburg: "Hamburg",
  Frankfurt: "Frankfurt",
  Düsseldorf: "Düsseldorf",
};

/** Localized display name for a city (the canonical key stays German). */
export function cityLabel(city: string, lang: Lang): string {
  return lang === "de" ? city : CITY_EN[city] ?? city;
}

/** Pure picker for non-hook contexts: pick(lang, "English", "Deutsch"). */
export function pick(lang: Lang, en: string, de: string): string {
  return lang === "de" ? de : en;
}
