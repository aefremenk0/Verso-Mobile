# Handoff — Verso Mobile

_Branch: `claude/charming-sagan-jyk0wh` · Last update: 2026-07-04 (dark-mode crash fix + dark-mode readability polish)_

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
- Latest pushed commit: `0c37602` on `claude/charming-sagan-jyk0wh`.
- CLAUDE.md changelog updated (through the 2026-07-04 dark-mode polish entry).

**Post-session work:** (a) a "Couldn't find a navigation context" crash that took
down dark mode / launch was fixed across three commits (see §4 items 15–17 and
§5); (b) a large dark-mode readability pass followed (§4 item 18).

**Note on why dark mode shows on pre-login screens:** `isDark = isInsider && pref==="dark"`,
and `isInsider` comes from RevenueCat (device-level), so it persists after a
Supabase logout. That's why Welcome/Register render in dark mode and needed fixing.

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
15. **Fix (attempt 1): "Couldn't find a navigation context" crash** (regression
    from item 11). `router.push` was called from `AuthProvider` (above the
    navigator) in `onAuthStateChange`; on launch (persisted `PASSWORD_RECOVERY`
    session) it fired before the navigator mounted. Moved to a flag +
    `PasswordRecoveryWatcher` — but the watcher used `useRootNavigationState()`,
    which itself throws above the navigator (see §5). Incomplete.
16. **Fix (attempt 2):** watcher rewritten to use `useNavigationContainerRef()`
    (safe, ref only) + imperative `router`, gated on `navRef.isReady()` (poll).
17. **Fix (root cause):** the crash actually fired on every theme *toggle*.
    `ThemedApp` set `style={isDark ? vars(DARK_VARS) : undefined}` — toggling the
    style between `undefined` and a `vars()` object made NativeWind restructure
    the View wrapping `<Stack>`, briefly tearing the navigator down. Fixed by
    adding `LIGHT_VARS` and ALWAYS passing `vars(isDark ? DARK_VARS : LIGHT_VARS)`.
18. **Dark-mode readability polish** (many small commits): app-wide `text-screen`
    → `text-white` (theme token flipped invisible on fixed dark stages); fixed
    dark text on all yellow/white surfaces (Merken button, chips, LanguageToggle);
    brown buttons → yellow+black in dark (Welcome CTA, filter CTA, invite card);
    Welcome hero text white + yellow city-chip outlines; Google button stays white
    / Apple text white; hotbar inactive pills → white ovals; Apple Maps night view;
    Pill `lineHeight` fix so emoji chips match the icon-less "All" chip height.

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
- **Navigating from above `<Stack>`** — two-part bug, worth remembering exactly:
  1. `router.push` in `AuthProvider`'s `onAuthStateChange` threw "Couldn't find a
     navigation context" (imperative `router.push` → `assertIsReady()` throws when
     the navigator hasn't mounted; providers render above it and this fires on
     launch with a persisted `PASSWORD_RECOVERY` session).
  2. First attempted fix used a `PasswordRecoveryWatcher` with
     **`useRootNavigationState()`** — WRONG: it internally calls
     `@react-navigation`'s `useNavigation()`, which throws the SAME error on every
     render above the navigator → crashed unconditionally on every launch.
  - **Final rule:** above `<Stack>`, use ONLY `useNavigationContainerRef()` (just
    returns the ref, never throws) + the imperative `router`, gated on
    `navRef.isReady()`. NEVER `useNavigation`/`useRouter`/`useRootNavigationState`
    there. (Fix commit `79cbab2`.)
  3. **Actual root cause of the recurring crash** (commit `642ef21`): it fired on
     every theme *toggle*, not just launch. `ThemedApp` toggled its `vars()` style
     between `undefined` (light) and an object (dark). That presence change makes
     NativeWind restructure the View wrapping `<Stack>` → the navigator remounts →
     a queued navigation reads missing context. **Rule:** a `vars()` style on a
     View above the navigator must ALWAYS be an object (light AND dark vars), never
     toggled to `undefined`.
- **Dark-mode theming on fixed stages** — `text-screen`/`text-ink`/`bg-night` are
  a trap in dark mode:
  - `text-screen` (theme token) was used everywhere as "light text on a dark
    stage" but it FLIPS to dark in dark mode → invisible. Use `text-white` on
    fixed-dark surfaces.
  - `text-ink` flips to near-white in dark mode → invisible on any yellow/white
    surface (chips, buttons). Use a fixed `#1A1A1A` on those.
  - `bg-night` (brown) blends into the dark page; where a button must pop, switch
    it to `bg-accent` + black text in dark mode (gate on `useAppearance().isDark`).
  - Emoji in a `<Text>` inflates its height vs. Latin-only text → set an explicit
    `lineHeight` when chips must be uniform height.

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
