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
  snack: { oval: "#F7860D", inner: "#1A1A1A", dot: "#F7860D" }, // Orange
  cafe: { oval: "#1E9E54", inner: "#FFFFFF", dot: "#1E9E54" }, // Grün
  // Feiern (kühl)
  club: { oval: "#3B49C7", inner: "#FFFFFF", dot: "#3B49C7" }, // Indigo
  sport: { oval: "#0FB3C4", inner: "#FFFFFF", dot: "#0FB3C4" }, // Cyan/Teal
  bar: { oval: "#8E44C9", inner: "#FFFFFF", dot: "#8E44C9" }, // Violett
  weintasting: { oval: "#C0297A", inner: "#FFFFFF", dot: "#C0297A" }, // Magenta
};
