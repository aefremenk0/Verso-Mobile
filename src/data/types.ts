// Datenmodelle für Verso (MVP: alles nur Mock, kein Backend).

/** Kategorien eines Spots. Der Feed-Filter basiert hierauf. */
export type Category =
  | "restaurant"
  | "snack"
  | "cafe"
  | "bar"
  | "club"
  // Spezifischere Party-Arten (event-artig: mit Datum/Ticket):
  | "weintasting"
  | "sport";

/** Ambiente-Werte (Karte-Filter in Phase 2, als Tag schon im MVP nutzbar). */
export type Ambience =
  | "intim"
  | "lebhaft"
  | "gemütlich"
  | "underground"
  | "elegant"
  | "draußen";

/**
 * Farbton des dunklen Bild-Platzhalters. Im Mockup variieren die
 * Platzhalter zwischen bräunlich und dunkelgrün – das hält den Feed lebendig.
 */
export type PlaceholderTone = "brown" | "green" | "charcoal";

/**
 * Ein Ort (oder Event). Events sind Spots mit `category: "event"` und den
 * zusätzlichen Feldern `dateLabel`, `meetingPoint`, `ticketUrl`.
 */
export interface Spot {
  id: string;
  name: string;
  category: Category;
  city: string; // z. B. "Wien"
  neighborhood: string; // z. B. "Wieden, 4. Bezirk"
  hook: string; // poetischer italic-Einzeiler
  imageNote: string; // die "//"-Maschinen-Notiz auf dem Bild
  description: string; // 2–3 Sätze
  tags: string[]; // z. B. ["Cocktails", "Natural"]
  priceLevel: 1 | 2 | 3; // € / €€ / €€€
  address: string;
  ambience: Ambience[];
  rating: number; // 1.0–5.0
  lat: number;
  lng: number;
  tone: PlaceholderTone;
  reserveUrl?: string; // z. B. OpenTable-Link (nur extern verlinkt)

  // Nur für Events gesetzt:
  dateLabel?: string; // "Sa · 12. Juli · 22:00–06:00"
  meetingPoint?: string; // Treffpunkt
  ticketUrl?: string; // externer Ticket-Link
}

/** Der kuratierte "Geheimtipp der Woche" – einer für alle. */
export interface GeheimtippDerWoche {
  spotId: string;
  weekLabel: string; // z. B. "KW 26"
  teaser: string; // Lade-Text, z. B. "Wir kramen kurz im Hinterzimmer …"
}

/** Mock-Nutzerprofil (kein echtes Auth im MVP). */
export interface User {
  name: string;
  username: string;
  bio: string;
  savedSpotIds: string[];
}

/** Ein Stadtteil in der Stadt-Übersicht, mit poetischem Einzeiler. */
export interface Neighborhood {
  city: string;
  name: string;
  blurb: string;
}
