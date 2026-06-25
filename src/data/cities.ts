import type { Neighborhood } from "./types";

/**
 * Auswählbare Städte (Feed-Dropdown, Welcome-Auswahl). München ist Standard.
 * Jede Stadt hat eigene Viertel + Mock-Spots (Feed/Bezirk gefüllt).
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
 * Städte, für die es im MVP schon kuratierte Inhalte gibt — jetzt alle.
 */
export const CITIES_WITH_CONTENT: City[] = [...CITIES];

/**
 * Stadtteile für die Stadt-Übersicht – je ein poetischer Einzeiler.
 * Die Viertel folgen der vom Nutzer vorgegebenen Liste (Anzahl variiert pro
 * Stadt, NICHT mehr fix 8). Die Spot-`neighborhood`-Felder verwenden exakt
 * diese Namen, damit der Bezirks-Screen (`startsWith(name)`) sie findet.
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  // ── München ──
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

  // ── Wien ──
  {
    city: "Wien",
    name: "Innere Stadt (1.)",
    blurb: "Touristen oben, Eingeweihte im Kaffeehaus-Eck.",
  },
  {
    city: "Wien",
    name: "Neubau (7.)",
    blurb: "Concept Stores und die beste Pizza, über die keiner spricht.",
  },
  {
    city: "Wien",
    name: "Leopoldstadt (2.)",
    blurb: "Hinter dem Prater fängt das echte Wien an.",
  },
  {
    city: "Wien",
    name: "Mariahilf (6.)",
    blurb: "Naschmarkt-Trubel, und einen Hof weiter Stille.",
  },
  {
    city: "Wien",
    name: "Wieden (4.)",
    blurb: "Beamtenruhe bei Tag, klammheimlich bei Nacht.",
  },
  {
    city: "Wien",
    name: "Josefstadt (8.)",
    blurb: "Das kleinste Grätzl mit dem längsten Gedächtnis.",
  },
  {
    city: "Wien",
    name: "Alsergrund (9.)",
    blurb: "Servitenviertel: studentisch, leise, gut versteckt.",
  },

  // ── Zürich ──
  {
    city: "Zürich",
    name: "Kreis 4 (Langstrasse)",
    blurb: "Bei Tag Markt, bei Nacht eine andere Stadt.",
  },
  {
    city: "Zürich",
    name: "Kreis 5 (Zürich West)",
    blurb: "Industrie von gestern, Apéro von heute.",
  },
  {
    city: "Zürich",
    name: "Niederdorf (Kreis 1)",
    blurb: "Mittelalter-Gassen, Bars ohne Schild.",
  },
  {
    city: "Zürich",
    name: "Seefeld (Kreis 8)",
    blurb: "See vor der Tür, Espresso im Hinterhof.",
  },
  {
    city: "Zürich",
    name: "Wiedikon (Kreis 3)",
    blurb: "Quartierbeiz trifft Natural Wine.",
  },

  // ── Berlin ──
  {
    city: "Berlin",
    name: "Kreuzberg",
    blurb: "Klingeln ohne Namen, Türen ohne Schild.",
  },
  {
    city: "Berlin",
    name: "Friedrichshain",
    blurb: "Boxhagener Ruhe bei Tag, RAW-Gelände-Bass bei Nacht.",
  },
  {
    city: "Berlin",
    name: "Neukölln",
    blurb: "Weserstraße: kreativ, jung, nie ganz fertig.",
  },
  {
    city: "Berlin",
    name: "Prenzlauer Berg",
    blurb: "Altbau und Kinderwagen — und nachts doch noch Krach.",
  },
  {
    city: "Berlin",
    name: "Mitte",
    blurb: "Galerien vorn, Hinterhöfe für die Wissenden.",
  },
  {
    city: "Berlin",
    name: "Schöneberg",
    blurb: "Die Nacht hat hier nie ganz aufgehört.",
  },
  {
    city: "Berlin",
    name: "Charlottenburg",
    blurb: "Alter Westen, neuer Espresso.",
  },

  // ── Hamburg ──
  {
    city: "Hamburg",
    name: "St. Pauli",
    blurb: "Kiez bei Nacht, Kaffee am Morgen danach.",
  },
  {
    city: "Hamburg",
    name: "Sternschanze",
    blurb: "Bauwagen, Bass und Brunch.",
  },
  {
    city: "Hamburg",
    name: "Karoviertel",
    blurb: "Klein, eigensinnig, voller Designläden.",
  },
  {
    city: "Hamburg",
    name: "St. Georg",
    blurb: "Lange Reihe: bunt, queer, herzlich daneben.",
  },
  {
    city: "Hamburg",
    name: "Ottensen",
    blurb: "Fabrikhof, jetzt mit Filterkaffee.",
  },
  {
    city: "Hamburg",
    name: "Eppendorf",
    blurb: "Boutiquen, Kanäle, leise Eleganz.",
  },
  {
    city: "Hamburg",
    name: "HafenCity",
    blurb: "Beton am Wasser, langsam belebt.",
  },

  // ── Frankfurt ──
  {
    city: "Frankfurt",
    name: "Sachsenhausen",
    blurb: "Apfelwein außen, neue Küche im Hinterzimmer.",
  },
  {
    city: "Frankfurt",
    name: "Bahnhofsviertel",
    blurb: "Grell, laut — und plötzlich das beste Essen.",
  },
  {
    city: "Frankfurt",
    name: "Bornheim",
    blurb: "Das Dorf in der Bankenstadt.",
  },
  {
    city: "Frankfurt",
    name: "Nordend",
    blurb: "Altbau, Platanen, kein Grund zur Eile.",
  },
  {
    city: "Frankfurt",
    name: "Innenstadt / Zeil",
    blurb: "Einkaufsmeile oben, stille Lokale ums Eck.",
  },
  {
    city: "Frankfurt",
    name: "Ostend",
    blurb: "Hafenkante, Kran und Kaffeerösterei.",
  },

  // ── Düsseldorf ──
  {
    city: "Düsseldorf",
    name: "Altstadt",
    blurb: "Längste Theke der Welt, kürzeste Wege.",
  },
  {
    city: "Düsseldorf",
    name: "Medienhafen",
    blurb: "Schräge Fassaden, Bars mit Wasserblick.",
  },
  {
    city: "Düsseldorf",
    name: "Flingern",
    blurb: "Graffiti vorn, Geheimtipp im zweiten Hof.",
  },
  {
    city: "Düsseldorf",
    name: "Pempelfort",
    blurb: "Nordstraße: entspannt, satt, ganz ohne Lärm.",
  },
  {
    city: "Düsseldorf",
    name: "Unterbilk / Friedrichstadt",
    blurb: "Lorettoviertel: Boutiquen und stille Cafés.",
  },
  {
    city: "Düsseldorf",
    name: "Oberkassel",
    blurb: "Andere Rheinseite, andere Tonlage.",
  },
];
