import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USER } from "../data/user";

// Stores the saved spots in memory (in-memory).
// In the MVP deliberately NO persistence/DB – just a React context so that
// "Save" in the detail screen and the Saved list share the same state.

interface SavedContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  /** On logout: back to the initial values. */
  reset: () => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(MOCK_USER.savedSpotIds);

  const toggle = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
    );
  }, []);

  const reset = useCallback(() => setSavedIds(MOCK_USER.savedSpotIds), []);

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
