import type { Lang } from "../lib/lang";
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
  // Eating
  { key: "restaurant", label: "Restaurant" },
  { key: "snack", label: "Snack" },
  { key: "cafe", label: "Coffee" },
  { key: "weintasting", label: "Wine / Cooking" },
  { key: "dessert", label: "Sweets" },
  { key: "streetfood", label: "Street Food" },
  { key: "biergarten", label: "Beer Garden" },
  // Going out
  { key: "bar", label: "Bars" },
  { key: "club", label: "Clubs" },
  { key: "rooftop", label: "Rooftop" },
  // Sport (Insider)
  { key: "sport", label: "Sports" },
  { key: "pilates", label: "Pilates" },
  { key: "runclub", label: "Run Club" },
  { key: "cycleclub", label: "Cycle Club" },
  { key: "gym", label: "Gym" },
  // Live Events (Insider)
  { key: "konzerte", label: "Concerts" },
  { key: "livemusik", label: "Live Music" },
  { key: "kino", label: "Cinema / Date" },
];

const CATEGORY_FILTERS_DE: CategoryFilter[] = [
  { key: null, label: "Alle" },
  // Essen
  { key: "restaurant", label: "Restaurant" },
  { key: "snack", label: "Snack" },
  { key: "cafe", label: "Kaffee" },
  { key: "weintasting", label: "Wein / Cooking" },
  { key: "dessert", label: "Süßes" },
  { key: "streetfood", label: "Street Food" },
  { key: "biergarten", label: "Biergarten" },
  // Feiern
  { key: "bar", label: "Bars" },
  { key: "club", label: "Clubs" },
  { key: "rooftop", label: "Rooftop" },
  // Sport (Insider)
  { key: "sport", label: "Sport" },
  { key: "pilates", label: "Pilates" },
  { key: "runclub", label: "Run Club" },
  { key: "cycleclub", label: "Cycle Club" },
  { key: "gym", label: "Fitnessstudio" },
  // Live Events (Insider)
  { key: "konzerte", label: "Konzerte" },
  { key: "livemusik", label: "Live-Musik" },
  { key: "kino", label: "Kino / Date" },
];

/** Localized category filters (use this at render sites, pass the language). */
export function categoryFilters(lang: Lang): CategoryFilter[] {
  return lang === "de" ? CATEGORY_FILTERS_DE : CATEGORY_FILTERS;
}

/** Short caps label per category (for the district line on cards). */
export const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "RESTAURANT",
  snack: "SNACK",
  cafe: "CAFÉ",
  weintasting: "WINE / COOKING",
  dessert: "SWEETS",
  streetfood: "STREET FOOD",
  biergarten: "BEER GARDEN",
  bar: "BAR",
  club: "CLUB",
  rooftop: "ROOFTOP",
  sport: "SPORTS",
  pilates: "PILATES",
  runclub: "RUN CLUB",
  cycleclub: "CYCLE CLUB",
  gym: "GYM",
  konzerte: "CONCERTS",
  livemusik: "LIVE MUSIC",
  kino: "CINEMA / DATE",
};

const CATEGORY_LABEL_DE: Record<Category, string> = {
  restaurant: "RESTAURANT",
  snack: "SNACK",
  cafe: "CAFÉ",
  weintasting: "WEIN / COOKING",
  dessert: "SÜSSES",
  streetfood: "STREET FOOD",
  biergarten: "BIERGARTEN",
  bar: "BAR",
  club: "CLUB",
  rooftop: "ROOFTOP",
  sport: "SPORT",
  pilates: "PILATES",
  runclub: "RUN CLUB",
  cycleclub: "CYCLE CLUB",
  gym: "FITNESSSTUDIO",
  konzerte: "KONZERTE",
  livemusik: "LIVE-MUSIK",
  kino: "KINO / DATE",
};

/** Localized short caps label for a category. */
export function categoryLabel(c: Category, lang: Lang): string {
  return (lang === "de" ? CATEGORY_LABEL_DE : CATEGORY_LABEL)[c];
}

// "Event-like" categories: they show date/meeting point/ticket and, on the map,
// the rectangle box with a date.
export const EVENT_CATEGORIES: Category[] = ["weintasting", "sport", "konzerte"];
export const isEventCategory = (c: Category) => EVENT_CATEGORIES.includes(c);

/** € display from the priceLevel (1–3). */
export function priceLabel(level: 1 | 2 | 3): string {
  return "€".repeat(level);
}

// Fixed sort order of the categories (for all listings, so the cards don't
// appear chaotically mixed but grouped by type).
export const CATEGORY_ORDER: Record<Category, number> = {
  // Eating, then going out, then sport, then live events.
  restaurant: 0,
  snack: 1,
  cafe: 2,
  weintasting: 3,
  dessert: 4,
  streetfood: 5,
  biergarten: 6,
  bar: 7,
  club: 8,
  rooftop: 9,
  sport: 10,
  pilates: 11,
  runclub: 12,
  cycleclub: 13,
  gym: 14,
  konzerte: 15,
  livemusik: 16,
  kino: 17,
};

// Sorts spots by category (stable -> order within the same category is
// preserved).
export function sortByCategory<T extends { category: Category }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
  );
}
