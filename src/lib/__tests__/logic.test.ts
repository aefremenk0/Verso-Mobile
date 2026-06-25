import { describe, expect, it } from "vitest";
import { isEventCategory, sortByCategory } from "../../data/categories";
import { SPOTS } from "../../data/spots";
import type { Spot } from "../../data/types";
import { DEFAULT_FILTER, matchesFilter } from "../mapFilter";
import { SCENE_CATEGORIES } from "../scene";
import { distanceLabel, getOpenState } from "../spotMeta";

// Reine Logik-Tests (RN-frei). Decken die Helfer ab, auf denen Feed, Karte,
// Filter und Spot-Detail aufbauen.

// Ein Minimal-Spot zum Zusammenbauen von Testfällen.
function makeSpot(p: Partial<Spot>): Spot {
  return {
    id: "x",
    name: "Test",
    category: "bar",
    city: "Wien",
    neighborhood: "Neubau (7.)",
    hook: "",
    imageNote: "",
    description: "",
    tags: [],
    priceLevel: 2,
    address: "",
    ambience: [],
    rating: 4.5,
    lat: 48.2,
    lng: 16.37,
    tone: "brown",
    ...p,
  };
}

describe("matchesFilter", () => {
  const s = makeSpot({ category: "bar", priceLevel: 2, rating: 4.5, ambience: ["intim"] });

  it("Default-Filter lässt alles durch", () => {
    expect(matchesFilter(s, DEFAULT_FILTER)).toBe(true);
  });

  it("Art filtert nach Kategorie (ODER innerhalb)", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, art: ["cafe"] })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, art: ["bar", "cafe"] })).toBe(true);
  });

  it("Budget grenzt über den €-Wert der Preisstufe ein", () => {
    // priceLevel 2 -> 40 €
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minPrice: 50 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, maxPrice: 30 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minPrice: 20, maxPrice: 60 })).toBe(true);
  });

  it("Bewertung filtert nach Mindest-Rating", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minRating: 4.6 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minRating: 4.0 })).toBe(true);
  });

  it("Ambiente: ODER innerhalb der Gruppe", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, ambiente: ["elegant"] })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, ambiente: ["elegant", "intim"] })).toBe(true);
  });
});

describe("sortByCategory", () => {
  it("gruppiert stabil nach CATEGORY_ORDER (Essen vor Feiern-Reihenfolge)", () => {
    const list = [
      makeSpot({ id: "a", category: "club" }),
      makeSpot({ id: "b", category: "restaurant" }),
      makeSpot({ id: "c", category: "cafe" }),
    ];
    const order = sortByCategory(list).map((s) => s.category);
    // restaurant kommt vor cafe, beide vor club
    expect(order.indexOf("restaurant")).toBeLessThan(order.indexOf("cafe"));
    expect(order.indexOf("cafe")).toBeLessThan(order.indexOf("club"));
  });
});

describe("isEventCategory", () => {
  it("weintasting & sport sind event-artig, der Rest nicht", () => {
    expect(isEventCategory("weintasting")).toBe(true);
    expect(isEventCategory("sport")).toBe(true);
    expect(isEventCategory("bar")).toBe(false);
    expect(isEventCategory("restaurant")).toBe(false);
  });
});

describe("SCENE_CATEGORIES", () => {
  it("feiern und essen überschneiden sich nicht", () => {
    const overlap = SCENE_CATEGORIES.feiern.filter((c) =>
      SCENE_CATEGORIES.essen.includes(c),
    );
    expect(overlap).toEqual([]);
  });
});

describe("getOpenState", () => {
  it("Bar: 23:00 offen (bis 2:00, Fenster über Mitternacht)", () => {
    const bar = makeSpot({ category: "bar" });
    const at23 = new Date(2026, 5, 25, 23, 0);
    expect(getOpenState(bar, at23)?.openNow).toBe(true);
  });

  it("Bar: 15:00 geschlossen (öffnet ab 18:00)", () => {
    const bar = makeSpot({ category: "bar" });
    const at15 = new Date(2026, 5, 25, 15, 0);
    const st = getOpenState(bar, at15);
    expect(st?.openNow).toBe(false);
    expect(st?.label).toBe("ab 18:00");
  });

  it("Café: 10:00 offen (8–18)", () => {
    const cafe = makeSpot({ category: "cafe" });
    const at10 = new Date(2026, 5, 25, 10, 0);
    expect(getOpenState(cafe, at10)?.openNow).toBe(true);
  });

  it("Events (weintasting/sport) haben keinen Öffnungsstatus", () => {
    expect(getOpenState(makeSpot({ category: "weintasting" }))).toBeNull();
    expect(getOpenState(makeSpot({ category: "sport" }))).toBeNull();
  });

  it("explizite hours überschreiben die Kategorie-Default", () => {
    const s = makeSpot({ category: "cafe", hours: { open: 6, close: 9 } });
    const at10 = new Date(2026, 5, 25, 10, 0);
    expect(getOpenState(s, at10)?.openNow).toBe(false); // 10 > 9 -> zu
  });
});

describe("distanceLabel", () => {
  it("liefert ein Label für bekannte Städte", () => {
    const s = makeSpot({ city: "Wien", lat: 48.2082, lng: 16.3738 });
    expect(distanceLabel(s)).toMatch(/vom Zentrum/);
  });

  it("null für unbekannte Stadt", () => {
    expect(distanceLabel(makeSpot({ city: "Paris" }))).toBeNull();
  });
});

describe("SPOTS-Daten (Integrität)", () => {
  it("jede Spot-id ist eindeutig", () => {
    const ids = SPOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Events tragen ein dateLabel", () => {
    for (const s of SPOTS) {
      if (isEventCategory(s.category)) expect(s.dateLabel).toBeTruthy();
    }
  });
});
