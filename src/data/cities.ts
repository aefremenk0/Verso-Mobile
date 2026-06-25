import type { Neighborhood } from "./types";

/**
 * Auswählbare Städte (Feed-Dropdown, Welcome-Auswahl). Wien ist Standard.
 * Inhalte (Spots/Bezirke) gibt es im MVP für Wien, Berlin und München;
 * die übrigen Städte zeigen vorerst einen "kommt bald"-Leerzustand.
 */
export const CITIES = [
  "Wien",
  "München",
  "Berlin",
  "Frankfurt",
  "Düsseldorf",
  "Hamburg",
  "Zürich",
] as const;
export type City = (typeof CITIES)[number];

/**
 * Städte, für die es im MVP schon kuratierte Inhalte gibt.
 * Jetzt alle sechs: jede Stadt hat 8 Viertel und mindestens 2 Events.
 */
export const CITIES_WITH_CONTENT: City[] = [...CITIES];

/**
 * Stadtteile für die Stadt-Übersicht – je ein poetischer Einzeiler.
 * Konvention: **genau 8 Viertel pro Stadt** (siehe CITIES).
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  // ── Wien (8) ──
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
  {
    city: "Wien",
    name: "Josefstadt",
    blurb: "Das kleinste Grätzl mit dem längsten Gedächtnis.",
  },
  {
    city: "Wien",
    name: "Augarten",
    blurb: "Barockmauer außen, Picknickdecke innen.",
  },
  {
    city: "Wien",
    name: "Spittelberg",
    blurb: "Kopfsteinpflaster, das abends leiser wird.",
  },

  // ── Berlin (8) ──
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
    name: "Wedding",
    blurb: "Kommt angeblich noch — ist aber längst da.",
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

  // ── München (8) ──
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
  {
    city: "München",
    name: "Haidhausen",
    blurb: "Franzosenviertel, leiser Stolz.",
  },
  {
    city: "München",
    name: "Schwabing",
    blurb: "Boheme im Ruhestand, immer noch wach.",
  },
  {
    city: "München",
    name: "Lehel",
    blurb: "Zwischen Isar und Museum, kaum ein Schild.",
  },
  {
    city: "München",
    name: "Westend",
    blurb: "Werkshallen, jetzt mit Sauerteig.",
  },
  {
    city: "München",
    name: "Sendling",
    blurb: "Großmarkt-Lärm, dann plötzlich Stille.",
  },

  // ── Frankfurt (8) ──
  {
    city: "Frankfurt",
    name: "Sachsenhausen",
    blurb: "Apfelwein außen, neue Küche im Hinterzimmer.",
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
    name: "Bahnhofsviertel",
    blurb: "Grell, laut — und plötzlich das beste Essen.",
  },
  {
    city: "Frankfurt",
    name: "Ostend",
    blurb: "Hafenkante, Kran und Kaffeerösterei.",
  },
  {
    city: "Frankfurt",
    name: "Westend",
    blurb: "Villen, in denen leise Bars wohnen.",
  },
  {
    city: "Frankfurt",
    name: "Bockenheim",
    blurb: "Studentisch, eigensinnig, satt.",
  },
  {
    city: "Frankfurt",
    name: "Gallus",
    blurb: "Gleise von gestern, Lokale von morgen.",
  },

  // ── Düsseldorf (8) ──
  {
    city: "Düsseldorf",
    name: "Altstadt",
    blurb: "Längste Theke der Welt, kürzeste Wege.",
  },
  {
    city: "Düsseldorf",
    name: "Flingern",
    blurb: "Graffiti vorn, Geheimtipp im zweiten Hof.",
  },
  {
    city: "Düsseldorf",
    name: "Pempelfort",
    blurb: "Galerien und Gärten, ganz ohne Lärm.",
  },
  {
    city: "Düsseldorf",
    name: "Bilk",
    blurb: "Studentisch jung, am Rhein gelassen.",
  },
  {
    city: "Düsseldorf",
    name: "Oberkassel",
    blurb: "Andere Rheinseite, andere Tonlage.",
  },
  {
    city: "Düsseldorf",
    name: "Unterbilk",
    blurb: "Hafen wird Wohnzimmer.",
  },
  {
    city: "Düsseldorf",
    name: "Friedrichstadt",
    blurb: "Backstein, Bahn und stille Lokale.",
  },
  {
    city: "Düsseldorf",
    name: "Derendorf",
    blurb: "Brauerei-Erbe, frisch gezapft.",
  },

  // ── Hamburg (8) ──
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
    name: "Altona",
    blurb: "Vom Fischmarkt bis zur Elbe, alles zu Fuß.",
  },
  {
    city: "Hamburg",
    name: "Eimsbüttel",
    blurb: "Backstein, Boule, beste Bäcker.",
  },
  {
    city: "Hamburg",
    name: "St. Georg",
    blurb: "Bunt, laut und herzlich daneben.",
  },
  {
    city: "Hamburg",
    name: "Ottensen",
    blurb: "Fabrikhof, jetzt mit Filterkaffee.",
  },
  {
    city: "Hamburg",
    name: "Winterhude",
    blurb: "Kanäle, Kanus, leise Küchen.",
  },
  {
    city: "Hamburg",
    name: "HafenCity",
    blurb: "Beton am Wasser, langsam belebt.",
  },

  // ── Zürich (8) ──
  {
    city: "Zürich",
    name: "Niederdorf",
    blurb: "Mittelalter-Gassen, Bars ohne Schild.",
  },
  {
    city: "Zürich",
    name: "Langstrasse",
    blurb: "Bei Tag Markt, bei Nacht eine andere Stadt.",
  },
  {
    city: "Zürich",
    name: "Kreis 5",
    blurb: "Industrie von gestern, Apéro von heute.",
  },
  {
    city: "Zürich",
    name: "Seefeld",
    blurb: "See vor der Tür, Espresso im Hinterhof.",
  },
  {
    city: "Zürich",
    name: "Wiedikon",
    blurb: "Quartierbeiz trifft Natural Wine.",
  },
  {
    city: "Zürich",
    name: "Enge",
    blurb: "Seebad-Ruhe, leise Eleganz.",
  },
  {
    city: "Zürich",
    name: "Oberstrass",
    blurb: "Studentisch über den Dächern.",
  },
  {
    city: "Zürich",
    name: "Hottingen",
    blurb: "Villen, Tramklingeln, gut gehütete Cafés.",
  },
];
