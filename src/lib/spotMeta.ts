import type { Category, Spot } from "../data/types";

// Abgeleitete Detail-Infos für die Spot-Seite — bewusst ohne Backend/GPS:
//  - Öffnungsstatus ("Jetzt geöffnet?") aus typischen Zeiten pro Kategorie
//  - Entfernung zum Stadtzentrum (deterministisch, kein Standort-Prompt)

// Typische Öffnungsfenster je Kategorie (24h; close > 24 = nach Mitternacht,
// z. B. Bar bis 2:00 = 26). event-artige Kategorien haben einen Termin statt
// Öffnungszeiten -> null (Badge entfällt, der WANN-Block übernimmt).
const CATEGORY_HOURS: Record<Category, { open: number; close: number } | null> = {
  cafe: { open: 8, close: 18 },
  restaurant: { open: 12, close: 23 },
  snack: { open: 10, close: 22 },
  bar: { open: 18, close: 26 },
  club: { open: 23, close: 30 },
  weintasting: null,
  sport: null,
};

function fmtHour(h: number): string {
  const hh = Math.floor(h) % 24;
  return `${String(hh).padStart(2, "0")}:00`;
}

export interface OpenState {
  openNow: boolean;
  /** z. B. "bis 23:00" (offen) oder "ab 18:00" (geschlossen). */
  label: string;
}

/** Öffnungsstatus jetzt — null bei Events (die zeigen Datum statt Öffnungszeit). */
export function getOpenState(spot: Spot, now: Date = new Date()): OpenState | null {
  const base = spot.hours ?? CATEGORY_HOURS[spot.category];
  if (!base) return null;
  const h = now.getHours() + now.getMinutes() / 60;
  const openNow =
    base.close <= 24
      ? h >= base.open && h < base.close
      : h >= base.open || h < base.close - 24; // Fenster über Mitternacht
  return {
    openNow,
    label: openNow ? `bis ${fmtHour(base.close)}` : `ab ${fmtHour(base.open)}`,
  };
}

// Ungefähre Stadtzentren (für die Entfernungs-Angabe). Bewusst grob.
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
  const R = 6371; // Erdradius km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Entfernung Spot → Stadtzentrum als deutsches Label ("ca. 1,2 km vom Zentrum"). */
export function distanceLabel(spot: Spot): string | null {
  const center = CITY_CENTER[spot.city];
  if (!center) return null;
  const km = haversineKm(center, { lat: spot.lat, lng: spot.lng });
  const txt = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
  return `ca. ${txt} vom Zentrum`;
}
