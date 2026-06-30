import type { Ambience, Category, Spot } from "../data/types";
import type { Lang } from "./lang";

// Central filter logic for the map view.
// OR within a group (e.g. several types), AND between the groups.

export interface MapFilter {
  art: Category[]; // empty = all types
  minPrice: number; // €
  maxPrice: number; // € (100 = "100+")
  minRating: number; // 0 = all
  ambiente: Ambience[]; // empty = all
}

export const DEFAULT_FILTER: MapFilter = {
  art: [],
  minPrice: 0,
  maxPrice: 100,
  minRating: 0,
  ambiente: [],
};

// Representative € value per price level (for the budget filter).
export const PRICE_EURO: Record<1 | 2 | 3, number> = { 1: 15, 2: 40, 3: 75 };

/** Does a spot match the filter? */
export function matchesFilter(s: Spot, f: MapFilter): boolean {
  if (f.art.length > 0 && !f.art.includes(s.category)) return false;
  const euro = PRICE_EURO[s.priceLevel];
  if (euro < f.minPrice || euro > f.maxPrice) return false;
  if (s.rating < f.minRating) return false;
  if (f.ambiente.length > 0 && !f.ambiente.some((a) => s.ambience.includes(a)))
    return false;
  return true;
}

// Selection options + labels for the filter sheet (English defaults).
export const ART_OPTIONS: { label: string; cat: Category }[] = [
  { label: "Bar", cat: "bar" },
  { label: "Restaurant", cat: "restaurant" },
  { label: "Club", cat: "club" },
  { label: "Café", cat: "cafe" },
  { label: "Snack", cat: "snack" },
  { label: "Wine / Cooking", cat: "weintasting" },
  { label: "Sports", cat: "sport" },
];

const ART_OPTIONS_DE: { label: string; cat: Category }[] = [
  { label: "Bar", cat: "bar" },
  { label: "Restaurant", cat: "restaurant" },
  { label: "Club", cat: "club" },
  { label: "Café", cat: "cafe" },
  { label: "Snack", cat: "snack" },
  { label: "Wein / Cooking", cat: "weintasting" },
  { label: "Sport", cat: "sport" },
];

/** Localized type options for the filter sheet. */
export function artOptions(lang: Lang) {
  return lang === "de" ? ART_OPTIONS_DE : ART_OPTIONS;
}

export const RATING_OPTIONS: { label: string; value: number }[] = [
  { label: "All", value: 0 },
  { label: "4.0 ★", value: 4.0 },
  { label: "4.5 ★", value: 4.5 },
];

const RATING_OPTIONS_DE: { label: string; value: number }[] = [
  { label: "Alle", value: 0 },
  { label: "4,0 ★", value: 4.0 },
  { label: "4,5 ★", value: 4.5 },
];

/** Localized rating options (note German comma decimals). */
export function ratingOptions(lang: Lang) {
  return lang === "de" ? RATING_OPTIONS_DE : RATING_OPTIONS;
}

export const AMBIENTE_OPTIONS: { name: Ambience; label: string; desc: string }[] = [
  { name: "intim", label: "Intimate", desc: "dim, snug, for dates & quiet evenings" },
  { name: "lebhaft", label: "Lively", desc: "packed, energetic, loud" },
  { name: "gemütlich", label: "Cozy", desc: "warm, relaxed, made for lingering" },
  { name: "underground", label: "Underground", desc: "raw, hidden, unpolished" },
  { name: "elegant", label: "Elegant", desc: "chic, designed, for special occasions" },
  { name: "draußen", label: "Outdoors", desc: "garden, terrace, courtyard" },
];

const AMBIENTE_OPTIONS_DE: { name: Ambience; label: string; desc: string }[] = [
  { name: "intim", label: "Intim", desc: "gedämpft, eng, für Dates & ruhige Abende" },
  { name: "lebhaft", label: "Lebhaft", desc: "voll, energetisch, laut" },
  { name: "gemütlich", label: "Gemütlich", desc: "warm, entspannt, zum Verweilen" },
  { name: "underground", label: "Underground", desc: "roh, versteckt, ungeschliffen" },
  { name: "elegant", label: "Elegant", desc: "schick, durchdesignt, besonderer Anlass" },
  { name: "draußen", label: "Draußen", desc: "Garten, Terrasse, Hof" },
];

/** Localized ambience options for the filter sheet. */
export function ambienteOptions(lang: Lang) {
  return lang === "de" ? AMBIENTE_OPTIONS_DE : AMBIENTE_OPTIONS;
}
