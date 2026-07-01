import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { MOCK_USER } from "../data/user";
import { usePersistedList } from "./usePersistedList";

// Saved spots. Persisted per signed-in user (Supabase `profiles.saved_spot_ids`
// + AsyncStorage cache) via usePersistedList, so the list survives app restarts
// and follows the account. Guest = in-memory mock (MOCK_USER.savedSpotIds).

// Stable guest fallback (module constant so the persist hook's deps stay stable).
const GUEST_SAVED = MOCK_USER.savedSpotIds;

interface SavedContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  /** On logout: back to the initial values. */
  reset: () => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds, resetToFallback] = usePersistedList(
    "saved_spot_ids",
    GUEST_SAVED,
  );

  const toggle = useCallback(
    (id: string) => {
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
      );
    },
    [setSavedIds],
  );

  const reset = useCallback(() => resetToFallback(), [resetToFallback]);

  const value = useMemo<SavedContextValue>(
    () => ({
      savedIds,
      isSaved: (id: string) => savedIds.includes(id),
      toggle,
      reset,
    }),
    [savedIds, toggle, reset],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

/** Access to the saved store. Must be within <SavedProvider>. */
export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within <SavedProvider>.");
  }
  return ctx;
}
