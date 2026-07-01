import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchProfileColumn,
  loadLocal,
  patchProfileColumn,
  saveLocal,
  type ProfileColumn,
} from "../lib/profile";
import { useAuth } from "./auth";

// Keeps a list of strings in sync with (a) the local AsyncStorage cache and
// (b) the signed-in user's `profiles` column. Used by the saved / interests /
// geheimtipp stores so their data survives app restarts and follows the account.
//
// Guest (not signed in): stays in-memory at `guestFallback` — no persistence,
// which matches the old mock behavior. Signed in: hydrates from cache instantly,
// then from the DB (source of truth); every change is written to both.

export function usePersistedList<T extends string>(
  column: ProfileColumn,
  guestFallback: T[],
): readonly [T[], (updater: (prev: T[]) => T[]) => void, () => void] {
  const { user } = useAuth();
  const [list, setList] = useState<T[]>(guestFallback);
  // The user id we've already hydrated for — guards the persist effect so it
  // doesn't overwrite the DB with the fallback before the first load finishes.
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) {
      // Signed out / guest: back to the fallback, no persistence.
      hydratedFor.current = null;
      setList(guestFallback);
      return;
    }
    let cancelled = false;
    const localKey = `verso.${column}.${uid}`;
    (async () => {
      // 1) instant local cache (replaces any guest/mock value)
      const local = await loadLocal(localKey);
      if (cancelled) return;
      setList((local as T[] | null) ?? []);
      // 2) DB is the source of truth
      const remote = await fetchProfileColumn(uid, column);
      if (cancelled) return;
      if (remote && remote.length) {
        setList(remote as T[]);
        saveLocal(localKey, remote);
      } else if (local && local.length) {
        // DB empty but we have a local cache -> push it up (first sync / migrate)
        patchProfileColumn(uid, column, local);
      }
      hydratedFor.current = uid;
    })();
    return () => {
      cancelled = true;
    };
    // guestFallback is expected to be stable (module constant).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, column]);

  // Persist every change — but only once we've hydrated for this exact user.
  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid || hydratedFor.current !== uid) return;
    const localKey = `verso.${column}.${uid}`;
    saveLocal(localKey, list);
    patchProfileColumn(uid, column, list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, user?.id]);

  const update = useCallback(
    (updater: (prev: T[]) => T[]) => setList(updater),
    [],
  );
  const resetToFallback = useCallback(
    () => setList(guestFallback),
    // guestFallback is a stable module constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [list, update, resetToFallback] as const;
}
