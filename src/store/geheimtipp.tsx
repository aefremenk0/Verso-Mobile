import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { GEHEIMTIPP_BY_CITY } from "../data/user";
import { useCity } from "./city";
import { usePersistedList } from "./usePersistedList";

// State of the "hidden gem of the week" — now **per city**.
//
// The shown tip (`spotId`/`weekLabel`) depends on the currently selected city
// (`useCity`). `abgeholt` = has THIS city's tip already been revealed? While
// `false`, the nav shows the yellow "?" cell. Each city has its own weekly tip,
// and therefore its own collected status. Persisted per signed-in user as the
// list of already-collected cities (Supabase `profiles.geheimtipp_abgeholt` +
// AsyncStorage); guest = in-memory.

// Stable guest fallback (no city collected yet).
const GUEST_ABGEHOLT: string[] = [];

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
  // Persisted list of cities whose weekly tip has already been revealed.
  const [abgeholtCities, setAbgeholtCities, resetCities] = usePersistedList(
    "geheimtipp_abgeholt",
    GUEST_ABGEHOLT,
  );

  const markAbgeholt = useCallback(
    () =>
      setAbgeholtCities((prev) =>
        prev.includes(city) ? prev : [...prev, city],
      ),
    [city, setAbgeholtCities],
  );
  const reset = useCallback(() => resetCities(), [resetCities]);

  // Pilot phase: only München has a tip -> fall back to München in case a city
  // without an entry ever became active.
  const tipp = GEHEIMTIPP_BY_CITY[city] ?? GEHEIMTIPP_BY_CITY.München!;
  const abgeholt = abgeholtCities.includes(city);

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
