import { describe, expect, it } from "vitest";
import { isEventCategory, sortByCategory } from "../../data/categories";
import { NEIGHBORHOODS } from "../../data/cities";
import { SPOTS } from "../../data/spots";
import type { Spot } from "../../data/types";
import { DEFAULT_FILTER, matchesFilter } from "../mapFilter";
import { SCENE_CATEGORIES } from "../scene";
import { distanceLabel, getOpenState } from "../spotMeta";
import { editDistance, matchesQuery, normalize } from "../search";
import { friendlyAuthError, isNetworkError } from "../errors";
import { redactText, scrubProps, shouldEmit } from "../analyticsCore";
import { parseSharedPost } from "../shareImport";
import { cityLabel } from "../lang";
import { CATEGORY_ORDER } from "../../data/categories";
import { PIN_COLORS } from "../pinColors";
import { initialsFromName } from "../initials";

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

describe("search: normalize", () => {
  it("lowercases and strips diacritics", () => {
    expect(normalize("München")).toBe("munchen");
    expect(normalize("Café")).toBe("cafe");
    expect(normalize("Grüße")).toBe("grusse"); // ü->u, ß->ss
  });
});

describe("search: editDistance (bounded)", () => {
  it("counts single edits", () => {
    expect(editDistance("cafe", "cafe", 2)).toBe(0);
    expect(editDistance("cafe", "caff", 2)).toBe(1); // substitution
    expect(editDistance("cafe", "caffe", 2)).toBe(1); // insertion
  });
  it("early-outs past the budget", () => {
    expect(editDistance("abcdef", "zzzzzz", 2)).toBeGreaterThan(2);
  });
});

describe("search: matchesQuery", () => {
  const fields = ["Café Central", "Glockenbachviertel", ["cozy", "coffee"]].flat();

  it("empty query matches", () => {
    expect(matchesQuery(fields, "")).toBe(true);
    expect(matchesQuery(fields, "   ")).toBe(true);
  });
  it("plain substring matches", () => {
    expect(matchesQuery(fields, "central")).toBe(true);
    expect(matchesQuery(fields, "coffee")).toBe(true);
  });
  it("is accent-insensitive both ways", () => {
    expect(matchesQuery(fields, "cafe")).toBe(true);
    expect(matchesQuery(["Munchen"], "münchen")).toBe(true);
  });
  it("tolerates a small typo", () => {
    expect(matchesQuery(fields, "cofee")).toBe(true); // coffee, 1 edit
    expect(matchesQuery(["Glockenbachviertel"], "glockenbachvirtel")).toBe(true);
  });
  it("requires every token to match some word", () => {
    expect(matchesQuery(fields, "central coffee")).toBe(true);
    expect(matchesQuery(fields, "central sushi")).toBe(false);
  });
  it("rejects unrelated queries", () => {
    expect(matchesQuery(fields, "helicopter")).toBe(false);
  });
});

describe("errors: isNetworkError", () => {
  it("detects connectivity failures", () => {
    expect(isNetworkError("Network request failed")).toBe(true);
    expect(isNetworkError("TypeError: Failed to fetch")).toBe(true);
    expect(isNetworkError("The request timed out")).toBe(true);
  });
  it("is false for auth errors and empty", () => {
    expect(isNetworkError("Invalid login credentials")).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError("")).toBe(false);
  });
});

