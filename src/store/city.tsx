import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CITIES, type City } from "../data/cities";

// Aktuell gewählte Stadt. Wird auf dem Welcome-Screen gesetzt und vom
// Feed-Dropdown sowie der Stadt-Übersicht gelesen.

interface CityContextValue {
  city: City;
  setCity: (c: City) => void;
  cities: readonly City[];
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<City>("Wien");

  const value = useMemo<CityContextValue>(
    () => ({ city, setCity, cities: CITIES }),
    [city],
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error("useCity muss innerhalb von <CityProvider> genutzt werden.");
  }
  return ctx;
}
