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
  // Essen (warm, shiny). Snack/Orange dezent vertieft -> weißer Text lesbarer.
  restaurant: { oval: "#E5392F", inner: "#FFFFFF", dot: "#E5392F" }, // Rot
  snack: { oval: "#D9700A", inner: "#FFFFFF", dot: "#D9700A" }, // Tiefes Orange
  cafe: { oval: "#1E9E54", inner: "#FFFFFF", dot: "#1E9E54" }, // Grün
  // Feiern (klar getrennte Hues: Lime · Cyan · Orange · Magenta). Lime vertieft
  // (besserer Weiß-Kontrast); club von Rot-Orange auf reines Orange gerückt,
  // damit es sich klar von restaurant-Rot abhebt.
  bar: { oval: "#6FA82B", inner: "#FFFFFF", dot: "#6FA82B" }, // Tiefes Lime
  sport: { oval: "#0FB3C4", inner: "#FFFFFF", dot: "#0FB3C4" }, // Cyan/Teal
  club: { oval: "#FF7A00", inner: "#FFFFFF", dot: "#FF7A00" }, // Reines Orange
  weintasting: { oval: "#C0297A", inner: "#FFFFFF", dot: "#C0297A" }, // Magenta/Pink
};
