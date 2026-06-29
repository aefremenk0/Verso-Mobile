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

// State of the "hidden gem of the week" — now **per city**.
//
// The shown tip (`spotId`/`weekLabel`) depends on the currently selected city
// (`useCity`). `abgeholt` = has THIS city's tip already been revealed? While
// `false`, the nav shows the yellow "?" cell. Each city has its own weekly tip,
// and therefore its own collected status. In-memory.

interface GeheimtippContextValue {
  abgeholt: boolean;
  weekLabel: string;
  spotId: string;
  /** Call after the reveal: marks the current city's tip as collected. */
  markAbgeholt: () => void;
  /** On logout: reset all cities (tips become "fresh" again). */
  reset: () => void;
}

const GeheimtippContext = createContext<GeheimtippContextValue | null>(null);

export function GeheimtippProvider({ children }: { children: ReactNode }) {
  const { city } = useCity();
  // Track per city whether the weekly tip has already been revealed.
  const [abgeholtByCity, setAbgeholtByCity] = useState<Record<string, boolean>>(
    {},
  );

  const markAbgeholt = useCallback(
    () => setAbgeholtByCity((m) => ({ ...m, [city]: true })),
    [city],
  );
  const reset = useCallback(() => setAbgeholtByCity({}), []);

  // Pilot phase: only München has a tip -> fall back to München in case a city
  // without an entry ever became active.
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
    throw new Error("useGeheimtipp must be used within <GeheimtippProvider>.");
  }
  return ctx;
}
