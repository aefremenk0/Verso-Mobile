import type { Category } from "../data/types";

// Zentrale Farbzuordnung der Karten-Pins pro Kategorie.
// Pro Kategorie drei Farben:
//   - oval:  Hintergrund der Label-Box (das „Oval")
//   - inner: Textfarbe innerhalb der Box
//   - dot:   Farbe des Punkts auf der Karte
// HIER die Hex-Werte anpassen, um die Kartenfarben zu ändern.
export interface PinColor {
  oval: string;
  inner: string;
  dot: string;
}

export const PIN_COLORS: Record<Category, PinColor> = {
  restaurant: { oval: "#6E1423", inner: "#FFF8F0", dot: "#6E1423" }, // Bordeaux (dunkelrot)
  snack: { oval: "#2E5D3C", inner: "#FFFFFF", dot: "#2E5D3C" }, // Dunkelgrün, weißer Text
  cafe: { oval: "#6F4A2E", inner: "#F7F4EF", dot: "#6F4A2E" }, // Espresso
  bar: { oval: "#7A3E6B", inner: "#F7F4EF", dot: "#7A3E6B" }, // Pflaume
  club: { oval: "#3A3A8C", inner: "#FFE500", dot: "#3A3A8C" }, // Indigo
  event: { oval: "#1A1A1A", inner: "#FFE500", dot: "#FFE500" }, // schwarzes Oval, gelber Text
  weintasting: { oval: "#6B2D5A", inner: "#F7F4EF", dot: "#6B2D5A" }, // Wein-Pflaume
  cooking: { oval: "#C2541F", inner: "#FFF8F0", dot: "#C2541F" }, // Terrakotta
  techno: { oval: "#1F6F78", inner: "#FFFFFF", dot: "#1F6F78" }, // Teal
  sport: { oval: "#1E63B0", inner: "#FFFFFF", dot: "#1E63B0" }, // Blau
};
