import { describe, expect, it } from "vitest";
import { isEventCategory, sortByCategory } from "../../data/categories";
import { NEIGHBORHOODS } from "../../data/cities";
import { SPOTS } from "../../data/spots";
import type { Spot } from "../../data/types";
import { DEFAULT_FILTER, matchesFilter } from "../mapFilter";
import { SCENE_CATEGORIES } from "../scene";
import { distanceLabel, getOpenState } from "../spotMeta";

// Pure logic tests (RN-free). Cover the helpers that feed, map, filter and
// spot detail build on.

// A minimal spot for assembling test cases.
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

  it("default filter lets everything through", () => {
    expect(matchesFilter(s, DEFAULT_FILTER)).toBe(true);
  });

  it("type filters by category (OR within)", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, art: ["cafe"] })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, art: ["bar", "cafe"] })).toBe(true);
  });

  it("budget narrows via the € value of the price level", () => {
    // priceLevel 2 -> 40 €
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minPrice: 50 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, maxPrice: 30 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minPrice: 20, maxPrice: 60 })).toBe(true);
  });

  it("rating filters by minimum rating", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minRating: 4.6 })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, minRating: 4.0 })).toBe(true);
  });

  it("ambience: OR within the group", () => {
    expect(matchesFilter(s, { ...DEFAULT_FILTER, ambiente: ["elegant"] })).toBe(false);
    expect(matchesFilter(s, { ...DEFAULT_FILTER, ambiente: ["elegant", "intim"] })).toBe(true);
  });
});

describe("sortByCategory", () => {
  it("groups stably by CATEGORY_ORDER (eating before going-out order)", () => {
    const list = [
      makeSpot({ id: "a", category: "club" }),
      makeSpot({ id: "b", category: "restaurant" }),
      makeSpot({ id: "c", category: "cafe" }),
    ];
    const order = sortByCategory(list).map((s) => s.category);
    // restaurant comes before cafe, both before club
    expect(order.indexOf("restaurant")).toBeLessThan(order.indexOf("cafe"));
    expect(order.indexOf("cafe")).toBeLessThan(order.indexOf("club"));
  });
});

describe("isEventCategory", () => {
  it("weintasting & sport are event-like, the rest are not", () => {
    expect(isEventCategory("weintasting")).toBe(true);
    expect(isEventCategory("sport")).toBe(true);
    expect(isEventCategory("bar")).toBe(false);
    expect(isEventCategory("restaurant")).toBe(false);
  });
});

describe("SCENE_CATEGORIES", () => {
  it("feiern and essen do not overlap", () => {
    const overlap = SCENE_CATEGORIES.feiern.filter((c) =>
      SCENE_CATEGORIES.essen.includes(c),
    );
    expect(overlap).toEqual([]);
  });
});

describe("getOpenState", () => {
  it("bar: open at 23:00 (until 2:00, window across midnight)", () => {
    const bar = makeSpot({ category: "bar" });
    const at23 = new Date(2026, 5, 25, 23, 0);
    expect(getOpenState(bar, at23)?.openNow).toBe(true);
  });

  it("bar: closed at 15:00 (opens from 18:00)", () => {
    const bar = makeSpot({ category: "bar" });
    const at15 = new Date(2026, 5, 25, 15, 0);
    const st = getOpenState(bar, at15);
    expect(st?.openNow).toBe(false);
    expect(st?.label).toBe("from 18:00");
  });

  it("café: open at 10:00 (8–18)", () => {
    const cafe = makeSpot({ category: "cafe" });
    const at10 = new Date(2026, 5, 25, 10, 0);
    expect(getOpenState(cafe, at10)?.openNow).toBe(true);
  });

  it("events (weintasting/sport) have no opening status", () => {
    expect(getOpenState(makeSpot({ category: "weintasting" }))).toBeNull();
    expect(getOpenState(makeSpot({ category: "sport" }))).toBeNull();
  });

  it("explicit hours override the category default", () => {
    const s = makeSpot({ category: "cafe", hours: { open: 6, close: 9 } });
    const at10 = new Date(2026, 5, 25, 10, 0);
    expect(getOpenState(s, at10)?.openNow).toBe(false); // 10 > 9 -> closed
  });
});

describe("distanceLabel", () => {
  it("returns a label for known cities", () => {
    const s = makeSpot({ city: "Wien", lat: 48.2082, lng: 16.3738 });
    expect(distanceLabel(s)).toMatch(/from center/);
  });

  it("null for unknown city", () => {
    expect(distanceLabel(makeSpot({ city: "Paris" }))).toBeNull();
  });
});

describe("SPOTS data (integrity)", () => {
  it("every spot id is unique", () => {
    const ids = SPOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("events carry a dateLabel", () => {
    for (const s of SPOTS) {
      if (isEventCategory(s.category)) expect(s.dateLabel).toBeTruthy();
    }
  });

  it("every spot neighborhood is an exact neighborhood of its city", () => {
    // Secures the exact district match (bezirk/[name].tsx === instead of startsWith).
    for (const s of SPOTS) {
      const valid = NEIGHBORHOODS.some(
        (n) => n.city === s.city && n.name === s.neighborhood,
      );
      expect(valid, `${s.id}: "${s.neighborhood}" (${s.city})`).toBe(true);
    }
  });
});
