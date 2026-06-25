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

// Kräftige, klar voneinander getrennte Hues, damit die Punkte auf der Karte
// gut unterscheidbar sind. Essen = warm/shiny, Feiern = kühl. Über den Farbkreis
// verteilt (Rot · Orange · Grün · Teal · Blau · Violett · Magenta).
export const PIN_COLORS: Record<Category, PinColor> = {
  // Essen (warm, shiny)
  restaurant: { oval: "#E5392F", inner: "#FFFFFF", dot: "#E5392F" }, // Rot
  snack: { oval: "#F7860D", inner: "#FFFFFF", dot: "#F7860D" }, // Orange
  cafe: { oval: "#1E9E54", inner: "#FFFFFF", dot: "#1E9E54" }, // Grün
  // Feiern (klar getrennte Hues: Lime · Cyan · Rot-Orange · Magenta)
  bar: { oval: "#8BC53F", inner: "#FFFFFF", dot: "#8BC53F" }, // Lime
  sport: { oval: "#0FB3C4", inner: "#FFFFFF", dot: "#0FB3C4" }, // Cyan/Teal
  club: { oval: "#FF4500", inner: "#FFFFFF", dot: "#FF4500" }, // Knall-Rot-Orange
  weintasting: { oval: "#C0297A", inner: "#FFFFFF", dot: "#C0297A" }, // Magenta/Pink
};
