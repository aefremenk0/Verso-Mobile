# Handoff — Verso Mobile

_Branch: `claude/charming-sagan-jyk0wh` · Last update: 2026-07-08 (Google + Apple OAuth configured; prior: Sentry, password UI, mock cleanup, push sender, spot-images bucket, insider-only spots, backend-driven cities)_

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

**Done, committed, and pushed.** All planned work + several follow-ups.

- `npx tsc --noEmit` → clean.
- `npm test` → **48/48 vitest passing** (was 18 at session start).
- `npx expo export --platform ios` → bundle builds.
- Latest pushed commit: `7cee198` on `claude/charming-sagan-jyk0wh`.
- CLAUDE.md changelog current through the 2026-07-07 UI-fixes entry.
- `npm test` → **55/55** (added password-policy + initials + scrubProps tests).

**2026-07-07 block (on top of §4):** Sentry fetch-sink (inert until DSN); visible
password-policy checklist (`src/lib/password.ts` + `PasswordHints.tsx`) + fixed the
misleading "min 6 chars" error → real policy (8 + upper + lower + digit); removed
MOCK_USER (guest = empty profile) + the demo-login button + the `lena@verso.app`
placeholder; `send-push` edge function (Expo push to opted-in users, admin-secret);
deleted orphaned icon assets; migration `0017_spot_images` (public bucket for real
photos); dropped the generic "Sport" category pill (scene stays the umbrella);
fixed a phantom title gap (`adjustsFontSizeToFit`+`numberOfLines=2`); spot-detail
CTA is now one generic "Open website" button (no button without a URL).

**Later work (post the initial 10 tasks):** (a) a "Couldn't find a navigation
context" crash (dark mode / launch) fixed across three commits (§4 items 15–17,
§5); (b) a large dark-mode readability pass (§4 item 18); (c) a full security
review + fixes (§4 item 19); (d) the RevenueCat "logOut on anonymous" console
error (§4 item 20). **2026-07-06 block** (§4 items 21–27): donations removed;
dark mode un-gated (all users) + app-icon picker removed; a second deep security
review (Insider INSERT gap → migration 0012, webhook constant-time compare) + a
targeted SQL-injection review (clean); email-confirmation flow; per-account
"recently viewed"; rate-limiting + length caps; encrypted auth token. See §7.

**Note on dark mode:** as of 2026-07-06 it is available to **everyone**
(`isDark = pref==="dark"`, no Insider gate). The pre-login dark-mode readability
fixes (§4 item 18) still matter — Welcome/Register can render in dark mode.

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

New in the 2026-07-06 block:
- `src/lib/secureStore.ts` — LargeSecureStore (AES key in Keychain/Keystore,
  ciphertext in AsyncStorage) for the Supabase auth session; web → AsyncStorage.
- `supabase/migrations/0012_protect_insider_insert.sql` — insider trigger on
  INSERT+UPDATE (was UPDATE only).
- `supabase/migrations/0013_profile_from_metadata.sql` — copy name/username from
  sign-up metadata into profiles (email-confirmation flow).
- `supabase/migrations/0014_profiles_recent.sql` — `recent_spot_ids` column.
- `supabase/migrations/0015_length_caps.sql` — CHECK length caps (profiles /
  spot_suggestions / analytics_events props ≤4 KB).
- `supabase/migrations/0016_rate_limit.sql` — `rate_limits` table +
  `enforce_rate_limit()` + BEFORE INSERT triggers (analytics 120/min, suggestions
  10/h, keyed by hashed IP).
- `supabase/setup_all.sql` — regenerated to concat ALL migrations 0001–0016 + seed.

Modified in the 2026-07-06 block:
- `src/store/appearance.tsx` — dark mode for everyone (no Insider gate).
- `src/store/recent.tsx` — now `usePersistedList("recent_spot_ids")` (per-account).
- `src/lib/supabase.ts` — `auth.storage = authStorage` (encrypted).
- `src/store/auth.tsx` — `signUp` returns `needsConfirmation` + sends metadata/redirect.
- `src/lib/profile.ts` — `ProfileColumn` += `recent_spot_ids`.
- `app/register.tsx` — confirm-email state + name/username maxLength.
- `app/profil-bearbeiten.tsx`, `app/ort-vorschlagen.tsx` — input maxLength.
- `app/settings.tsx`, `app/_layout.tsx` — app-icon row/route removed.
- `app/(tabs)/profil.tsx` — donation row + `badge` prop removed.
- `app.config.js`, `package.json` — `expo-alternate-app-icons` removed;
  `expo-secure-store`/`expo-crypto`/`aes-js` (+`@types/aes-js`) added; nativewind pinned.
