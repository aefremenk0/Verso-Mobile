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
  // Eating (warm, shiny). Snack/orange deepened slightly -> white text more legible.
  restaurant: { oval: "#E5392F", inner: "#FFFFFF", dot: "#E5392F" }, // red
  snack: { oval: "#D9700A", inner: "#FFFFFF", dot: "#D9700A" }, // deep orange
  cafe: { oval: "#1E9E54", inner: "#FFFFFF", dot: "#1E9E54" }, // green
  // Going out (clearly distinct hues: lime · cyan · orange · magenta). Lime
  // deepened (better white contrast); club moved from red-orange to pure orange
  // so it clearly stands apart from restaurant red.
  bar: { oval: "#6FA82B", inner: "#FFFFFF", dot: "#6FA82B" }, // deep lime
  sport: { oval: "#0FB3C4", inner: "#FFFFFF", dot: "#0FB3C4" }, // cyan/teal
  club: { oval: "#FF7A00", inner: "#FFFFFF", dot: "#FF7A00" }, // pure orange
  weintasting: { oval: "#C0297A", inner: "#FFFFFF", dot: "#C0297A" }, // magenta/pink
};
