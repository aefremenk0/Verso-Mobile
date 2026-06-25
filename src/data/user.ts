import type { City } from "./cities";
import type { GeheimtippDerWoche, User } from "./types";

/** Mock-Profil. Im MVP gibt es kein echtes Login. */
export const MOCK_USER: User = {
  name: "Lena Hofer",
  username: "@lenahofer",
  bio: "Sammelt Hinterzimmer und Plätze ohne Schild.",
  // Startwerte; gemerkte Orte verwaltet zur Laufzeit der SavedProvider.
  // (München-Spots — Pilotstadt.)
  savedSpotIds: ["glasscherbe", "kellerkind", "isarliebe"],
};

/**
 * Der "Geheimtipp der Woche" — pro Stadt einer. Pilot-Phase: nur München hat
 * einen Tipp (andere Städte sind „kommt bald", nicht auswählbar). `spotId` muss
 * eine echte Spot-id aus `spots.ts` derselben Stadt sein. Der Store fällt auf
 * München zurück, falls je eine Stadt ohne Eintrag aktiv würde.
 */
export const GEHEIMTIPP_BY_CITY: Partial<Record<City, GeheimtippDerWoche>> = {
  München: {
    spotId: "kellerkind", // Kellerbar im Glockenbach, Handys an der Garderobe
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
};
