import { Linking, Platform } from "react-native";

// Deep links into external map apps. Pure linking – no map of our own.

/** Opens the address in Apple Maps (iOS) or as a web fallback. */
export function openAppleMaps(query: string) {
  const q = encodeURIComponent(query);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${q}`
      : `https://maps.apple.com/?q=${q}`;
  Linking.openURL(url);
}

/** Opens the address in Google Maps (the app if present, otherwise the web). */
export function openGoogleMaps(query: string) {
  const q = encodeURIComponent(query);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
}

/** Opens any external link (reservation, tickets). Only web/mail/tel schemes are
 *  allowed — never open an arbitrary/unknown scheme (defense in depth in case a
 *  URL ever comes from a less-trusted source than the admin-curated catalog). */
export function openExternal(url: string) {
  const u = (url ?? "").trim();
  if (/^(https?|mailto|tel):/i.test(u)) {
    Linking.openURL(u);
  }
}
