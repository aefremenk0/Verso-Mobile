import {
  CATEGORY_FILTERS,
  categoryFilters,
  type CategoryFilter,
} from "../data/categories";
import type { Category } from "../data/types";
import type { Lang } from "./lang";

// "Scenes" toggled between in the top right. The first two are free; the last
// two (Sport, Live Events) are Verso Insider only (gated in SceneToggle).
//  - essen (eating):       Restaurant · Snack · Café · Wine/Cooking · Sweets ·
//                          Street Food · Beer Garden
//  - feiern (going out):   Bar · Club · Rooftop
//  - sport (Insider):      Sports · Pilates · Run Club · Cycle Club · Gym
//  - events (Insider):     Concerts · Live Music · Cinema/Date
export type Scene = "feiern" | "essen" | "sport" | "events";

export const SCENE_CATEGORIES: Record<Scene, Category[]> = {
  feiern: ["bar", "club", "rooftop"],
  essen: ["restaurant", "snack", "cafe", "weintasting", "dessert", "streetfood", "biergarten"],
  sport: ["sport", "pilates", "runclub", "cycleclub", "gym"],
  events: ["konzerte", "livemusik", "kino"],
};

// Scenes that require Verso Insider membership.
export const INSIDER_SCENES: Scene[] = ["sport", "events"];
export const isInsiderScene = (s: Scene) => INSIDER_SCENES.includes(s);

// Category pills per scene: "All" + the categories of the scene
// (in the order from CATEGORY_FILTERS). Derived for every scene.
export const SCENE_FILTERS: Record<Scene, CategoryFilter[]> = Object.fromEntries(
  (Object.keys(SCENE_CATEGORIES) as Scene[]).map((s) => [
    s,
    CATEGORY_FILTERS.filter(
      (f) => f.key === null || SCENE_CATEGORIES[s].includes(f.key),
    ),
  ]),
) as Record<Scene, CategoryFilter[]>;

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
