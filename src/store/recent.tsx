import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePersistedList } from "./usePersistedList";

// "Recently viewed" spots — PER ACCOUNT (profiles.recent_spot_ids), so the list
// follows the signed-in user and a fresh account starts empty. Persisted via
// usePersistedList (AsyncStorage cache keyed by uid + the profiles column).
// Guest (not signed in): in-memory only, empty. Most-recent first, capped.

const CAP = 12;
// Stable module constant (usePersistedList expects a stable guest fallback).
const EMPTY: string[] = [];

interface RecentContextValue {
  recentIds: string[];
  pushRecent: (id: string) => void;
  clearRecent: () => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

export function RecentProvider({ children }: { children: ReactNode }) {
  const [recentIds, update, reset] = usePersistedList("recent_spot_ids", EMPTY);

  const pushRecent = useCallback(
    (id: string) => {
      // Move to front, dedupe, cap.
      update((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, CAP));
    },
    [update],
  );

  const clearRecent = useCallback(() => reset(), [reset]);

  const value = useMemo<RecentContextValue>(
    () => ({ recentIds, pushRecent, clearRecent }),
    [recentIds, pushRecent, clearRecent],
  );

  return <RecentContext.Provider value={value}>{children}</RecentContext.Provider>;
}

export function useRecent(): RecentContextValue {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecent must be used within <RecentProvider>.");
  return ctx;
}
