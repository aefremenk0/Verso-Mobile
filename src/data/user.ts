import type { City } from "./cities";
import type { GeheimtippDerWoche, User } from "./types";

/** Mock profile. There is no real login in the MVP. */
export const MOCK_USER: User = {
  name: "Lena Hofer",
  username: "@lenahofer",
  bio: "Collects back rooms and places without a sign.",
  // Initial values; saved places are managed at runtime by the SavedProvider.
  // (Munich spots — pilot city.)
  savedSpotIds: ["glasscherbe", "kellerkind", "isarliebe"],
};

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
