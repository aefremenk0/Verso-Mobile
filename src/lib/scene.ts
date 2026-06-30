import {
  CATEGORY_FILTERS,
  categoryFilters,
  type CategoryFilter,
} from "../data/categories";
import type { Category } from "../data/types";
import type { Lang } from "./lang";

// Two "scenes" toggled between in the top right:
//  - feiern (going out): Bar · Club · Event
//  - essen (eating):     Restaurant · Snack · Café
export type Scene = "feiern" | "essen";

export const SCENE_CATEGORIES: Record<Scene, Category[]> = {
  feiern: ["bar", "club", "weintasting", "sport"],
  essen: ["restaurant", "snack", "cafe"],
};

// Category pills per scene: "All" + the categories of the scene
// (in the order from CATEGORY_FILTERS).
export const SCENE_FILTERS: Record<Scene, CategoryFilter[]> = {
  feiern: CATEGORY_FILTERS.filter(
    (f) => f.key === null || SCENE_CATEGORIES.feiern.includes(f.key),
  ),
  essen: CATEGORY_FILTERS.filter(
    (f) => f.key === null || SCENE_CATEGORIES.essen.includes(f.key),
  ),
};

/** Localized category pills for a scene (use at render sites, pass language). */
export function sceneFilters(scene: Scene, lang: Lang): CategoryFilter[] {
  return categoryFilters(lang).filter(
    (f) => f.key === null || SCENE_CATEGORIES[scene].includes(f.key),
  );
}

// Does a category belong to the current scene?
export function inScene(category: Category, scene: Scene): boolean {
  return SCENE_CATEGORIES[scene].includes(category);
}
