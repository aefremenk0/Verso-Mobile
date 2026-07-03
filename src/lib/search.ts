// Diacritics-insensitive, typo-tolerant search matching.
// RN-free on purpose so it stays unit-testable (see logic.test.ts).

/** Lowercase + strip accents so "munchen" matches "München", "cafe" ~ "café". */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining accent marks
    .replace(/ß/g, "ss")
    .trim();
}

/**
 * Bounded Levenshtein distance. Returns the real distance, or `max + 1` as soon
 * as it's clear the budget is exceeded (cheap early-out — we never need the exact
 * value beyond the threshold).
 */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowBest = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowBest) rowBest = cur[j];
    }
    if (rowBest > max) return max + 1; // whole row past budget -> give up
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

/** Typo budget grows with token length: tiny tokens must be exact, longer ones
 *  tolerate 1–2 edits (a single fat-finger typo). */
function maxDistFor(len: number): number {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

/** Does one query token fuzzily match any word in the haystack? */
function tokenMatches(token: string, words: string[]): boolean {
  const max = maxDistFor(token.length);
  for (const w of words) {
    if (w.includes(token)) return true; // substring covers prefixes too
    if (max === 0) continue;
    if (editDistance(token, w, max) <= max) return true;
    // Compare against the same-length prefix so "restauran" ~ "restaurant".
    if (w.length > token.length && editDistance(token, w.slice(0, token.length), max) <= max)
      return true;
  }
  return false;
}

/**
 * True when `query` matches the given fields — tolerant to accents and small
 * typos. Every whitespace-separated query token must match some word in the
 * combined fields. An empty query matches everything.
 */
export function matchesQuery(fields: string[], query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const words = normalize(fields.join(" "))
    .split(/[\s/,.–—-]+/)
    .filter(Boolean);
  if (words.length === 0) return false;
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => tokenMatches(tok, words));
}
