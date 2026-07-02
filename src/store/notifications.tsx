import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useT } from "../lib/i18n";
import {
  ensureNotificationPermission,
  registerPushToken,
  syncWeeklyGeheimtipp,
} from "../lib/notifications";
import { patchProfile } from "../lib/profile";
import { hasSupabase, supabase } from "../lib/supabase";
import { usePersistedList } from "./usePersistedList";

// Notification preferences (which of the three toggles are on), persisted per
// user in `profiles.notify`. Enabling asks for OS permission, registers the push
// token (for future server-sent "new spots"/"events"), and — for the hidden gem
// — schedules a real weekly LOCAL reminder (works without a server).

export type NotifKey = "geheimtipp" | "spots" | "events";
const GUEST_NOTIF: NotifKey[] = []; // opt-in: nothing until the user turns it on

interface NotificationsContextValue {
  isEnabled: (k: NotifKey) => boolean;
  setEnabled: (k: NotifKey, on: boolean) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [list, update] = usePersistedList<NotifKey>("notify", GUEST_NOTIF);

  const isEnabled = useCallback((k: NotifKey) => list.includes(k), [list]);

  const setEnabled = useCallback(
    async (k: NotifKey, on: boolean) => {
      if (on) {
        const granted = await ensureNotificationPermission();
        update((prev) => (prev.includes(k) ? prev : [...prev, k]));
        // Store the push token so a backend can later send "new spots"/"events".
        if (granted) {
          const token = await registerPushToken();
          if (token && hasSupabase) {
            const { data } = await supabase.auth.getUser();
            if (data.user?.id) patchProfile(data.user.id, { push_token: token });
          }
        }
      } else {
        update((prev) => prev.filter((x) => x !== k));
      }
    },
    [update],
  );

  // Keep the local weekly reminder in sync with the "hidden gem" toggle.
  useEffect(() => {
    syncWeeklyGeheimtipp(
      list.includes("geheimtipp"),
      "Verso",
      t(
        "Your hidden gem of the week is ready.",
        "Dein Geheimtipp der Woche wartet.",
      ),
    );
    // Re-run only when the enabled set changes (not on every render / t change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ isEnabled, setEnabled }),
    [isEnabled, setEnabled],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationsProvider>.",
    );
  return ctx;
}
