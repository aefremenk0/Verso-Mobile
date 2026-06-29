import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Ambience } from "../data/types";

// The user's interests / "vibe" (chosen at registration, max. 3).
// We use the ambience values as interests because they attach to every spot
// across scenes (intimate, lively, outdoors …). The feed sorts matching spots
// slightly to the top — nothing is hidden. Everything in-memory.

const MAX_INTERESTS = 3;

interface InterestsContextValue {
  interests: Ambience[];
  /** Selects/removes a vibe (max. 3 — beyond that it is ignored). */
  toggle: (a: Ambience) => void;
  /** Reset on logout. */
  reset: () => void;
  max: number;
}

const InterestsContext = createContext<InterestsContextValue | null>(null);

export function InterestsProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<Ambience[]>([]);

  const toggle = useCallback((a: Ambience) => {
    setInterests((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= MAX_INTERESTS) return prev; // upper limit: do nothing
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
    throw new Error("useInterests must be used within <InterestsProvider>.");
  }
  return ctx;
}
