import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CITIES, type City } from "../data/cities";

// Currently selected city. Set on the Welcome screen and read by the feed
// dropdown and the city overview.

interface CityContextValue {
  city: City;
  setCity: (c: City) => void;
  cities: readonly City[];
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  // Pilot city München is the default (and in the pilot phase the only
  // selectable city).
  const [city, setCity] = useState<City>("München");

  const value = useMemo<CityContextValue>(
    () => ({ city, setCity, cities: CITIES }),
    [city],
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error("useCity must be used within <CityProvider>.");
  }
  return ctx;
}
