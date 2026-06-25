import type { City } from "./cities";
import type { GeheimtippDerWoche, User } from "./types";

/** Mock-Profil. Im MVP gibt es kein echtes Login. */
export const MOCK_USER: User = {
  name: "Lena Hofer",
  username: "@lenahofer",
  bio: "Sammelt Hinterzimmer und Plätze ohne Schild.",
  // Startwerte; gemerkte Orte verwaltet zur Laufzeit der SavedProvider.
  savedSpotIds: ["kleinod", "marktluecke", "dogenhof"],
};

/**
 * Der "Geheimtipp der Woche" — jetzt **pro Stadt** einer. Der Nutzer sieht immer
 * den Tipp seiner aktuell gewählten Stadt (ein Münchner interessiert sich nicht
 * für ein Wiener Café). `spotId` muss eine echte Spot-id aus `spots.ts` sein und
 * in derselben Stadt liegen. Auswahl: jeweils ein besonders „versteckter" Ort.
 */
export const GEHEIMTIPP_BY_CITY: Record<City, GeheimtippDerWoche> = {
  München: {
    spotId: "kellerkind", // Kellerbar im Glockenbach, Handys an der Garderobe
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Wien: {
    spotId: "cafe-schwarzraum", // Café ohne Schild, Neubau
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Zürich: {
    spotId: "zrh-gassenwein", // Weinbar in der engsten Niederdorf-Gasse
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Berlin: {
    spotId: "zimmer-14", // Bar in der Altbauwohnung, Klingel ohne Namen
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Hamburg: {
    spotId: "hh-fabrikhof", // Restaurant in einer alten Ottensener Fabrik
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Frankfurt: {
    spotId: "ffm-gleiskueche", // hinter unscheinbarer Tür im Bahnhofsviertel
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
  Düsseldorf: {
    spotId: "dus-flingerkaffee", // Rösterei im zweiten Hinterhof, Flingern
    weekLabel: "KW 26",
    teaser: "Wir kramen kurz im Hinterzimmer …",
  },
};
