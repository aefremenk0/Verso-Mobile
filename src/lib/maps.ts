import { Linking, Platform } from "react-native";

// Deep-Links in externe Karten-Apps. Reine Verlinkung – keine eigene Karte.

/** Öffnet die Adresse in Apple Karten (iOS) bzw. als Web-Fallback. */
export function openAppleMaps(query: string) {
  const q = encodeURIComponent(query);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${q}`
      : `https://maps.apple.com/?q=${q}`;
  Linking.openURL(url);
}

/** Öffnet die Adresse in Google Maps (App falls vorhanden, sonst Web). */
export function openGoogleMaps(query: string) {
  const q = encodeURIComponent(query);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
}

/** Öffnet einen beliebigen externen Link (Reservierung, Tickets). */
export function openExternal(url: string) {
  Linking.openURL(url);
}
