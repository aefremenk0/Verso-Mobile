import { CATEGORY_FILTERS, type CategoryFilter } from "../data/categories";
import type { Category } from "../data/types";

// Zwei „Szenen", zwischen denen oben rechts umgeschaltet wird:
//  - feiern: Bar · Club · Event
//  - essen:  Restaurant · Snack · Café
export type Scene = "feiern" | "essen";

export const SCENE_CATEGORIES: Record<Scene, Category[]> = {
  feiern: ["bar", "club", "event"],
  essen: ["restaurant", "snack", "cafe"],
};

// Kategorie-Pills je Szene: „Alle" + die Kategorien der Szene
// (in der Reihenfolge aus CATEGORY_FILTERS).
export const SCENE_FILTERS: Record<Scene, CategoryFilter[]> = {
  feiern: CATEGORY_FILTERS.filter(
    (f) => f.key === null || SCENE_CATEGORIES.feiern.includes(f.key),
  ),
  essen: CATEGORY_FILTERS.filter(
    (f) => f.key === null || SCENE_CATEGORIES.essen.includes(f.key),
  ),
};

// Gehört eine Kategorie zur aktuellen Szene?
export function inScene(category: Category, scene: Scene): boolean {
  return SCENE_CATEGORIES[scene].includes(category);
}
