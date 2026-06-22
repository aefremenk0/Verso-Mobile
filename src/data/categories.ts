import type { Category } from "./types";

/**
 * Filter-Konfiguration für den Discovery-Feed.
 * `key === null` ist der "Alle"-Filter. Das `label` ist das Wording aus dem
 * Mockup ("Kaffee" statt "Café", "Bars" statt "Bar" usw.).
 */
export interface CategoryFilter {
  key: Category | null;
  label: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { key: null, label: "Alle" },
  { key: "restaurant", label: "Restaurant" },
  { key: "snack", label: "Snack" },
  { key: "cafe", label: "Kaffee" },
  { key: "bar", label: "Bars" },
  { key: "club", label: "Clubs" },
  { key: "event", label: "Events" },
];

/** Kurzes Caps-Label pro Kategorie (für die Bezirks-Zeile auf Karten). */
export const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "RESTAURANT",
  snack: "SNACK",
  cafe: "CAFÉ",
  bar: "BAR",
  club: "CLUB",
  event: "EVENT",
};

/** €-Anzeige aus dem priceLevel (1–3). */
export function priceLabel(level: 1 | 2 | 3): string {
  return "€".repeat(level);
}
