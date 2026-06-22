import type { GeheimtippDerWoche, User } from "./types";

/** Mock-Profil. Im MVP gibt es kein echtes Login. */
export const MOCK_USER: User = {
  name: "Lena Hofer",
  username: "@lenahofer",
  bio: "Sammelt Hinterzimmer und Plätze ohne Schild.",
  // Startwerte; gemerkte Orte verwaltet zur Laufzeit der SavedProvider.
  savedSpotIds: ["kleinod", "marktluecke", "dogenhof"],
};

/** Der "Geheimtipp der Woche" – ein kuratierter Spot für alle. */
export const GEHEIMTIPP: GeheimtippDerWoche = {
  spotId: "cafe-schwarzraum",
  weekLabel: "KW 26",
  teaser: "Wir kramen kurz im Hinterzimmer …",
};
