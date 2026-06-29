import * as Haptics from "expo-haptics";

// Central haptics helpers (Expo-Go-safe). Errors are swallowed (e.g. on
// web/simulator without a Taptic Engine) — haptics are always "nice to have",
// never critical. Use sparingly on purpose (saving, scene switch, reveal, shuffle).

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
