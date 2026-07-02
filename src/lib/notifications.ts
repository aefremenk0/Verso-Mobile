import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Push / local notifications wrapper. Expo-Go-safe: remote push tokens don't
// work in Expo Go or on the iOS Simulator, so those calls fail soft. Local
// scheduled notifications (the weekly hidden-gem reminder) work in a dev build
// and need no server.

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Foreground behaviour: still show the banner + list, play a sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Ask for notification permission (returns whether it's granted). */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

/** Expo push token for server-sent notifications. null in Expo Go / Simulator. */
export async function registerPushToken(): Promise<string | null> {
  if (isExpoGo) return null; // remote push unsupported in Expo Go
  if (!Device.isDevice) return null; // Simulator can't obtain an APNs token
  try {
    const projectId =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Constants.expoConfig?.extra as any)?.eas?.projectId ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Constants as any)?.easConfig?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

// Local weekly reminder for the hidden gem of the week — no server needed.
// We cancel all scheduled notifications and reschedule, so it stays a single
// recurring reminder (Monday 9:00).
export async function syncWeeklyGeheimtipp(
  enabled: boolean,
  title: string,
  body: string,
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // 1 = Sunday -> 2 = Monday
        hour: 9,
        minute: 0,
      },
    });
  } catch {
    // scheduling unavailable (e.g. Expo Go limits) -> ignore
  }
}
