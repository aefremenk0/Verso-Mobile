// Mock "share a TikTok/Instagram post to Verso -> draft a spot suggestion".
//
// This is the MOCK stage: pure, deterministic heuristics, NO AI yet. Later an
// AI assistant replaces `parseSharedPost` (same shape in/out) and the UI already
// labels the result as an assisted draft (see share-import.tsx + AI-transparency
// notice in legal.tsx). RN-free so it stays unit-testable.

import type { Category } from "../data/types";

export type ShareSource = "tiktok" | "instagram" | "link" | "text";

export interface DraftSuggestion {
  name: string;
  category?: Category;
  city?: string;
  note: string;
  source: ShareSource;
}

// Keyword -> category (first match wins). Lowercase, accent-free comparison.
const CATEGORY_HINTS: [RegExp, Category][] = [
  [/\b(coffee|cafe|kaffee|espresso|matcha|barista)\b/, "cafe"],
  [/\b(cocktail|bar|apero|aperitivo|drinks|wine bar|weinbar)\b/, "bar"],
  [/\b(club|clubbing|rave|techno|party|nightlife|dancefloor)\b/, "club"],
  [/\b(rooftop|skybar|dachterrasse)\b/, "rooftop"],
  [/\b(brunch|breakfast|fruhstuck)\b/, "cafe"],
  [/\b(pizza|pasta|sushi|ramen|burger|dinner|restaurant|essen|food|dining)\b/, "restaurant"],
  [/\b(bakery|backerei|dessert|cake|patisserie|eis|gelato)\b/, "dessert"],
  [/\b(streetfood|foodtruck|imbiss|kiosk)\b/, "streetfood"],
  [/\b(biergarten|beer garden)\b/, "biergarten"],
];

// Known cities we can recognise in the caption (canonical German value + aliases).
const CITY_ALIASES: [string, RegExp][] = [
  ["München", /\b(munchen|muenchen|munich|muc|minga)\b/],
  ["Wien", /\b(wien|vienna)\b/],
  ["Zürich", /\b(zurich|zuerich|zuri)\b/],
  ["Berlin", /\bberlin\b/],
  ["Hamburg", /\bhamburg\b/],
  ["Frankfurt", /\bfrankfurt\b/],
  ["Düsseldorf", /\b(dusseldorf|duesseldorf|dusldorf)\b/],
];

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss");
}

function detectSource(text: string): ShareSource {
  const f = fold(text);
  if (/tiktok\.com/.test(f)) return "tiktok";
  if (/instagram\.com|instagr\.am/.test(f)) return "instagram";
  if (/https?:\/\//.test(f)) return "link";
  return "text";
}

/** Pull a plausible place name: a @handle, a #hashtag, or a Capitalised phrase. */
function guessName(text: string): string {
  // 1) @handle -> "some_spot" => "Some Spot"
  const handle = /@([a-z0-9._]{2,30})/i.exec(text)?.[1];
  if (handle) {
    return handle
      .replace(/[._]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }
  // 2) A short quoted phrase "…"
  const quoted = /["“„]([^"”“]{2,40})["”“]/.exec(text)?.[1];
  if (quoted) return quoted.trim();
  // 3) First run of Capitalised words (e.g. "Café Central")
  const cap = /([A-ZÄÖÜ][\wäöüß'&-]+(?:\s+[A-ZÄÖÜ][\wäöüß'&-]+){0,3})/.exec(text)?.[1];
  if (cap) return cap.trim();
  return "";
}

function guessCategory(text: string): Category | undefined {
  const f = fold(text);
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(f)) return cat;
  return undefined;
}

function guessCity(text: string): string | undefined {
  const f = fold(text);
  for (const [city, re] of CITY_ALIASES) if (re.test(f)) return city;
  return undefined;
}

/**
 * Turn shared text (a TikTok/Instagram URL + caption, or any pasted text) into a
 * draft spot suggestion. Deterministic mock — a stand-in for the future AI step.
 */
export function parseSharedPost(input: string): DraftSuggestion {
  const text = (input ?? "").trim();
  return {
    name: guessName(text),
    category: guessCategory(text),
    city: guessCity(text),
    note: text.slice(0, 500),
    source: detectSource(text),
  };
}
