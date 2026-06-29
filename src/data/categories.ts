import type { Category } from "./types";

/**
 * Filter configuration for the discovery feed.
 * `key === null` is the "All" filter. The `label` is the wording from the
 * mockup ("Coffee" instead of "Café", "Bars" instead of "Bar", etc.).
 */
export interface CategoryFilter {
  key: Category | null;
  label: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { key: null, label: "All" },
  { key: "restaurant", label: "Restaurant" },
  { key: "snack", label: "Snack" },
  { key: "cafe", label: "Coffee" },
  { key: "bar", label: "Bars" },
  { key: "club", label: "Clubs" },
  { key: "weintasting", label: "Wine / Cooking" },
  { key: "sport", label: "Sports" },
];

/** Short caps label per category (for the district line on cards). */
export const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "RESTAURANT",
  snack: "SNACK",
  cafe: "CAFÉ",
  bar: "BAR",
  club: "CLUB",
  weintasting: "WINE / COOKING",
  sport: "SPORTS",
};

// "Event-like" categories: they show date/meeting point/ticket and, on the map,
// the rectangle box with a date.
export const EVENT_CATEGORIES: Category[] = ["weintasting", "sport"];
export const isEventCategory = (c: Category) => EVENT_CATEGORIES.includes(c);

/** € display from the priceLevel (1–3). */
export function priceLabel(level: 1 | 2 | 3): string {
  return "€".repeat(level);
}

// Fixed sort order of the categories (for all listings, so the cards don't
// appear chaotically mixed but grouped by type).
export const CATEGORY_ORDER: Record<Category, number> = {
  restaurant: 0,
  snack: 1,
  cafe: 2,
  bar: 3,
  club: 4,
  weintasting: 5,
  sport: 6,
};

// Sorts spots by category (stable -> order within the same category is
// preserved).
export function sortByCategory<T extends { category: Category }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
  );
}
