import type { Neighborhood } from "./types";

/** Auswählbare Städte (Feed-Dropdown, Welcome-Auswahl). Wien ist Standard. */
export const CITIES = ["Wien", "Berlin", "München"] as const;
export type City = (typeof CITIES)[number];

/** Stadtteile für die Stadt-Übersicht – je ein poetischer Einzeiler. */
export const NEIGHBORHOODS: Neighborhood[] = [
  // Wien
  {
    city: "Wien",
    name: "Innere Stadt",
    blurb: "Touristen oben, Eingeweihte im Keller.",
  },
  {
    city: "Wien",
    name: "Wieden",
    blurb: "Beamtenruhe bei Tag, klammheimlich bei Nacht.",
  },
  {
    city: "Wien",
    name: "Neubau",
    blurb: "Concept Stores und die beste Pizza, über die keiner spricht.",
  },
  {
    city: "Wien",
    name: "Leopoldstadt",
    blurb: "Hinter dem Prater fängt das echte Wien an.",
  },
  {
    city: "Wien",
    name: "Margareten",
    blurb: "Wo die Stadt aufhört, schön sein zu wollen.",
  },
  // Berlin
  {
    city: "Berlin",
    name: "Kreuzberg",
    blurb: "Klingeln ohne Namen, Türen ohne Schild.",
  },
  {
    city: "Berlin",
    name: "Friedrichshain",
    blurb: "Der Späti ist die Speisekarte.",
  },
  {
    city: "Berlin",
    name: "Neukölln",
    blurb: "Industrie von gestern, Anlage von heute.",
  },
  // München
  {
    city: "München",
    name: "Glockenbachviertel",
    blurb: "Aus der Zeit gefallen, mit Absicht.",
  },
  {
    city: "München",
    name: "Au",
    blurb: "Wirtshaus von außen, Feinkost von innen.",
  },
  {
    city: "München",
    name: "Maxvorstadt",
    blurb: "Wenn der Föhn kommt, gehen die Fenster auf.",
  },
];
