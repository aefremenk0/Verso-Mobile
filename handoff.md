# Handoff — Verso Mobile

_Branch: `claude/charming-sagan-jyk0wh` · Last update: 2026-07-03 (incl. nav-context crash fix)_

---

## 1. Goal

Take the Verso Mobile MVP (Expo/React Native curated city-discovery app, Munich
pilot) from "feature-complete backend" to **launch-ready polish + robustness +
legal groundwork**, without breaking Expo Go compatibility. Concretely, this
session's goal was to work through three requested buckets in order:

- **🟢 Polish** — dark-mode hairlines, typo-tolerant search + "recently viewed",
  Dynamic Type safety.
- **🟡 Robustness** — friendly error/offline states, loading skeletons, analytics
  + crash reporting, tests + CI.
- **⚖️ Legal / Launch** — fix the (dangerously false) privacy copy, paywall
  Terms/Privacy links, 16+ age gate, full account-deletion cascade, password-reset
  deep link, EU AI-Act transparency, and a TikTok/Instagram "share to Verso →
  suggest a place" mockup (no AI yet).

Everything must stay **pure JS (runs in Expo Go)**, keep `tsc` clean and the
vitest suite green, and be committed + pushed to the feature branch.

---

## 2. Current state

**Done, committed, and pushed.** All 10 planned tasks are complete.

- `npx tsc --noEmit` → clean.
- `npm test` → **46/46 vitest passing** (was 18 at session start).
- `npx expo export --platform ios` → bundle builds.
- Latest pushed commit: `5fb79fa` on `claude/charming-sagan-jyk0wh`.
- CLAUDE.md changelog updated (consolidated 2026-07-03 entry + nav-context fix).

**Post-session fix:** a "Couldn't find a navigation context" crash (took down dark
mode / launch) was found and fixed — see §4 item 15 and §5.

The app now has: theme-aware borders (dark mode), tolerant search, a
"recently viewed" rail, Dynamic-Type-capped chrome, friendly bilingual
error/offline states, loading skeletons, first-party consent-aware analytics +
crash reporting, an honest privacy/legal screen (AI + withdrawal sections),
paywall legal links, a 16+ age gate, a complete GDPR delete cascade, a
password-reset deep-link flow, a TikTok/Instagram share-import mockup, and CI.

**Not done in code (by design — needs a human):** the binding legal texts
(Impressum, full privacy policy, ToS, DPAs) and the Supabase/RevenueCat/OAuth
console setup (see §6).

---

## 3. Active files

New this session:
- `src/lib/search.ts` — normalize + bounded Levenshtein + `matchesQuery` (typo/accent tolerant).
- `src/store/recent.tsx` + `src/components/RecentRail.tsx` — recently-viewed spots.
- `src/lib/fontScale.ts` — `MAX_CHROME_SCALE` (Dynamic-Type cap for fixed chrome).
- `src/lib/errors.ts` — `isNetworkError`, `friendlyAuthError` (bilingual).
- `src/components/SpotCardSkeleton.tsx` — feed loading skeletons.
- `src/lib/analytics.ts` + `src/lib/analyticsCore.ts` — consent-aware analytics/crash.
- `app/reset-password.tsx` — set-new-password screen (recovery deep link).
- `src/lib/shareImport.ts` + `app/share-import.tsx` — TikTok/Insta → draft suggestion (mock).
- `supabase/migrations/0008_analytics.sql`, `0009_delete_cascade.sql`.
- `.github/workflows/ci.yml` — tsc + vitest on push/PR.

Modified:
- `tailwind.config.js`, `global.css`, `src/store/appearance.tsx` — `line` token.
- `app/(tabs)/feed.tsx`, `app/(tabs)/karte.tsx`, `app/gespeichert.tsx` — new search.
- `app/spot/[id].tsx` — pushRecent + `spot_view` track.
- `src/store/catalog.tsx` — `status: loading|live|offline`.
- `src/store/auth.tsx` — deep-link handler + `PASSWORD_RECOVERY` routing + identify.
- `src/store/profile.tsx`, `src/lib/profile.ts` — `save()`/`patchProfile` return `{error}`.
- `app/register.tsx` — friendly errors + 16+ checkbox + auth tracks.
- `app/settings.tsx` — analytics consent toggle; friendly delete error.
- `app/insider.tsx` — paywall Terms/Privacy links + purchase tracks + friendly errors.
- `app/legal.tsx` — accurate privacy + AI + withdrawal + UGC sections.
- `app/ort-vorschlagen.tsx` — prefill params + share entry + draft banner.
- `app/_layout.tsx` — RecentProvider, initAnalytics, reset-password/share-import routes.
- `src/components/{Pill,BottomNav,Button,SearchField,CityDropdown,SceneToggle}.tsx` — font caps.
- `assets/{icon,adaptive-icon,icon-gold,icon-inverse}.png` — glyph re-centered.
- `store/app-store-listing.txt` — age 12+ → 16+.
- `CLAUDE.md` — consolidated changelog.