describe("errors: friendlyAuthError", () => {
  it("maps network errors to a no-connection line", () => {
    expect(friendlyAuthError("Network request failed", "en")).toMatch(/No connection/i);
    expect(friendlyAuthError("Network request failed", "de")).toMatch(/Keine Verbindung/i);
  });
  it("maps invalid credentials", () => {
    expect(friendlyAuthError("Invalid login credentials", "en")).toMatch(/isn't right/i);
    expect(friendlyAuthError("Invalid login credentials", "de")).toMatch(/stimmt nicht/i);
  });
  it("maps already-registered", () => {
    expect(friendlyAuthError("User already registered", "de")).toMatch(/schon ein Konto/i);
  });
  it("never leaks the raw string for unknown errors", () => {
    const raw = "pg: relation xyz does not exist";
    expect(friendlyAuthError(raw, "en")).not.toContain("relation xyz");
    expect(friendlyAuthError(raw, "de")).not.toContain("relation xyz");
  });
});

describe("analytics: scrubProps", () => {
  it("keeps primitives, drops non-primitives", () => {
    const out = scrubProps({ a: 1, b: true, c: null, d: "x" });
    expect(out).toEqual({ a: 1, b: true, c: null, d: "x" });
  });
  it("clips long strings to 64 chars (no free-text/PII leak)", () => {
    const long = "y".repeat(200);
    expect(scrubProps({ note: long })?.note).toHaveLength(64);
  });
  it("undefined in -> undefined out", () => {
    expect(scrubProps(undefined)).toBeUndefined();
  });
});

describe("analytics: shouldEmit", () => {
  it("errors always emit, tracks need consent", () => {
    expect(shouldEmit("error", false)).toBe(true);
    expect(shouldEmit("track", false)).toBe(false);
    expect(shouldEmit("track", true)).toBe(true);
  });
});

describe("shareImport: parseSharedPost (mock)", () => {
  it("detects the source platform", () => {
    expect(parseSharedPost("https://www.tiktok.com/@x/video/1").source).toBe("tiktok");
    expect(parseSharedPost("https://instagram.com/p/abc").source).toBe("instagram");
    expect(parseSharedPost("https://example.com/x").source).toBe("link");
    expect(parseSharedPost("just some words").source).toBe("text");
  });
  it("pulls a name from an @handle", () => {
    expect(parseSharedPost("love this @cafe.central spot").name).toBe("Cafe Central");
  });
  it("guesses a category from keywords", () => {
    expect(parseSharedPost("best matcha latte here").category).toBe("cafe");
    expect(parseSharedPost("insane cocktail bar").category).toBe("bar");
    expect(parseSharedPost("techno club all night").category).toBe("club");
  });
  it("recognises a city (accent-insensitive)", () => {
    expect(parseSharedPost("hidden gem in Munich").city).toBe("München");
    expect(parseSharedPost("beste bar in muenchen").city).toBe("München");
  });
  it("keeps the original text as the note (clipped)", () => {
    const long = "x".repeat(700);
    expect(parseSharedPost(long).note).toHaveLength(500);
  });
});

describe("cityLabel (i18n)", () => {
  it("localizes the canonical German city value", () => {
    expect(cityLabel("München", "en")).toBe("Munich");
    expect(cityLabel("München", "de")).toBe("München");
  });
  it("falls back to the raw value for unknown cities", () => {
    expect(cityLabel("Paris", "en")).toBe("Paris");
  });
});

describe("PIN_COLORS (integrity)", () => {
  it("every category used by a spot has a pin color", () => {
    for (const s of SPOTS) {
      expect(PIN_COLORS[s.category], s.category).toBeTruthy();
    }
  });
  it("every category in CATEGORY_ORDER has a pin color", () => {
    for (const cat of Object.keys(CATEGORY_ORDER)) {
      expect(PIN_COLORS[cat as keyof typeof PIN_COLORS], cat).toBeTruthy();
    }
  });
});

describe("analytics: redactText", () => {
  it("redacts emails and long tokens", () => {
    expect(redactText("login failed for a@b.com")).toBe("login failed for [email]");
    expect(redactText("token=abcdefghijklmnopqrstuvwxyz123")).toContain("[token]");
  });
  it("leaves ordinary error text intact", () => {
    expect(redactText("TypeError: undefined is not a function")).toBe(
      "TypeError: undefined is not a function",
    );
  });
  it("redacts multiple emails in one string", () => {
    expect(redactText("a@b.com and c@d.org")).toBe("[email] and [email]");
  });
});

describe("analytics: scrubProps (drops non-primitives)", () => {
  it("removes arrays and objects (only primitives survive)", () => {
    const out = scrubProps({
      ok: "x",
      n: 3,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      arr: [1, 2] as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: { a: 1 } as any,
    });
    expect(out).toEqual({ ok: "x", n: 3 });
  });
});

describe("initials: initialsFromName", () => {
  it("takes the first letter of up to two words, uppercased", () => {
    expect(initialsFromName("Andrey Efremenko")).toBe("AE");
    expect(initialsFromName("lena hofer maier")).toBe("LH"); // max two
    expect(initialsFromName("madonna")).toBe("M");
  });
  it("handles extra whitespace", () => {
    expect(initialsFromName("  jon   snow  ")).toBe("JS");
  });
  it("falls back to '?' for an empty name", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("   ")).toBe("?");
  });
});
