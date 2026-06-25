import * as Haptics from "expo-haptics";

// Zentrale Haptik-Helfer (Expo-Go-fest). Fehler werden geschluckt (z. B. im
// Web/Simulator ohne Taptic Engine) — Haptik ist immer „nice to have", nie
// kritisch. Bewusst sparsam einsetzen (Merken, Szenenwechsel, Reveal, Shuffle).

export function tapLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function tapMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function tapSelection() {
  Haptics.selectionAsync().catch(() => {});
}

export function notifySuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
}
