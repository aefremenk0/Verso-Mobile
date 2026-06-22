import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USER } from "../data/user";

// Speichert die gemerkten Spots im Arbeitsspeicher (in-memory).
// Im MVP bewusst KEINE Persistenz/DB – nur ein React-Context, damit
// "Merken" im Detail-Screen und die Gespeichert-Liste denselben Stand teilen.

interface SavedContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(MOCK_USER.savedSpotIds);

  const toggle = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
    );
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      savedIds,
      isSaved: (id: string) => savedIds.includes(id),
      toggle,
    }),
    [savedIds, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

/** Zugriff auf den Merken-Store. Muss innerhalb von <SavedProvider> stehen. */
export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved muss innerhalb von <SavedProvider> genutzt werden.");
  }
  return ctx;
}
