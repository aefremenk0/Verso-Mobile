import type { City } from "./cities";
import type { GeheimtippDerWoche } from "./types";

/**
 * The "Hidden Gem of the Week" — one per city. Pilot phase: only Munich has
 * a tip (other cities are "coming soon", not selectable). `spotId` must be a
 * real spot id from `spots.ts` of the same city. The store falls back to
 * Munich should a city without an entry ever become active.
 */
export const GEHEIMTIPP_BY_CITY: Partial<Record<City, GeheimtippDerWoche>> = {
  München: {
    spotId: "kellerkind", // cellar bar in Glockenbach, phones at the coat check
    weekLabel: "KW 26",
    teaser: "Digging through the back room …",
    teaserDe: "Wir kramen kurz im Hinterzimmer …",
  },
};
