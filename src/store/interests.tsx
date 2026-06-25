import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Ambience } from "../data/types";

// Interessen / „Vibe" des Nutzers (bei der Registrierung gewählt, max. 3).
// Wir nutzen die Ambiente-Werte als Interessen, weil sie szenenübergreifend an
// jedem Spot hängen (intim, lebhaft, draußen …). Der Feed sortiert passende
// Spots leicht nach oben — nichts wird ausgeblendet. Alles in-memory.

const MAX_INTERESTS = 3;

interface InterestsContextValue {
  interests: Ambience[];
  /** Wählt/entfernt einen Vibe (max. 3 — darüber hinaus wird ignoriert). */
  toggle: (a: Ambience) => void;
  /** Beim Abmelden zurücksetzen. */
  reset: () => void;
  max: number;
}

const InterestsContext = createContext<InterestsContextValue | null>(null);

export function InterestsProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<Ambience[]>([]);

  const toggle = useCallback((a: Ambience) => {
    setInterests((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= MAX_INTERESTS) return prev; // Obergrenze: nichts tun
      return [...prev, a];
    });
  }, []);

  const reset = useCallback(() => setInterests([]), []);

  const value = useMemo<InterestsContextValue>(
    () => ({ interests, toggle, reset, max: MAX_INTERESTS }),
    [interests, toggle, reset],
  );

  return (
    <InterestsContext.Provider value={value}>
      {children}
    </InterestsContext.Provider>
  );
}

export function useInterests(): InterestsContextValue {
  const ctx = useContext(InterestsContext);
  if (!ctx) {
    throw new Error("useInterests muss innerhalb von <InterestsProvider> genutzt werden.");
  }
  return ctx;
}
