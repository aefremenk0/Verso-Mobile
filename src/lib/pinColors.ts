import type { Category } from "../data/types";

// Central color mapping of the map pins per category.
// Three colors per category:
//   - oval:  background of the label box (the "oval")
//   - inner: text color inside the box
//   - dot:   color of the dot on the map
// CHANGE the hex values HERE to change the map colors.
export interface PinColor {
  oval: string;
  inner: string;
  dot: string;
}

// Bold, clearly distinct hues so the dots on the map are easy to tell apart.
// Eating = warm/shiny, going out = cool. Spread across the color wheel
// (red · orange · green · teal · blue · violet · magenta).
export const PIN_COLORS: Record<Category, PinColor> = {
  // Eating (warm, shiny). White text throughout (user preference).
  restaurant: { oval: "#E5392F", inner: "#FFFFFF", dot: "#E5392F" }, // red
  snack: { oval: "#D9700A", inner: "#FFFFFF", dot: "#D9700A" }, // deep orange
  cafe: { oval: "#1E9E54", inner: "#FFFFFF", dot: "#1E9E54" }, // green
  weintasting: { oval: "#C0297A", inner: "#FFFFFF", dot: "#C0297A" }, // magenta/pink
  dessert: { oval: "#EC4899", inner: "#FFFFFF", dot: "#EC4899" }, // pink
  streetfood: { oval: "#CA8A04", inner: "#FFFFFF", dot: "#CA8A04" }, // amber/gold
  biergarten: { oval: "#4D7C0F", inner: "#FFFFFF", dot: "#4D7C0F" }, // leaf/olive
  // Going out (cool / clearly distinct hues).
  bar: { oval: "#6FA82B", inner: "#FFFFFF", dot: "#6FA82B" }, // deep lime
  club: { oval: "#FF7A00", inner: "#FFFFFF", dot: "#FF7A00" }, // pure orange
  rooftop: { oval: "#2563EB", inner: "#FFFFFF", dot: "#2563EB" }, // blue
  // Sport (Insider scene). Distinct within the scene (shown on its own).
  sport: { oval: "#0FB3C4", inner: "#FFFFFF", dot: "#0FB3C4" }, // cyan/teal
  pilates: { oval: "#DB2777", inner: "#FFFFFF", dot: "#DB2777" }, // rose
  runclub: { oval: "#EA580C", inner: "#FFFFFF", dot: "#EA580C" }, // burnt orange
  cycleclub: { oval: "#0891B2", inner: "#FFFFFF", dot: "#0891B2" }, // cyan
  gym: { oval: "#4F46E5", inner: "#FFFFFF", dot: "#4F46E5" }, // indigo
  // Live Events (Insider scene).
  konzerte: { oval: "#C026D3", inner: "#FFFFFF", dot: "#C026D3" }, // fuchsia
  livemusik: { oval: "#7C3AED", inner: "#FFFFFF", dot: "#7C3AED" }, // violet
  kino: { oval: "#0E7490", inner: "#FFFFFF", dot: "#0E7490" }, // deep teal
};
