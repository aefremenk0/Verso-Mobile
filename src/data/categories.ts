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
  { key: "weintasting", label: "Wein / Cooking" },
  { key: "sport", label: "Sport" },
];

/** Kurzes Caps-Label pro Kategorie (für die Bezirks-Zeile auf Karten). */
export const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "RESTAURANT",
  snack: "SNACK",
  cafe: "CAFÉ",
  bar: "BAR",
  club: "CLUB",
  weintasting: "WEIN / COOKING",
  sport: "SPORT",
};

// „Event-artige" Kategorien: zeigen Datum/Treffpunkt/Ticket und auf der Karte
// die Rechteck-Box mit Datum.
export const EVENT_CATEGORIES: Category[] = ["weintasting", "sport"];
export const isEventCategory = (c: Category) => EVENT_CATEGORIES.includes(c);

/** €-Anzeige aus dem priceLevel (1–3). */
export function priceLabel(level: 1 | 2 | 3): string {
  return "€".repeat(level);
}

// Feste Sortier-Reihenfolge der Kategorien (für alle Auflistungen, damit die
// Karten nicht chaotisch gemischt, sondern nach Art gruppiert erscheinen).
export const CATEGORY_ORDER: Record<Category, number> = {
  restaurant: 0,
  snack: 1,
  cafe: 2,
  bar: 3,
  club: 4,
  weintasting: 5,
  sport: 6,
};

// Sortiert Spots nach Kategorie (stabil -> Reihenfolge innerhalb gleicher
// Kategorie bleibt erhalten).
export function sortByCategory<T extends { category: Category }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
  );
}
