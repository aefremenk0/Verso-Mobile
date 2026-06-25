import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GEHEIMTIPP_BY_CITY } from "../data/user";
import { useCity } from "./city";

// Zustand des "Geheimtipp der Woche" — jetzt **pro Stadt**.
//
// Der gezeigte Tipp (`spotId`/`weekLabel`) richtet sich nach der aktuell
// gewählten Stadt (`useCity`). `abgeholt` = wurde der Tipp DIESER Stadt schon
// aufgedeckt? Solange `false`, zeigt die Nav die gelbe "?"-Zelle. Jede Stadt hat
// ihren eigenen Wochentipp, also auch ihren eigenen Abhol-Status. In-memory.

interface GeheimtippContextValue {
  abgeholt: boolean;
  weekLabel: string;
  spotId: string;
  /** Nach dem Reveal aufrufen: markiert den Tipp der aktuellen Stadt als abgeholt. */
  markAbgeholt: () => void;
  /** Beim Abmelden: alle Städte zurücksetzen (Tipps wieder "frisch"). */
  reset: () => void;
}

const GeheimtippContext = createContext<GeheimtippContextValue | null>(null);

export function GeheimtippProvider({ children }: { children: ReactNode }) {
  const { city } = useCity();
  // Pro Stadt merken, ob der Wochentipp schon aufgedeckt wurde.
  const [abgeholtByCity, setAbgeholtByCity] = useState<Record<string, boolean>>(
    {},
  );

  const markAbgeholt = useCallback(
    () => setAbgeholtByCity((m) => ({ ...m, [city]: true })),
    [city],
  );
  const reset = useCallback(() => setAbgeholtByCity({}), []);

  // Pilot-Phase: nur München hat einen Tipp -> Fallback auf München, falls je
  // eine Stadt ohne Eintrag aktiv würde.
  const tipp = GEHEIMTIPP_BY_CITY[city] ?? GEHEIMTIPP_BY_CITY.München!;
  const abgeholt = !!abgeholtByCity[city];

  const value = useMemo<GeheimtippContextValue>(
    () => ({
      abgeholt,
      weekLabel: tipp.weekLabel,
      spotId: tipp.spotId,
      markAbgeholt,
      reset,
    }),
    [abgeholt, tipp.weekLabel, tipp.spotId, markAbgeholt, reset],
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
