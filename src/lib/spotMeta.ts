import type { Category, Spot } from "../data/types";
import type { Lang } from "./lang";

// Derived detail info for the spot page — deliberately without backend/GPS:
//  - opening status ("Open now?") from typical hours per category
//  - distance to the city center (deterministic, no location prompt)

// Typical opening windows per category (24h; close > 24 = after midnight,
// e.g. bar until 2:00 = 26). Event-like categories have a date instead of
// opening hours -> null (no badge, the WHEN block takes over).
const CATEGORY_HOURS: Record<Category, { open: number; close: number } | null> = {
  cafe: { open: 8, close: 18 },
  restaurant: { open: 12, close: 23 },
  snack: { open: 10, close: 22 },
  dessert: { open: 11, close: 22 },
  streetfood: { open: 11, close: 22 },
  biergarten: { open: 11, close: 23 },
  bar: { open: 18, close: 26 },
  club: { open: 23, close: 30 },
  rooftop: { open: 16, close: 25 }, // until ~1:00
  livemusik: { open: 19, close: 27 }, // until ~3:00
  kino: { open: 14, close: 24 },
  // Sport (Insider)
  pilates: { open: 7, close: 21 },
  runclub: { open: 6, close: 21 },
  cycleclub: { open: 6, close: 21 },
  gym: { open: 6, close: 23 },
  // Event-like -> date instead of hours.
  weintasting: null,
  sport: null,
  konzerte: null,
};

function fmtHour(h: number): string {
  const hh = Math.floor(h) % 24;
  return `${String(hh).padStart(2, "0")}:00`;
}

export interface OpenState {
  openNow: boolean;
  /** e.g. "until 23:00" (open) or "from 18:00" (closed). */
  label: string;
}

/** Opening status now — null for events (which show a date instead of hours). */
export function getOpenState(
  spot: Spot,
  now: Date = new Date(),
  lang: Lang = "en",
): OpenState | null {
  const base = spot.hours ?? CATEGORY_HOURS[spot.category];
  if (!base) return null;
  const h = now.getHours() + now.getMinutes() / 60;
  const openNow =
    base.close <= 24
      ? h >= base.open && h < base.close
      : h >= base.open || h < base.close - 24; // window across midnight
  const until = openNow
    ? lang === "de"
      ? `bis ${fmtHour(base.close)}`
      : `until ${fmtHour(base.close)}`
    : lang === "de"
      ? `ab ${fmtHour(base.open)}`
      : `from ${fmtHour(base.open)}`;
  return { openNow, label: until };
}

// Approximate city centers (for the distance label). Deliberately rough.
const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  München: { lat: 48.1372, lng: 11.5755 },
  Wien: { lat: 48.2082, lng: 16.3738 },
  Zürich: { lat: 47.3769, lng: 8.5417 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Frankfurt: { lat: 50.1109, lng: 8.6821 },
  Düsseldorf: { lat: 51.2277, lng: 6.7735 },
};

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Distance spot → city center, localized ("approx. 1.2 km from center" /
 *  "ca. 1,2 km vom Zentrum"). */
export function distanceLabel(spot: Spot, lang: Lang = "en"): string | null {
  const center = CITY_CENTER[spot.city];
  if (!center) return null;
  const km = haversineKm(center, { lat: spot.lat, lng: spot.lng });
  if (lang === "de") {
    const txt =
      km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
    return `ca. ${txt} vom Zentrum`;
  }
  const txt = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  return `approx. ${txt} from center`;
}
