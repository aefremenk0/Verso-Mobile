import type { Neighborhood } from "./types";

/**
 * Selectable cities (feed dropdown, welcome selection). Munich is the default.
 * In the pilot phase only Munich is unlocked (see LIVE_CITIES); the others
 * appear as "coming soon".
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
 * Pilot phase: **only Munich is "live"** (has content and is selectable).
 * All other cities appear in the hotbar/welcome as "coming soon"
 * (struck through diagonally, not selectable).
 */
export const LIVE_CITIES: City[] = ["München"];

/** True if the city is not yet unlocked (everything except Munich). */
export function isComingSoon(c: City): boolean {
  return !LIVE_CITIES.includes(c);
}

/** Cities with curated content — in the pilot phase only Munich. */
export const CITIES_WITH_CONTENT: City[] = [...LIVE_CITIES];

/**
 * Neighborhoods for the city overview – one poetic one-liner each.
 * Pilot phase: only Munich. The spot `neighborhood` fields match these names
 * exactly (the district screen matches via `=== name`).
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  // ── Munich (pilot city) ──
  {
    city: "München",
    name: "Glockenbachviertel",
    blurb: "Munich's most wide-awake nights — queer, with no curfew in mind.",
  },
  {
    city: "München",
    name: "Gärtnerplatzviertel",
    blurb: "Brunch at the roundabout that slides into the next negroni.",
  },
  {
    city: "München",
    name: "Maxvorstadt",
    blurb: "Between the Pinakothek and the pub, student-relaxed.",
  },
  {
    city: "München",
    name: "Schwabing",
    blurb: "Bohemia in retirement, still wide awake.",
  },
  {
    city: "München",
    name: "Isarvorstadt / Flaucher",
    blurb: "In summer the city's living room — on the gravel riverbank.",
  },
  {
    city: "München",
    name: "Werksviertel",
    blurb: "Where the concrete dances: clubs, rooftops, a Ferris wheel.",
  },
  {
    city: "München",
    name: "Westend / Schwanthalerhöhe",
    blurb: "A multicultural block with the tables nobody talks about.",
  },
  {
    city: "München",
    name: "Haidhausen",
    blurb: "The French Quarter, quiet pride.",
  },
];