- `supabase/functions/revenuecat-webhook/index.ts` — constant-time secret compare
  + require the `insider` entitlement explicitly.
- `supabase/migrations/0002`, `0009` — `search_path = ''` hardening.

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
19. **Security review + fixes** (commits `8f8046b`, `5e5d676`, `79f9eff`; migrations
    `0010`/`0011`; user ran queries 12/13 in the SQL editor):
    - 🔴 `is_insider` self-escalation (profiles UPDATE policy) → `protect_insider`
      trigger resets the column unless caller is service_role.
    - 🟠 RevenueCat webhook fail-open → fail-closed (`!secret || …`).
    - 🟠 `spot_suggestions`/`analytics_events` inserts bound to `auth.uid()`.
    - 🟢 `openExternal` scheme allowlist; `captureError` PII redaction
      (`redactText`, +2 tests); password minimum 6 → 8.
20. **RevenueCat "logOut on anonymous" console error** (`a6e09f4`) — `Purchases
    .logOut()` was called for anonymous RC users too; RC logs that loudly (before
    the throw, so try/catch didn't suppress the redbox). Guarded with
    `Purchases.isAnonymous()` in the identity effect and `reset()`.

**2026-07-06 block:**

21. **Donations removed** (`c9e9562`) — the "Support Verso / SPENDE" profile row +
    the `badge` prop were removed. Rationale: in-app donations aren't worth it
    (Apple's 30%, no nonprofit exemption, rejection risk) and dilute Insider.
    Support = Insider subscription only; a pure donation gesture belongs on the
    website, not in-app.
22. **Dark mode for everyone + app-icon picker removed** (`277be10`) —
    `appearance.tsx`: `isDark = pref==="dark"`, `canDark = true` (no Insider gate),
    settings ✦ badge + upsell gone. App-icon screen/helper deleted, route + settings
    row removed, `expo-alternate-app-icons` dropped from config + package.json.
23. **Security review 2 (deep) + fixes** (`cec3d27`) — 4 parallel auditors
    (backend/RLS, client auth/secrets, deep-links/PII, deps). One real MEDIUM:
    `protect_insider` trigger was UPDATE-only, so a crafted INSERT of the own
    profile row could set `is_insider=true` → **migration 0012** extends it to
    `BEFORE INSERT OR UPDATE`. Webhook: constant-time secret compare + require the
    `insider` entitlement explicitly. `nativewind` pinned exact.
24. **SQL-injection review — clean** (`de049e5`) — search is 100% client-side
    (`matchesQuery` over loaded arrays; nothing user-typed reaches PostgREST), no
    `.or()`/`.filter(string)`/`.textSearch()`, all `.eq()` parameterized,
    `rpc("delete_user")` arg-less. Fix: `setup_all.sql` was stale (only 0001–0003)
    → regenerated with all migrations; `search_path=''` on 0002/0009.
25. **Email-confirmation flow** (`f2d2f65`) — `signUp` returns `needsConfirmation`
    (no session ⇒ confirmation on) + sends `emailRedirectTo` and name/username as
    metadata; `register.tsx` shows a "confirm your email" state instead of entering.
    **Migration 0013** copies name/username from metadata into profiles so the name
    survives the confirmation gap.
26. **"Recently viewed" per account** (`2ca0c65`) — `recent.tsx` now uses
    `usePersistedList("recent_spot_ids")` → follows the account, empty for a new
    one, clears on logout. **Migration 0014** adds the column.
27. **Rate-limiting + length caps + encrypted auth token** (`624669f`, `2e3cbdc`) —
    **Migration 0015** CHECK length caps (+ client maxLength); **migration 0016**
    hashed-IP fixed-window limiter (analytics 120/min, suggestions 10/h). Auth
    token now encrypted via LargeSecureStore (`src/lib/secureStore.ts`,
    `expo-secure-store`+`expo-crypto`+`aes-js`), web falls back to AsyncStorage;
    existing plaintext sessions require one re-login (fail-soft).

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

## 6. DB migration status (Supabase, run by the user)

**All migrations run in the live DB** (confirmed via the user's saved-query list,
2026-07-07). ⚠️ The user's Supabase SQL-editor query NAMES are OFFSET from the repo
migration filenames — they use 2-digit names plus three EXTRA queries (`04_seed`,
`07b_spot_suggestions`, `11_delete_user_fix`), which shifts everything from ~05
onward by +1. **Do NOT assume `NN_name` in Supabase == `00NN_name` in the repo.**
Mapping (Supabase query → repo file):

| Supabase query (their name) | Repo migration file |
|---|---|
| 01_init | 0001_init |
| 02_profiles_trigger | 0002_profiles_trigger |
| 03_geheimtipp | 0003_profiles_geheimtipp |
| 04_seed | seed.sql |
| 05_notify | 0004_profiles_notify |
| 06_avatars | 0005_avatars |
| 07_suggestions_delete | 0006_suggestions_and_delete |
| 07b_spot_suggestions | standalone fix (spot_suggestions table, part of 0006) |
| 08_insider_status | 0007_insider_status |
| 09_analytics | 0008_analytics |
| 10_delete_cascade | 0009_delete_cascade |
| 11_delete_user_fix | delete_user best-effort hotfix (folded into 0009) |
| 12_protect_insider | 0010_protect_insider |
| 13_harden_inserts | 0011_harden_inserts |
| 14_profile_from_metadata | 0013_profile_from_metadata |
| 15_profiles_recent | 0014_profiles_recent |
| 16_length_caps | 0015_length_caps |
| 17_rate_limit | 0016_rate_limit |
| 12b_protect_insider_insert | 0012_protect_insider_insert |
| 18_spot_images | 0017_spot_images |
| 19_insider_spots | 0018_insider_spots |
| Untitled query | unknown / scratch |

⏳ **`0019_cities` NOT confirmed run yet** (would be their query `20_cities`): table
`cities(name, is_live, sort_order)` + public read; seed all 7 cities, only München
live. App: `CatalogProvider` loads live cities fail-soft, exposes
`liveCities`/`isComingSoon` (fallback to code `LIVE_CITIES`). Flip a city:
`update cities set is_live=true where name='Wien'` (needs content first). Until the
table exists, the code fallback keeps München-only — nothing breaks.

✅ **`0018_insider_spots` is live** (their query `19_insider_spots`, 2026-07-07):
`spots.insider_only` + RLS gate on `profiles.is_insider`. Caveat: nothing is hidden
until a spot is flagged `insider_only=true` AND the reader's `profiles.is_insider`
is true — which only the RevenueCat webhook sets (Test Store + no webhook secret →
no live insiders). To TEST: `update profiles set is_insider=true where id=auth.uid()`
and flag a spot. App has NO `insider_only` in its Spot type yet (RLS filters
server-side; add it only for an in-app "Insider" badge).

✅ **Insider-INSERT gap closed:** the user ran `12b_protect_insider_insert` (repo
`0012`) on 2026-07-07 — the live `protect_insider` trigger is now `BEFORE INSERT OR
UPDATE`. Only remaining optional hardening: re-run `0009_delete_cascade` for
`search_path=''` (not exploitable; nice-to-have).

`supabase/setup_all.sql` is regenerated to contain ALL migrations 0001–0017 + seed
(use it OR the numbered files for a fresh DB — never the old truncated version).
Spot content is imported separately from the Google Sheet via a non-numbered
`import_spots_muenchen` query (data, not schema).

**`0017_spot_images` is live** (their Supabase query `18_spot_images`): public
`spot-images` bucket, public read, no client write policy (admin/dashboard only).
Images to be keyed `<spot-id>.jpg`. Code side (image_url column + rendering) NOT
built yet — see §7.

**Content pipeline (Munich, 80 spots in a Google Sheet):** the user maintains a
Google Sheet (ID `1odDNP-mkjI3Y6zWfgQRpFOYNIFOroEqZ_R8YuvqtVyA`) and preps columns
via claude.ai prompts (id → `muc-<slug>`, category → app keys, tone → brown/green/
charcoal placeholder color, `de` jsonb from the DE columns). Then a Cowork/import
step upserts them into `spots` (+ creates missing `neighborhoods`). Sheet `tone`
(mood word) ≠ app `tone` (card color) — do NOT map 1:1. Sheet `hours` is free text →
leave DB `hours` null (category defaults). Sheet `reserve_url`/`ticket_url` empty →
most spots show no yellow CTA (by design now).

**Neighborhoods — CRITICAL matching rule + consolidation (in progress):** the app
groups spots by `s.neighborhood === neighborhoods.name` (EXACT string match). So
the `neighborhoods` table must contain EXACTLY the set of names the spots use — a
name with no spots shows an empty Viertel; a spot whose name isn't in the table
disappears. The user's hand-entered Munich neighborhoods had fragmented/duplicate
names (slash-combos like `Laim/Sendling-Westpark`, `Lehel/Maxvorstadt`, two
Isarvorstadt/Glockenbach variants). **Decision:** consolidate to ONE canonical,
colloquial name per real area (Verso's friend-tone > administrative Stadtbezirke),
e.g. merge `Schwabing-West`+`Schwabing-Freimann` → **`Schwabing`**; prefer
`Glockenbachviertel`, `Giesing`, `Neuhausen`. The neighborhoods should be DERIVED
from the (normalized) spot `neighborhood` values so they always match. Also: the
user swapped blurb columns correctly (English → `blurb`, German → `blurb_de`).
Verso-tone EN blurbs already written for Altstadt, Au-Haidhausen, Bogenhausen,
Laim, Lehel, Maxvorstadt, Neuhausen-Nymphenburg, Obergiesing-Fasangarten,
Sendling-Westpark, Schwabing, Gärtnerplatzviertel, Ludwigsvorstadt-Isarvorstadt
(Glockenbach). Import converter (to derive neighborhoods + validate matches) still
pending the CSV.

## 7. Known open items & pending decisions

- **✅ RESOLVED — "Recently viewed" is now per-account** (`recent.tsx` →
  `usePersistedList("recent_spot_ids")`, migration 0014). New account starts empty,
  clears on logout. Requires migration 0014 in the live DB (else falls back empty).
- **✅ RESOLVED — Auth token encrypted** (`src/lib/secureStore.ts`, LargeSecureStore).
  Client-only, no DB. Existing users re-login once. `npm install` needed after pull
  (3 new deps).
- **✅ CODE DONE — Email confirmation** — the app now handles the no-session-yet
  case (`needsConfirmation`) + metadata trigger 0013. Still needs the **Supabase
  dashboard toggle ON** + redirect URL + migration 0013, and is **untested against
  live email**. Demo login only works if the demo account is already confirmed.
- **RevenueCat is Test-Store only** — `revenueCatIosKey` is a `test_…` key. The
  paywall/purchase flow works in a dev build against RC's sandbox, but there are
  **no real purchases**. Production needs: App Store Connect subscription products,
  a production `appl_…` key, the `insider` entitlement mapped to the products, the
  Paid Applications Agreement, and (recommended) deploying the webhook with its
  secret. **Webhook is deployed** (constant-time compare, entitlement-explicit) but
  `REVENUECAT_WEBHOOK_SECRET` is **not set yet** → it fail-closes (401) until set.
- **No spot photos** — the `Spot` type / `spots` table have `image_note` + `tone`
  (placeholder), but **no `image_url`**. Adding real photos needs a column + type
  field + `rowToSpot` mapping + rendering (SpotCard/detail) + a Storage bucket or
  external URLs. (Earlier notes wrongly said `image_url` existed — it does not.)

## 8. Next step (setup / launch)

**Setup (no code) — status 2026-07-08:**
1. ✅ **Migrations 0012–0018 run** (their queries `12b`/`14`–`19`). ⏳ **0019_cities
   NOT run yet** (would be `20_cities`) — until then the app falls back to
   München-only via the code constant.
2. ⏳ Supabase → URL Configuration: `verso://auth-callback` is allow-listed (✅).
   **Email confirmation** — turn ON for prod + consider an SMTP provider (built-in
   mailer is low-limit). Password policy is set (8 + upper + lower + digit; the app
   mirrors it, see 2026-07-07 changelog).
3. ✅ **Google + Apple OAuth both configured** (2026-07-08). Apple: Services ID
   `app.verso.signin`, Team ID `YMH7N2555V`, Key ID `TTV37D9YU4`; Supabase Apple
   provider enabled with the generated client-secret JWT. **⚠️ Apple client secret
   expires ~Jan 2027 (Apple max 6 months)** — regenerate via the local
   `gen-apple-secret.js` (uses the `.p8`) and update Supabase. Google: Web OAuth
   client, redirect = the Supabase `/auth/v1/callback`. Test both in a **dev build**
   (`npx expo run:ios`), not Expo Go.
4. RevenueCat → App Store Connect production setup (see §7) + set
   `REVENUECAT_WEBHOOK_SECRET`.

**Legal (P0 — lawyer):** binding **Impressum, privacy policy, ToS**; **DPAs**
(Supabase/RevenueCat/Apple/Google); verify **Supabase data region**. `legal.tsx`
is honest placeholder scaffolding pointing to `verso.app/*`. The **verso.app site
with privacy/imprint/support URLs is the single biggest launch blocker** (Apple).

**Product (code — the next agent can do):** real spot images (add `image_url` +
`rowToSpot` mapping + SpotCard/detail rendering + a Storage bucket) — this is the
most valuable remaining code task; Insider-only "hidden" spots (RLS example
commented in `0007_insider_status.sql`), server push sender (tokens stored,
nothing sends), swap mock `parseSharedPost` for real AI (same signature; UI
already labels it as assisted), drop Sentry into `registerSink()`.
