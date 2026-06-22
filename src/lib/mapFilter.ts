import type { Ambience, Category, Spot } from "../data/types";

// Zentrale Filter-Logik für die Kartenansicht.
// ODER innerhalb einer Gruppe (z. B. mehrere Arten), UND zwischen den Gruppen.

export interface MapFilter {
  art: Category[]; // leer = alle Arten
  minPrice: number; // €
  maxPrice: number; // € (100 = "100+")
  minRating: number; // 0 = alle
  ambiente: Ambience[]; // leer = alle
}

export const DEFAULT_FILTER: MapFilter = {
  art: [],
  minPrice: 0,
  maxPrice: 100,
  minRating: 0,
  ambiente: [],
};

// Repräsentativer €-Wert je Preisstufe (für den Budget-Filter).
export const PRICE_EURO: Record<1 | 2 | 3, number> = { 1: 15, 2: 40, 3: 75 };

/** Trifft ein Spot auf den Filter zu? */
export function matchesFilter(s: Spot, f: MapFilter): boolean {
  if (f.art.length > 0 && !f.art.includes(s.category)) return false;
  const euro = PRICE_EURO[s.priceLevel];
  if (euro < f.minPrice || euro > f.maxPrice) return false;
  if (s.rating < f.minRating) return false;
  if (f.ambiente.length > 0 && !f.ambiente.some((a) => s.ambience.includes(a)))
    return false;
  return true;
}

// Auswahl-Optionen + Labels für das Filter-Sheet.
export const ART_OPTIONS: { label: string; cat: Category }[] = [
  { label: "Bar", cat: "bar" },
  { label: "Restaurant", cat: "restaurant" },
  { label: "Club", cat: "club" },
  { label: "Café", cat: "cafe" },
  { label: "Snack", cat: "snack" },
  { label: "Event", cat: "event" },
];

export const RATING_OPTIONS: { label: string; value: number }[] = [
  { label: "Alle", value: 0 },
  { label: "4,0 ★", value: 4.0 },
  { label: "4,5 ★", value: 4.5 },
];

export const AMBIENTE_OPTIONS: { name: Ambience; label: string; desc: string }[] = [
  { name: "intim", label: "Intim", desc: "gedämpft, eng, für Dates & ruhige Abende" },
  { name: "lebhaft", label: "Lebhaft", desc: "voll, energetisch, laut" },
  { name: "gemütlich", label: "Gemütlich", desc: "warm, entspannt, zum Verweilen" },
  { name: "underground", label: "Underground", desc: "roh, versteckt, ungeschliffen" },
  { name: "elegant", label: "Elegant", desc: "schick, durchdesignt, besonderer Anlass" },
  { name: "draußen", label: "Draußen", desc: "Garten, Terrasse, Hof" },
];
