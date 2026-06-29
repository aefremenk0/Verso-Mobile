// Data models for Verso (MVP: everything is mock only, no backend).

/** Categories of a spot. The feed filter is based on this. */
export type Category =
  | "restaurant"
  | "snack"
  | "cafe"
  | "bar"
  | "club"
  // More specific party types (event-like: with date/ticket):
  | "weintasting"
  | "sport";

/** Ambience values (map filter in phase 2, already usable as a tag in the MVP). */
export type Ambience =
  | "intim"
  | "lebhaft"
  | "gemütlich"
  | "underground"
  | "elegant"
  | "draußen";

/**
 * Color tone of the dark image placeholder. In the mockup the placeholders
 * vary between brownish and dark green – this keeps the feed lively.
 */
export type PlaceholderTone = "brown" | "green" | "charcoal";

/**
 * A place (or event). Events are spots with `category: "event"` and the
 * additional fields `dateLabel`, `meetingPoint`, `ticketUrl`.
 */
export interface Spot {
  id: string;
  name: string;
  category: Category;
  city: string; // e.g. "Wien"
  neighborhood: string; // e.g. "Wieden, 4. Bezirk"
  hook: string; // poetic italic one-liner
  imageNote: string; // the "//" machine note on the image
  description: string; // 2–3 sentences
  tags: string[]; // e.g. ["Cocktails", "Natural"]
  priceLevel: 1 | 2 | 3; // € / €€ / €€€
  address: string;
  ambience: Ambience[];
  rating: number; // 1.0–5.0
  lat: number;
  lng: number;
  tone: PlaceholderTone;
  reserveUrl?: string; // e.g. OpenTable link (only linked externally)
  /** Optional opening hours (24h; close > 24 = after midnight). If this
   *  field is missing, `getOpenState` derives the time from the category. */
  hours?: { open: number; close: number };

  // Set only for events:
  dateLabel?: string; // "Sa · 12. Juli · 22:00–06:00"
  meetingPoint?: string; // meeting point
  ticketUrl?: string; // external ticket link
}

/** The curated "Hidden Gem of the Week" – one for everyone. */
export interface GeheimtippDerWoche {
  spotId: string;
  weekLabel: string; // e.g. "KW 26"
  teaser: string; // loading text, e.g. "Digging through the back room …"
}

/** Mock user profile (no real auth in the MVP). */
export interface User {
  name: string;
  username: string;
  bio: string;
  savedSpotIds: string[];
}

/** A neighborhood in the city overview, with a poetic one-liner. */
export interface Neighborhood {
  city: string;
  name: string;
  blurb: string;
}