---

## 4. Changes made (commit trail on this branch)

1. App-Icon glyph re-centered + safer alternate-icon switching.
2. Dark-mode `line` token; all `border-black/x` + inline rgba borders → `border-line/x`.
3. Typo/accent-tolerant search + "recently viewed" rail (+9 tests).
4. Dynamic Type: chrome capped at 1.3× (content still scales for a11y).
5. Friendly error/offline states (auth + save) + catalog `status` + feed offline hint (+6 tests).
6. Feed loading skeletons.
7. Consent-aware analytics + crash reporting + migration 0008 (+4 tests).
8. Legal overhaul: accurate privacy, AI transparency, withdrawal, UGC + paywall links.
9. 16+ age gate (GDPR Art. 8) + store-listing bump.
10. Full account-deletion cascade (migration 0009).
11. Password-reset / email deep-link handler + `app/reset-password.tsx`.
12. TikTok/Instagram share-import mockup (+5 tests).
13. CI workflow + tests grown 18 → 46; cityLabel + PIN_COLORS coverage.
14. CLAUDE.md consolidated changelog + handoff.md.
15. **Fix: "Couldn't find a navigation context" crash** (regression from item 11).
    `router.push` was called from `AuthProvider` (above the navigator) in
    `onAuthStateChange`; on launch (persisted `PASSWORD_RECOVERY` session) it fired
    before the navigator mounted → crash that took down `ThemedApp` / dark mode.
    Fix: provider now only sets a `passwordRecovery` flag; a `PasswordRecoveryWatcher`
    under the navigator navigates once `useRootNavigationState().key` is set.

---

## 5. Failed attempts / dead ends (so the next agent doesn't repeat them)

- **Global font-scale cap via `Text.defaultProps`** — dead in React 19
  (defaultProps removed for function components). **Patching `Text.render`** also
  fails: RN 0.81's `Text` is a plain function component (new ref-as-prop syntax,
  no `.render`), exported via a **getter with no setter**, so there's no
  reassignable export and no global hook. → Fell back to per-primitive
  `maxFontSizeMultiplier` on the fixed chrome only (content stays scalable).
- **Testing analytics by importing `analytics.ts` in vitest** — fails because it
  imports `supabase` (pulls RN deps into Node). → Extracted the pure helpers into
  `analyticsCore.ts` and test those.
- **`supabase...insert().then().catch()`** — tsc error: the Postgrest builder's
  `.then()` returns `PromiseLike` (no `.catch`). → Wrapped in an async IIFE with
  try/catch instead.
- **Share parser city match** — `muenchen` (ue-spelling) didn't match `munchen`;
  added transliterated aliases (`muenchen`/`zuerich`/`duesseldorf`).
- **Loading skeletons rarely visible** — the catalog seeds mock data
  synchronously, so the feed is almost never truly empty on load. The skeleton is
  wired into the empty+loading state as the correct pattern / safety net, but note
  it won't usually show unless mock seeding is removed.
- **Navigating from a provider above `<Stack>`** — calling `router.push` from
  `AuthProvider`'s `onAuthStateChange` throws "Couldn't find a navigation context"
  (providers render above the expo-router navigator; the call can fire before it
  mounts). **Rule:** never call `router.*` above `<Stack>`. Navigate from a
  component under the navigator, gated on `useRootNavigationState().key`.

---

## 6. Next step

**Setup (no code — required before these features are truly live):**
1. Run Supabase migrations **`0008_analytics.sql`** and **`0009_delete_cascade.sql`**
   in the SQL editor.
2. Supabase → Authentication → URL Configuration: allow-list
   **`verso://auth-callback`** (so the password-reset/email deep link works).
   Test the reset flow end-to-end with the real email templates — the handler is
   built but **untested against live email** (can't be verified in-sandbox).
3. Enable Google/Apple OAuth providers (still a launch blocker).
4. Dev Build (`npx expo run:ios`) to verify real app-icon switching and to add a
   native **Share Extension** target for the TikTok/Instagram "Share to Verso"
   entry (the extension just opens `verso://share-import?text=…`).

**Legal (P0 — needs a lawyer, not code):** publish binding **Impressum, privacy
policy, ToS** and sign **DPAs** (Supabase, RevenueCat, Apple, Google); verify the
**Supabase data region** (EU vs. international transfer). The in-app `legal.tsx`
is now honest placeholder scaffolding pointing to `verso.app/*`.

**Product polish (P1–P2):** real spot images (`image_url` unused today), more
spots/cities, Insider-only "hidden" spots (RLS example is commented in
`0007_insider_status.sql`), a server push sender (tokens are stored but nothing
sends), and — when ready — swap the mock `parseSharedPost` for a real AI step
(same signature; the UI already labels it as assisted for EU AI-Act compliance)
and drop Sentry into `registerSink()` in a Dev Build.
