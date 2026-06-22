import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GEHEIMTIPP } from "../data/user";

// Zustand des "Geheimtipp der Woche".
//
// `abgeholt` = wurde der Tipp dieser Woche schon aufgedeckt? Solange `false`,
// zeigt der Feed ein gelbes "?"-Badge am Avatar. Nach dem Reveal -> `true`
// (bis zur nächsten Woche). Alles in-memory, kein Backend.

interface GeheimtippContextValue {
  abgeholt: boolean;
  weekLabel: string;
  spotId: string;
  /** Nach dem Reveal aufrufen: Badge verschwindet bis nächste Woche. */
  markAbgeholt: () => void;
  /** Beim Abmelden: alles zurücksetzen (Tipp wieder "frisch"). */
  reset: () => void;
}

const GeheimtippContext = createContext<GeheimtippContextValue | null>(null);

export function GeheimtippProvider({ children }: { children: ReactNode }) {
  const [abgeholt, setAbgeholt] = useState(false);

  const markAbgeholt = useCallback(() => setAbgeholt(true), []);
  const reset = useCallback(() => setAbgeholt(false), []);

  const value = useMemo<GeheimtippContextValue>(
    () => ({
      abgeholt,
      weekLabel: GEHEIMTIPP.weekLabel,
      spotId: GEHEIMTIPP.spotId,
      markAbgeholt,
      reset,
    }),
    [abgeholt, markAbgeholt, reset],
  );

  return (
    <GeheimtippContext.Provider value={value}>
      {children}
    </GeheimtippContext.Provider>
  );
}

export function useGeheimtipp(): GeheimtippContextValue {
  const ctx = useContext(GeheimtippContext);
  if (!ctx) {
    throw new Error("useGeheimtipp muss innerhalb von <GeheimtippProvider> genutzt werden.");
  }
  return ctx;
}
