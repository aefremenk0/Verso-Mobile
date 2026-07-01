import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NEIGHBORHOODS as MOCK_NEIGHBORHOODS } from "../data/cities";
import { SPOTS as MOCK_SPOTS } from "../data/spots";
import type {
  Category,
  Neighborhood,
  PlaceholderTone,
  Spot,
} from "../data/types";
import { hasSupabase, supabase } from "../lib/supabase";

// Catalog = the curated content (spots + neighborhoods). Starts with the local
// mock so the UI renders instantly and works offline; when Supabase is
// configured it fetches the real rows and swaps them in. If the fetch fails or
// returns nothing, the mock stays (safe fallback). Screens read via useCatalog()
// instead of importing the mock arrays directly.

// DB rows use snake_case -> map to our camelCase types.
function rowToSpot(r: any): Spot {
  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    city: r.city,
    neighborhood: r.neighborhood,
    hook: r.hook,
    imageNote: r.image_note,
    description: r.description,
    tags: r.tags ?? [],
    priceLevel: r.price_level,
    address: r.address,
    ambience: r.ambience ?? [],
    rating: Number(r.rating),
    lat: Number(r.lat),
    lng: Number(r.lng),
    tone: r.tone as PlaceholderTone,
    reserveUrl: r.reserve_url ?? undefined,
    hours: r.hours ?? undefined,
    dateLabel: r.date_label ?? undefined,
    meetingPoint: r.meeting_point ?? undefined,
    ticketUrl: r.ticket_url ?? undefined,
    de: r.de ?? undefined,
  };
}

function rowToNeighborhood(r: any): Neighborhood {
  return {
    city: r.city,
    name: r.name,
    blurb: r.blurb,
    blurbDe: r.blurb_de ?? undefined,
  };
}

interface CatalogContextValue {
  spots: Spot[];
  neighborhoods: Neighborhood[];
  getSpotById: (id: string) => Spot | undefined;
  /** Where the current data comes from (handy for a debug badge). */
  source: "mock" | "supabase";
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS);
  const [neighborhoods, setNeighborhoods] =
    useState<Neighborhood[]>(MOCK_NEIGHBORHOODS);
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  useEffect(() => {
    if (!hasSupabase) return;
    let cancelled = false;
    (async () => {
      try {
        const [s, n] = await Promise.all([
          supabase.from("spots").select("*"),
          supabase.from("neighborhoods").select("*"),
        ]);
        if (cancelled) return;
        const mappedSpots = (s.data ?? []).map(rowToSpot);
        const mappedHoods = (n.data ?? []).map(rowToNeighborhood);
        // Only swap if we actually got rows — otherwise keep the mock fallback.
        if (mappedSpots.length > 0) setSpots(mappedSpots);
        if (mappedHoods.length > 0) setNeighborhoods(mappedHoods);
        if (mappedSpots.length > 0 || mappedHoods.length > 0)
          setSource("supabase");
      } catch {
        // network/mapping error -> keep the mock data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogContextValue>(() => {
    const byId = new Map(spots.map((s) => [s.id, s]));
    return {
      spots,
      neighborhoods,
      getSpotById: (id: string) => byId.get(id),
      source,
    };
  }, [spots, neighborhoods, source]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within <CatalogProvider>.");
  return ctx;
}
