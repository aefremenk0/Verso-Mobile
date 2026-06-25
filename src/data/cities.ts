import type { Neighborhood } from "./types";

/**
 * Auswählbare Städte (Feed-Dropdown, Welcome-Auswahl). München ist Standard.
 * In der Pilot-Phase ist nur München freigeschaltet (siehe LIVE_CITIES); die
 * übrigen erscheinen als „kommt bald".
 */
export const CITIES = [
  "München",
  "Wien",
  "Zürich",
  "Berlin",
  "Hamburg",
  "Frankfurt",
  "Düsseldorf",
] as const;
export type City = (typeof CITIES)[number];

/**
 * Pilot-Phase: **nur München ist „live"** (hat Inhalte und ist auswählbar).
 * Alle anderen Städte erscheinen in der Hotbar/Welcome als „kommt bald"
 * (diagonal durchgestrichen, nicht auswählbar).
 */
export const LIVE_CITIES: City[] = ["München"];

/** True, wenn die Stadt noch nicht freigeschaltet ist (alles außer München). */
export function isComingSoon(c: City): boolean {
  return !LIVE_CITIES.includes(c);
}

/** Städte mit kuratierten Inhalten — in der Pilot-Phase nur München. */
export const CITIES_WITH_CONTENT: City[] = [...LIVE_CITIES];

/**
 * Stadtteile für die Stadt-Übersicht – je ein poetischer Einzeiler.
 * Pilot-Phase: nur München. Die Spot-`neighborhood`-Felder entsprechen exakt
 * diesen Namen (Bezirks-Screen matcht via `=== name`).
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  // ── München (Pilotstadt) ──
  {
    city: "München",
    name: "Glockenbachviertel",
    blurb: "Münchens wachste Nächte — queer, ohne Sperrstunde im Kopf.",
  },
  {
    city: "München",
    name: "Gärtnerplatzviertel",
    blurb: "Brunch am Rondell, der in den nächsten Negroni übergeht.",
  },
  {
    city: "München",
    name: "Maxvorstadt",
    blurb: "Zwischen Pinakothek und Kneipe, studentisch entspannt.",
  },
  {
    city: "München",
    name: "Schwabing",
    blurb: "Boheme im Ruhestand, immer noch wach.",
  },
  {
    city: "München",
    name: "Isarvorstadt / Flaucher",
    blurb: "Im Sommer das Wohnzimmer der Stadt — am Kiesufer.",
  },
  {
    city: "München",
    name: "Werksviertel",
    blurb: "Wo der Beton tanzt: Clubs, Rooftops, ein Riesenrad.",
  },
  {
    city: "München",
    name: "Westend / Schwanthalerhöhe",
    blurb: "Multikulti-Block mit den Tischen, von denen keiner spricht.",
  },
  {
    city: "München",
    name: "Haidhausen",
    blurb: "Franzosenviertel, leiser Stolz.",
  },
];
