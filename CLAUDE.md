# CLAUDE.md — Verso Mobile

> **Diese Datei wird von Claude Code beim Projektstart automatisch gelesen.**
> Sie ist das Langzeitgedächtnis des Projekts: Architektur, Konventionen,
> Stolperfallen und der Changelog.
>
> **ARBEITSWEISE — WICHTIG:** Bei **jedem** Commit auch diese Datei
> aktualisieren:
> 1. Neuen Eintrag oben im Abschnitt **Changelog** ergänzen (Commit-Kurz-Hash
>    nachtragen, sobald committet).
> 2. Falls sich etwas Strukturelles ändert (neuer Screen, neue Lib, neue
>    Konvention, neue Stolperfalle), die entsprechenden Abschnitte oben
>    nachziehen — nicht nur den Changelog.
> 3. „Aktueller Stand" und „Nächste Schritte" aktuell halten.

---

## Was ist Verso?

Kuratierte **mobile Discovery-App** (Expo / React Native) für besondere,
weniger bekannte Orte in europäischen Städten — Restaurants, Bars, Clubs,
Cafés, Events. Ton: *Geheimtipp von einem gut vernetzten Freund*, redaktionell,
kein Branchenverzeichnis. Signalfarbe Gelb (`#FFE500`), Schrift Hanken Grotesk,
weiche Formen.

**Maßgebliches Design:** `design/Verso_Mobile_v2.dc.html` — exakte Werte
(Größen, Abstände, Farben, Wording) immer von dort übernehmen, nicht raten.
(`design/support.js` ist nur das Runtime des Mockups, irrelevant für die App.)
Weitere Design-Referenzen im `design/`-Ordner: `Verso_Mobile.dc.html` (frühere
v1-Variante) und **`Verso_App_Icon.dc.html`** — das **App-Icon** (kursives „v."
in drei Farbvarianten: Gelb/Schwarz, Schwarz/Gelb, Weiß/Schwarz; **Gelb/Schwarz
`#FFE500` auf `#1A1A1A`** = Homescreen-Favorit, Schrift DM Serif Display italic,
Radius ~22 % der Kantenlänge). Vorlage fürs spätere 1024er-App-Icon (iOS).

Der Nutzer hat **wenig App-Erfahrung** → Code aufgeräumt und **auf Englisch
kommentiert** halten (Konvention seit der i18n-Umstellung), Entscheidungen kurz
erklären. Sichtbare Texte immer zweisprachig (EN/DE) über `t("EN","DE")`.

---

## Tech-Stack & exakte Versionen

Expo **SDK 54**. Diese Versionen sind bewusst gepinnt — siehe Stolperfallen.

| Paket | Version | Hinweis |
|---|---|---|
| expo | ^54.0.0 | |
| react | **19.1.0** (exakt) | muss zur RN-Renderer-Version passen |
| react-dom | **19.1.0** (exakt) | |
| react-native | **0.81.5** (exakt) | |
| expo-router | ~6.0.0 | file-based Routing |
| nativewind | **4.1.23** (NICHT 4.2.x) | Tailwind für RN |
| tailwindcss | ^3.4.x (dev) | |
| react-native-reanimated | **4.1.1** (exakt) | für ALLE Animationen |
| react-native-worklets | **0.5.1** (exakt) | von Reanimated 4 benötigt |
| react-native-gesture-handler | ~2.28.0 | Swipe-Zeilen (Gespeichert), Expo-Go-ok |
| react-native-svg | **15.12.1** (exakt) | Logos/Vektorgrafik, in Expo Go |
| react-native-maps | 1.20.1 | echte Karte: Apple Maps (iOS)/Google (Android), `mapPadding`, **NUR Dev Build** |
| react-native-purchases | **10.4.0** (exakt) | RevenueCat (Insider-Abo), natives Modul, **NUR Dev Build** |
| @supabase/supabase-js | 2.x | Backend/Auth/DB (Expo-Go-fest) |
| @react-native-async-storage/async-storage | 2.2.0 | Session + Offline-Cache |
| expo-web-browser | ~15.0.x | OAuth-Browserflow (Google/Apple), Expo-Go-fest |
| expo-notifications | ~0.32.17 | Push + lokale Benachrichtigungen |
| expo-device | ~8.0.10 | echtes Gerät? (Push-Token) |
| expo-image-picker | ~17.0.11 | Avatar wählen |
| base64-arraybuffer | ^1.0.2 | Avatar-Upload (base64→ArrayBuffer) |
| expo-alternate-app-icons | ^8.0.0 | iOS Alternate Icons (Insider), **NUR Dev Build** |
| @expo-google-fonts/hanken-grotesk | ^0.4.x | |
| expo-localization | ~17.0.9 | Gerätesprache (i18n-Default) |
| expo-image, expo-font, expo-splash-screen | SDK-54-Stände | |

---

## Stolperfallen (NICHT erneut hineinlaufen)

1. **`npx expo install` schlägt fehl** — die Expo-API zum Auflösen der
   Versionen ist in der Remote-Umgebung netzwerk-gesperrt
   ("Host not in allowlist"). → Pakete mit gepinnten Versionen direkt über
   `npm install paket@version` installieren. Die SDK-54-Stände stehen in
   `node_modules/expo/.../bundledNativeModules.json`.
2. **NativeWind 4.2.x kaputt auf SDK 54** — zieht zu neue css-interop +
   Reanimated 4.4 nach, was eine zweite `react-native@0.86`-Kopie verschachtelt.
   Folge: `className`-Typen greifen nicht + Laufzeitabsturz in Expo Go.
   → **NativeWind auf 4.1.23 pinnen.**
3. **React-Versions-Konflikt** — ein `^` ließ `react` auf 19.2.x springen,
   inkompatibel mit dem in RN gebündelten Renderer ("Incompatible React
   versions"). → react/react-dom/react-native **exakt** pinnen.
4. **Reanimated 4 braucht das Worklets-Babel-Plugin** —
   `react-native-worklets/plugin` muss das **letzte** Plugin in
   `babel.config.js` sein. Reanimated/Worklets-JS-Version muss exakt zur in
   Expo Go gebündelten passen.
5. **`className`-Typen** — kommen aus `nativewind-env.d.ts`
   (`/// <reference types="nativewind/types" />`). Nur EINE react-native-Kopie
   im Baum, sonst greift die Augmentation nicht (`npm ls react-native` prüfen).
6. **`react-native-maps` läuft NICHT in Expo Go.** `src/components/CityMap.tsx`
   lädt es per `require` nur außerhalb Expo Go (`Constants.executionEnvironment`)
   — sonst stilisierte Fallback-Karte. Echte Karte nur im **Dev Build**:
   **Apple Maps (iOS, `PROVIDER_DEFAULT`) braucht KEINEN Token**; Android (Google)
   braucht einen Google-Maps-API-Key (`android.config.googleMaps.apiKey`).
   **`mapPadding`** rückt die nativen Controls (Positions-Button oben,
   Apple-Logo unten) ein, während die Karte full-bleed bleibt — genau dafür der
   Lib-Wechsel weg von expo-maps (das hatte kein Inset-API). Marker via
   `<Marker pinColor>`; eigene Marker-Views wären möglich (Roadmap: Gelb-Ovale).
   Die animierten Gelb-Oval-Pins + Doppeltipp-Egg gibt es weiter nur auf der
   Fallback-Karte.
7. **Config liegt in `app.config.js`** (nicht `app.json`); iOS-Location-Permission
   (`NSLocationWhenInUseUsageDescription`) für `showsUserLocation`.
8. **`react-native-gesture-handler`** braucht zwingend `import
   "react-native-gesture-handler"` als ERSTE Zeile in `app/_layout.tsx` und einen
   `<GestureHandlerRootView style={{flex:1}}>` ganz außen — sonst reagieren die
   Swipe-Zeilen (Gespeichert) nicht. Läuft in Expo Go.

---

## Architektur

```
app/                      Screens (Expo Router – Dateiname = Route)
  _layout.tsx             Root: Fonts laden, Provider, Stack-Navigation
  index.tsx               01 Welcome
  register.tsx            01 Registrierung (nur UI -> Feed)
  (tabs)/
    _layout.tsx           Tabs mit custom <BottomNav/>
    feed.tsx              02 Discovery-Feed (Stadt-Dropdown + Kategorie-Filter)
    viertel.tsx           05 Stadt-Übersicht
    karte.tsx             04 Kartenansicht (Apple Maps via react-native-maps im
                          Dev Build; stilisierte Fallback-Karte in Expo Go)
    profil.tsx            07 Profil
  spot/[id].tsx           03 Spot- UND Event-Detail (eine Route)
  bezirk/[name].tsx       Bezirks-Detail (Spots eines Viertels)
  gespeichert.tsx         06 Gespeichert (Suche + Filter wie im Feed)
  geheimtipp.tsx          08 Geheimtipp (Laden -> Reveal, Reanimated, modal)
  insider.tsx             „Verso Insider"-Hinweis (Feature kommt noch, modal)
  settings.tsx            07 Einstellungen (+ Sprach-Toggle, Abmelden)
  legal.tsx               Rechtliches & Hilfe (Mock-Text, zweisprachig)
  ort-vorschlagen.tsx     Ort zum Review einreichen (Mock-Formular, modal;
                          „+"-FAB auf der Karte)
  profil-bearbeiten.tsx   07c Profil bearbeiten (UI)
  passwort-aendern.tsx    07d Passwort ändern (UI)

src/
  components/             Brand, Arrow (breiter SVG-Pfeil), ImagePlaceholder,
                          StripeTexture, HookHighlight,
                          Pill, Button, SpotCard, BottomNav, InitialsAvatar,
                          AnimatedChip (Auswahl: Crossfade+Pop+Press),
                          (Initialen-Kreis),
                          CityDropdown (Stadt-Kopf; right-Prop für rechtes
                          Element; Stadtname immer volle Größe), Logos,
                          GeheimtippButton (pulsierende Squiggle-"?"),
                          MysticBadge ("???"-Badge, pulsierende Kontur),
                          QuestionBubbles (aufsteigende Bubbles, konfig. Glyph),
                          SpotActionMenu (Long-Press-Kreis-Menü: Merken/Teilen),
                          SceneToggle (Feiern/Essen oben rechts),
                          CityMap (react-native-maps: Apple/Google, full-bleed
                          + mapPadding; Expo-Go-Fallback),
                          MapFilterSheet (Filter-Panel; `showArt`-Prop —
                          im Feed aus, da Hotbar die Art macht),
                          SearchField (Such-Pille mit SVG-Lupe + Clear),
                          CategoryBar (transparente Kategorie-Pills; als
                          schwebende Overlay-Leiste in Feed + Karte),
                          FilterButton (Trichter-Button; öffnet MapFilterSheet,
                          gemeinsam von Feed + Karte),
                          KeyboardDoneBar („Fertig"-Leiste über iOS-Tastatur),
                          SurpriseButton („Überrasch mich"; Sparkle + Press-Bounce),
                          MiniMap (stilisierte Detail-Mini-Karte, SVG; Tap →
                          Verso-Karte-Tab, auf den Spot zentriert),
                          DiagonalStrike (diagonaler Durchstrich für „kommt
                          bald"-Städte),
                          VersoLoader (Marken-Lade-Screen: weißer Hintergrund,
                          kursives „verso" poppt durch Farb-/Schriftwechsel,
                          fadet zur braunen Welcome aus — in app/_layout.tsx),
                          LanguageToggle (Emoji-Sprach-Toggle EN 🇬🇧 / DE 🇩🇪 in
                          den Einstellungen; gelber Selector gleitet + Flaggen-Pop),
                          RangeSlider (Budget, PanResponder)
  lib/mapFilter.ts        Filter-Typ + matchesFilter (Art/Budget/Bewertung/Ambiente)
  lib/pinColors.ts        Karten-Pin-Farben pro Kategorie (oval/inner/dot)
  lib/spotMeta.ts         Detail-Tiefe: getOpenState (Öffnungsstatus) +
                          distanceLabel (Entfernung zum Stadtzentrum)
  lib/scene.ts            Szene (feiern/essen): Kategoriengruppen + Pills
                          (+ sceneFilters(scene, lang) — lokalisierte Pills)
  lib/lang.ts             i18n-Kern: Lang-Typ ("en"|"de"), cityLabel (Stadt-
                          Anzeigename pro Sprache), pick()  (RN-frei, testbar)
  lib/i18n.ts             useT() -> t("EN","DE"); useLang() -> aktuelle Sprache
  lib/responsive.ts       useScaleSize() — skaliert große Display-Schrift nach
                          Bildschirmbreite (clamp 0.84–1.12), für SE…Pro Max
  lib/localized.ts        Daten-Lokalisierung: spotText / neighborhoodBlurb /
                          geheimtippTeaser (EN-Basis, DE-Variante)  (RN-frei)
  lib/supabase.ts         Supabase-Client (URL/Key aus app.config extra);
                          `hasSupabase`-Flag. Noch nicht von Screens genutzt.
supabase/                 SQL: migrations/0001_init.sql (Schema+RLS), seed.sql
scripts/gen-seed.ts       erzeugt supabase/seed.sql aus src/data/* (via tsx)
  store/language.tsx      Sprach-Store (Default = Gerätesprache, sonst EN),
                          Settings-Toggle schaltet zur Laufzeit  (in-memory)
  store/scene.tsx         aktuelle Szene (Feiern vs. Essen), app-weit
  store/catalog.tsx       Katalog (spots + neighborhoods): startet mit dem Mock,
                          swappt bei konfiguriertem Supabase die DB-Zeilen ein
                          (Mock-Fallback). useCatalog() → spots/neighborhoods/
                          getSpotById/source. Screens lesen NUR hierüber.
  store/auth.tsx          Supabase Auth: session/user, signUp/signIn/signOut +
                          signInWithProvider (Google/Apple OAuth via Browser,
                          PKCE). Ohne Supabase = Gastmodus. Session persistent.
  store/profile.tsx       Nutzerprofil (name/username/bio) aus profiles;
                          useProfile().save() upsertet. Gast = Mock.
  lib/supabase.ts         Supabase-Client (hasSupabase-Flag; URL+Key aus extra;
                          AsyncStorage-Session, autoRefresh)

app.config.js             Expo-Config (ersetzt app.json; iOS-Location-Permission)
  data/                   types.ts, spots.ts (Mock-Orte — Pilot: nur München),
                          cities.ts (CITIES = alle; LIVE_CITIES/isComingSoon —
                          Pilot: nur München; NEIGHBORHOODS nur München),
                          categories.ts,
                          user.ts  (kein Backend; GEHEIMTIPP_BY_CITY nur München)
  store/                  city.tsx (in-memory), saved.tsx, geheimtipp.tsx,
                          interests.tsx (Onboarding-Vibes, max 3) — die drei
                          sind pro Nutzer PERSISTENT (Supabase profiles +
                          AsyncStorage via usePersistedList), Gast = Mock;
                          insider.tsx (Verso-Insider: RevenueCat-Entitlement
                          „insider" im Dev Build, sonst Mock-Vorschau; schaltet
                          Sport-/Live-Events-Szenen frei; purchase/restore)
  store/usePersistedList.ts  Hook: String-Liste ↔ AsyncStorage + profiles-Spalte
  store/notifications.tsx Push-Prefs (Geheimtipp/Spots/Events) pro Nutzer
                          (profiles.notify); Permission + Push-Token; lokale
                          Wochen-Erinnerung
  lib/notifications.ts    expo-notifications-Wrapper (Handler/Permission/Token/
                          lokale Schedule, Expo-Go-fest)
  lib/avatar.ts           Bild wählen + Upload in Supabase Storage (avatars-Bucket)
  lib/profile.ts          Persistenz-Helfer (loadLocal/saveLocal/fetch/patch,
                          fail-soft)
  lib/revenuecat.ts       RevenueCat-Wrapper (hasRevenueCat-Flag; Key aus extra;
                          require-Guard → Expo-Go-fest, nativ nur im Dev Build)
  lib/appIcon.ts          iOS Alternate Icons (setIcon/currentIcon, Expo-Go-fest)
  lib/suggestions.ts      „Ort vorschlagen" → spot_suggestions (fail-soft)
  lib/initials.ts         initialsFromName (Avatar-Initialen, RN-frei)
  lib/maps.ts             Deep-Links Apple/Google Maps
  store/appearance.tsx    Dark Mode (Insider-only): pref (AsyncStorage), isDark,
                          DARK_VARS; ThemedApp in _layout setzt vars() am Root
  theme.ts                Design-Tokens als JS (Fonts, Farben, Schatten)

tailwind.config.js        Zentrale Design-Tokens (Farben, Radien, Schriften)
design/                   Original-Mockup (Referenz, nicht Teil der App)
```

### Navigationsfluss
`index (Welcome)` → `register` → `(tabs)/feed`. Detail/Gespeichert/Settings sind
Stack-Screens darüber. `geheimtipp` ist ein modaler Screen. **Abmelden**
(in settings) setzt Stores zurück und `router.replace("/")`.

---

## Konventionen

- **Styling:** NativeWind-`className`. Design-Tokens zentral in
  `tailwind.config.js` (`bg-screen`, `bg-accent`, `text-ink`, `rounded-card`,
  `font-hk-extrabold-italic` usw.). Schatten als JS-Objekt aus
  `src/theme.ts` (RN-Schatten sind über className unzuverlässig).
- **Theme/Dark Mode:** die Flächen-/Text-Tokens `screen`/`surface`/`chip`/`ink`/
  `ink-2`/`ink-3` sind **theme-fähig** (`rgb(var(--c-*) / <alpha-value>)`,
  Light-Default in `global.css`, Dark via `vars(DARK_VARS)` am Root in
  `_layout.tsx`). Für neue Flächen/Texte **diese Tokens** nutzen, nicht Inline-Hex —
  sonst flippen sie im Dark Mode nicht. `accent`/`night` sind bewusst fix.
- **Schrift:** jeder Hanken-Schnitt ist eine eigene `font-hk-*`-Klasse
  (RN hat pro Gewicht eine Datei). Wortmarke = `font-hk-extrabold-italic`.
- **Animationen:** ausschließlich `react-native-reanimated`
  (`useSharedValue` + `withTiming`/`withRepeat`/`withSpring`). Niemals
  CSS-`@keyframes` aus dem Mockup übernehmen — nur als Referenz lesen
  (`verso-spin` 9s, `verso-load` 1.3s, `verso-throb` 1.5s, `verso-pulse`).
- **Daten:** Mock in `src/data/` als Fallback, aber **live über Supabase**
  (`CatalogProvider`/`useCatalog`). Screens lesen NUR über die Stores, nie direkt
  aus `src/data/*`. Login/Backend/Persistenz sind echt (Supabase).
- **Kommentare auf Englisch**, knapp, erklären *warum*.
- **App-UI zweisprachig (EN/DE)** seit 2026-06-30 — neue sichtbare Texte IMMER
  über `t("EN","DE")` (siehe Abschnitt „Mehrsprachigkeit (i18n)"); Daten-Texte
  über `localized.ts`. Eigennamen („München", Viertelnamen) bleiben deutsch.
- **Vor jedem Commit:** `npx tsc --noEmit` (Typecheck), `npm test` (vitest,
  reine Logik) und idealerweise
  `npx expo export --platform ios --output-dir /tmp/x` (Bundle baut?).

---

## Mehrsprachigkeit (i18n) — Englisch & Deutsch

Die App ist **zweisprachig** (Englisch = Default, Deutsch). Umschaltung im
**Account → Einstellungen → „Language/Sprache"** (toggelt sofort die ganze App).

- **Default = Gerätesprache** (`expo-localization` `getLocales()`): DE-Geräte
  starten auf Deutsch, sonst Englisch. Danach steuert der `language`-Store
  (`src/store/language.tsx`, in-memory) die Sprache; `LanguageProvider` liegt
  ganz außen in `app/_layout.tsx`.
- **UI-Strings:** Inline-Picker statt zentralem Dictionary —
  `const t = useT();` dann `t("English", "Deutsch")` (aus `src/lib/i18n.ts`).
  Beide Sprachen stehen direkt an der Stelle; Platzhalter (`${…}`) in beiden
  identisch halten. Für die Sprache selbst: `const lang = useLang();`.
- **Städtenamen:** der **kanonische `City`-Wert bleibt deutsch** („München" —
  damit Daten/IDs nie brechen). Angezeigt wird `cityLabel(city, lang)`
  (`src/lib/lang.ts`): EN → Munich/Vienna/Zurich/…, DE → München/Wien/Zürich/…
- **Daten-Inhalte (Orte/Viertel):** englische Basisfelder + **deutsche Variante**
  (`Spot.de`, `Neighborhood.blurbDe`, `GeheimtippDerWoche.teaserDe`). Im Render
  über `spotText(spot, lang)` / `neighborhoodBlurb(n, lang)` /
  `geheimtippTeaser(g, lang)` (`src/lib/localized.ts`).
- **Label-Listen sind sprach-bewusst:** `categoryLabel(c, lang)`,
  `categoryFilters(lang)`, `sceneFilters(scene, lang)` (categories.ts/scene.ts),
  `artOptions/ratingOptions/ambienteOptions(lang)` (mapFilter.ts),
  `getOpenState(spot, now, lang)` / `distanceLabel(spot, lang)` (spotMeta.ts).
  Die englischen Konstanten bleiben als Default bestehen (Tests RN-frei/grün).
- **Bewusst NICHT übersetzt:** Eigennamen (Viertelnamen, Adressen, „verso",
  „Hi Insider."), Code-Identifier/Routen, Daten-Keys.

---

## Geheimtipp-Mechanik (Kern-Feature)

Einmal pro Woche darf der Nutzer einen kuratierten Spot „abholen".
- **Pro Stadt ein eigener Wochentipp:** der gezeigte Spot richtet sich nach der
  aktuell gewählten Stadt (`GEHEIMTIPP_BY_CITY` in `src/data/user.ts`). Ein
  Münchner sieht den Münchner Tipp, nicht das Wiener Café.
- Status in `src/store/geheimtipp.tsx` (`abgeholt` **pro Stadt**, in-memory) —
  der Store liest die aktuelle Stadt via `useCity()` und hält `abgeholtByCity`.
- Solange nicht abgeholt: gelbe **„?"-Zelle** in der Bottom-Nav
  (`GeheimtippButton`). Wechselt man die Stadt, spiegelt die Zelle den
  Abhol-Status der neuen Stadt. Tippen → `geheimtipp`.
- **Lade-Screen** (dunkel): drehender Ring ums „?" + durchlaufender Balken,
  Auto-Reveal nach ~2,6 s, ruft `markAbgeholt()`.
- **Reveal** (gelb): Bild „pocht" (Throb) und ist antippbar → Spot-Detail.

---

## Easter Eggs 🥚 (bewusst gepflegt — wichtiger Teil der Marke!)

Verso belohnt **Neugier**: versteckte, verspielte Details verstärken den
Insider-/„Geheimtipp"-Ton. Easter Eggs sind hier **kein Beiwerk**, sondern
gewollte Markensignatur. **Regel: Jedes neue Easter Egg in dieser Sektion
dokumentieren** (Trigger · Ort · Datei) — und unten bei „Ideen" abhaken/ergänzen.

### Konventionen für Easter Eggs
- Animationen ausschließlich **Reanimated**, **Expo-Go-fest** (keine nativen
  Module ohne Not).
- **Wiederverwendbar** halten: `QuestionBubbles` (gelbe „?"-Bubbles) kann an
  beliebiger Stelle einen Schwung auslösen — `ref.burst(x, y)` mit Bildschirm-
  koordinaten.
- **Dezent & überraschend**, nie den normalen Flow stören (Overlays
  `pointerEvents="none"`).

### Eingebaut
- **„verso"-Bubbles (Welcome):** Tippt man im braunen Hero auf die
  „verso"-Wortmarke, steigen gelbe „?"-Bubbles von der Tipp-Stelle auf.
  → `src/components/QuestionBubbles.tsx` (jetzt mit Props `glyph`/`color`/
  `textColor`), eingebaut in `app/index.tsx`. Greift nur vor der Registrierung.
- **SpotCard-Long-Press → Pinterest-Kreis-Menü:** Eine Spot-Karte im Feed lange
  drücken öffnet ein aufploppendes Menü aus zwei Kreisen (`SpotActionMenu`):
  **„Merken"** (♥, merkt den Spot + Herz-Burst via `QuestionBubbles`) und
  **„Teilen"** (↗, systemeigenes `Share`-Sheet → iMessage/WhatsApp/…).
  → `SpotCard.tsx` + `src/components/SpotActionMenu.tsx`.
  - **Signalisierung (einmal pro Session):** auf der **ersten** Feed-Karte
    (`hintCandidate`) ploppt das Menü kurz auto-auf (Demo) + Hinweis-Chip **oben
    rechts auf der Karte** „Lange drücken: Merken & Teilen" (fadet aus). Flag
    `feedHintShown` (in-memory).
- **Karte-Doppeltipp → alle Pins ploppen (Toggle):** Doppeltipp auf die leere
  (Fallback-)Kartenfläche lässt **alle Pin-Labels gleichzeitig** aufploppen und
  BLEIBEN; ein weiterer Doppeltipp blendet sie wieder aus (`popAll`-Boolean →
  `flash` je Pin). → `CityMap.tsx` (Expo-Go-Fallback; auf der echten Mapbox-Karte
  bleibt der native Doppeltipp-Zoom).
  - **Signalisierung (einmal pro Session):** beim ersten Öffnen kurze
    Auto-Demo (alle Labels ploppen ~1,6 s auf) + Hinweis-Chip oben rechts
    „Doppeltippen zeigt alle Orte" (fadet aus). Flag `demoShown` (in-memory).

### Ideen / Roadmap (offen)
- **Logo-Tap-Combo (Bottom-Nav):** „?"-Squiggle mehrfach schnell tippen →
  Bubble-Burst über die ganze App (`QuestionBubbles` wiederverwenden).
- **Shake-to-Surprise:** Gerät schütteln → „Wir mischen die Karten neu" →
  zufälliger Spot („Überrasch mich"). (braucht `expo-sensors`, in Expo Go ok)
- **Stats-Tap (Profil):** mehrfach auf eine Stat-Zahl tippen → das „???"-Badge
  lüftet kurz ein verborgenes Wort.
- **„?" schon abgeholt:** Geheimtipp-„?" in der Nav nach dem Abholen antippen →
  verspielter Spruch „Schon abgeholt. Nächste Woche wieder."
- **Begrüßungs-Zyklus:** „Hi Insider."-Band auf Welcome antippen → wechselt
  durch verspielte Grüße.
- **Versteckter Spot:** ein geheimer Ort, der nur über eine bestimmte Geste oder
  Tipp-Sequenz auftaucht (passt perfekt zum „Geheimtipp"-Kern).

---

## Verso Insider — Premium-Features (geplant)

> Produkt-Richtung für die kostenpflichtige „Insider"-Stufe. Aktuell zeigt die
> App nur den mystischen „Demnächst"-Hinweis (`MysticBadge` → `app/insider.tsx`).
> „Insider lüftet den Vorhang" — Free bleibt großzügig (Wochentipp, Feed, Karte).

**1. Mehr vom Kern: Geheimtipps**
- **Unbegrenzte Geheimtipps** statt 1/Woche — Free bekommt den Wochentipp, Insider
  „kramt", so oft er will.
- **Geheimtipp auf Anfrage**: „Date am Freitag, Budget €€, intim" → kuratierter,
  auf den Anlass zugeschnittener Tipp.
- **Die verborgene Ebene** (passt zum „?"): Orte, die **nur Insider** auf Karte/
  Feed sehen — die wirklich geheimen Adressen.

**2. Türöffner (stärkster, markentreuester Hebel)**
- **Früher Event-Zugang**: Events sind bewusst klein („30 Klappstühle") — Insider
  sehen/reservieren **vor allen anderen**.
- **Priority-Reservierungen** bei schwer buchbaren Orten — „Sag, dass Verso dich
  schickt."
- **Exklusive Verso-Abende**: members-only Dinner/Sessions der Marke.

**3. Reise & Reichweite**
- **Neue Städte zuerst** freigeschaltet.
- **Offline-Insider-Guide** pro Stadt (unterwegs/im Ausland).
- **Export & Sync**: Google-Maps-Liste „?" (Mock schon angelegt,
  `GoogleExportSheet`), Kalender-Sync für Events.

---

## Monetarisierung (Produkt-Richtung)

> Übergeordnete Geld-Strategie, getrennt nach **B2C** (Nutzer) und **B2B**
> (Partner). **Leitplanke:** Geld von Orten darf die **Kuration nie
> verfälschen** — das Vertrauen („Geheimtipp eines Freundes, kein
> Branchenverzeichnis") ist das eigentliche Produkt. Werbung/gesponserte Pins
> im redaktionellen Feed sind bewusst **tabu**.

### B2C — Einnahmen vom Nutzer
- **Verso Insider als Kern** (Abo, ~5–8 €/Monat oder ~49 €/Jahr): bündelt die
  Premium-Features oben. **Türöffner > reine Feature-Paywall.**
- **Jahres-Abo mit echtem Gegenwert** (z. B. 1 Verso-Abend inklusive) → wirkt
  wie Club, nicht wie Schranke.
- **Geschenk-Mitgliedschaft** („Verschenk den Geheimtipp") — passt zum
  Easter-Egg-/Insider-Ton, gute virale Mechanik.
- **Stadt-Packs / Reise-Modus** als Einmalkauf für Nicht-Abonnenten (z. B.
  „Wien-Guide offline, 4,99 €") — günstiger Einstieg unter dem Abo.
- **Affiliate/Provision auf Buchungen** (OpenTable, Tickets) — nur leise und nur
  bei ohnehin empfohlenen Orten, sonst kippt der Ton.
- **Tabu:** Werbung im Feed, Pay-to-be-listed im normalen Feed.

### B2B — Einnahmen von Partnern
**Orte / Gastro**
- **Verifiziertes Orts-Profil** (Bezahl-Tool **ohne** Ranking-Einfluss):
  Öffnungszeiten/Events pflegen, direkt buchbar — Werkzeug, keine Werbung.
- **Event-Listing & Ticketing-Provision**: Orte stellen kleine Events ein, Verso
  nimmt Gebühr pro Ticket (passt zu „30 Klappstühle, Insider zuerst").
- **Reservierungs-Provision** an teilnehmende Häuser.
- **„Verso-Abende" als Veranstaltungsgeschäft**: Verso kuratiert, der Ort zahlt
  für Reichweite + volles Haus am schwachen Abend (Auslastungssteuerung).

**Marken / Partner**
- **Co-kuratierte Stadt-Guides / Kollaborationen** mit passenden Premium-Marken —
  als **eigener, klar gekennzeichneter** Inhalt, nie versteckt im Feed.
- **City-/Tourismus-Marketing**: Verbände zahlen für einen kuratierten
  „Hidden Gems"-Layer ihrer Stadt.

**Daten / Lizenz (später)**
- **Anonyme, aggregierte Trend-Insights** (datenschutzkonform) für
  Gastro/Tourismus.
- **White-Label / API**: Hotels & Concierge lizenzieren den Verso-Guide.

**Kurzfassung:** B2C primär über das **Insider-Abo mit Türöffner-Gegenwert**,
B2B über **Ticketing-Provision + kuratierte Verso-Abende** — beides so gebaut,
dass Kuration nie käuflich wirkt.

---

## Geplante Integrationen: RevenueCat + Supabase (noch NICHT verbunden)

> Richtungsentscheidung für den Weg vom Mock-MVP zum echten Backend. Aktuell ist
> **alles Mock/in-memory** (`src/data/*`, React-Context-Stores) — das soll später
> durch **Supabase** (Backend/Auth/DB) und **RevenueCat** (Abo/IAP für Insider)
> ersetzt werden. Beides ist **Expo-tauglich**, braucht aber (wie die Karte)
> einen **Dev/Release Build** (native Module → nicht in Expo Go).

### Supabase — Backend, Auth, Persistenz
- **Ersetzt die Mock-Daten:** `src/data/spots.ts` / `cities.ts` / `user.ts` →
  Tabellen `spots`, `neighborhoods`, `geheimtipp_by_city`, `profiles`. Die CSVs
  in `data-collection/` sind bereits im Spot-Schema → als Import-Vorlage nutzen.
- **Ersetzt „Auth ist nur UI":** `app/register.tsx` → echtes Supabase Auth
  (E-Mail/OTP, Apple/Google Sign-In). Danach `MOCK_USER` durch das echte Profil.
- **Ersetzt die in-memory Stores** (Persistenz-Falle im Backlog): `store/saved`,
  `store/geheimtipp`, `store/city`, `store/interests` schreiben/lesen dann aus
  Supabase (bzw. `AsyncStorage` als Offline-Cache). API hinter den bestehenden
  Store-Hooks kapseln, damit die Screens sich kaum ändern.
- **Bibliothek:** `@supabase/supabase-js` + `react-native-url-polyfill`; Keys über
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (in `app.config.js`
  bzw. EAS-Secrets, nicht ins Repo).
- **Wichtig:** die lokalisierten Datenfelder beibehalten (`Spot.de`, `blurbDe`,
  `teaserDe`) → als Spalten in der DB; `spotText`/`neighborhoodBlurb` bleiben.

### RevenueCat — Abo für „Verso Insider"
- **Ersetzt den Mock-Insider-Flag:** `src/store/insider.tsx` (`useInsider`,
  aktuell Default aus + Mock-Vorschau in `app/insider.tsx`) → RevenueCat-
  **Entitlement** („insider"). `isInsider = customerInfo.entitlements.active`.
- **Schaltet frei:** die Insider-Szenen (Sport, Live Events) im `SceneToggle`
  und die geplanten Premium-Features (unbegrenzte Geheimtipps, verborgene Ebene,
  Türöffner — siehe „Verso Insider"-Abschnitt).
- **`app/insider.tsx`** wird vom Mock-Upsell zur echten **Paywall**
  (RevenueCat-Angebote/Preise, „Kaufen"/„Wiederherstellen").
- **Bibliothek:** `react-native-purchases`; Produkte/Preise in App Store Connect
  (Abo-Gruppe) + RevenueCat-Dashboard; API-Key über Env/EAS-Secret. StoreKit-
  Käufe testen via **TestFlight-Sandbox**.
- **Leitplanke bleibt:** Kuration nie käuflich (siehe „Monetarisierung") — Geld
  nur über Insider-Abo/Türöffner, keine Feed-Werbung.

### Reihenfolge (Vorschlag)
1. **Supabase** zuerst (Daten + Auth + Persistenz) — größter Hebel, entschärft die
   ⚠️-Backlog-Punkte (Persistenz/Backend/Auth).
2. **RevenueCat** danach (baut auf echtem Auth/Profil auf; Insider-Flag → Abo).
3. Erst dann die restlichen Premium-Features hinter das Entitlement hängen.

---

## Aktueller Stand

**Pilot-Phase: nur München ist freigeschaltet** (`LIVE_CITIES` in `cities.ts`).
Alle anderen Städte erscheinen in Stadt-Hotbar **und** Welcome als „kommt bald":
gedimmt + **diagonal durchgestrichen** (`DiagonalStrike`), nicht auswählbar
(`pointerEvents="none"`). Mock-Daten der anderen Städte wurden **gelöscht**
(Spots, Viertel, Geheimtipps) — nur München bleibt. Default-Stadt = München.

**Phase 1 (MVP) — fertig**, läuft in Expo Go. Alle Screens (Welcome,
Registrierung, Feed, Spot-/Event-Detail, Stadt-Übersicht, Gespeichert, Profil,
Einstellungen, Geheimtipp) + Legal + Ort-vorschlagen + App-Icon-Picker.

**Backend + Premium sind verbunden** (Supabase LIVE bestätigt, RevenueCat verdrahtet):
- **Supabase = Backend/Auth/DB.** Katalog (spots/neighborhoods/geheimtipp) wird
  über `CatalogProvider` aus der DB geladen (Mock-Fallback). **Auth** echt:
  E-Mail+Passwort **und Google/Apple** (OAuth-Browserflow, PKCE) — Provider
  müssen noch in Supabase konfiguriert werden. **Session persistent** (AsyncStorage).
  **Persistenz:** `saved`/`interests`/`geheimtipp` + Profil (name/username/bio/
  avatar_url) + Notify-Prefs liegen pro Nutzer in `profiles`.
  Migrationen `0001`–`0006` (Schema/RLS, Trigger, geheimtipp, notify+push_token,
  avatars-Bucket, spot_suggestions+delete_user). Backend per `scripts/check-backend.sh`
  live geprüft (Katalog/Auth/Trigger/Persistenz/RLS grün).
- **RevenueCat = Insider-Abo.** `useInsider` spiegelt das Entitlement **`insider`**
  (Dev Build); `app/insider.tsx` = echte **Paywall** (Jahres-/Monatsplan, „Bester
  Wert" + Ersparnis, Trial, **Preise in EUR**). Expo Go / ohne Produkte → Mock-Vorschau.
- **Insider-Features:** Sport-/Live-Events-Szenen, **„Überrasch mich"** (nur Insider),
  **Dark Mode**, **wählbare App-Icons** (Gold/Invers, iOS), goldenes „✦ VERSO
  INSIDER"-Banner. Alle über denselben Flag.
- **Echte Karte = Apple Maps** (`react-native-maps`, Dev Build); Expo Go = Fallback.
  Spot-Karte poppt, Karte zentriert auf den Pin.
- **Push-Benachrichtigungen** (`expo-notifications`): 3 Toggles echt; wöchentliche
  lokale Geheimtipp-Erinnerung; Push-Token in `profiles.push_token`.
- **Avatar-Upload** (Supabase Storage), **Ort vorschlagen** → DB, **Passwort
  ändern/zurücksetzen**, **Konto löschen** (DSGVO) — alle echt.
- **Zweisprachig EN/DE**, Haptik, Reduce-Motion, a11y, Easter Eggs.

**Nötig, damit alles live läuft (Setup, kein Code):**
- Supabase-Migrationen `0001`–`0006` ausführen; **„Confirm email" AUS**.
- **Google/Apple-Provider** in Supabase aktivieren + Redirect-URL (`verso://auth-callback`).
- RevenueCat: Entitlement **`insider`** + Offering (yearly/monthly) anlegen.

## Nächste Schritte

- **Launch-Blocker:** Google/Apple-OAuth konfigurieren; **verso.app-Website**
  (Datenschutz/Impressum/Support-URL — Pflicht); TestFlight-Build.
- **Inhalte:** echte Spot-Bilder (Supabase Storage + `image_url`), mehr Spots/Städte.
- **Premium serverseitig:** RevenueCat-Webhook → Supabase (Insider-Status), 
  Insider-only Spots („verborgene Ebene").
- **Dark-Mode-Feinschliff:** harte `border-black/x`-Hairlines + Inline-Hex-Ränder
  auf ein theme-fähiges „line"-Token umstellen.

---

## Verbesserungs-Backlog (Review 2026-06-25)

> Strukturierte Review-Ergebnisse (Features · Design · UI · Risiken). Sortiert
> nach Aufwand/Wirkung. **⚠️ = aktiv aufpassen / latente Falle.** Beim Abarbeiten
> Punkte hier abhaken und in den Changelog verschieben.

### 🟢 Quick Wins (billig, hohe Wirkung)
- (erledigt) ~~**Haptik**~~ (`expo-haptics` 15.0.8, Expo-Go-fest) — `lib/haptics.ts`;
  bei Merken (Erfolg/Tap), Szenen-Toggle (Selection), Geheimtipp-Reveal (Erfolg),
  „Überrasch mich" (Medium).
- (erledigt) ~~**Profil-Stat „8 VIERTEL" hart codiert**~~ → jetzt dynamisch aus
  `NEIGHBORHOODS` für die aktuelle Stadt (`viertelCount`).
- (erledigt) ~~**Icon-Buttons ohne `accessibilityLabel`**~~ — Zurück/Schließen/
  Teilen/Filter/Szene nachgerüstet (`AnimatedChip` nimmt jetzt `accessibilityLabel`).
- (erledigt) ~~**`reduce motion` respektieren**~~ — `lib/useReduceMotion.ts`;
  GeheimtippButton-, MysticBadge- und CityMap-Pin-Puls zeigen bei aktivierter
  Einstellung eine ruhige, fixe Variante statt endlosem Puls.

### 🟡 Mittel (klare Produktverbesserung)
- (erledigt) ~~**Suche** (Ort/Viertel/Tag) im Feed~~ — `SearchField` über der
  Kategorie-Bar, filtert zusätzlich (Stadt→Szene→Kategorie→Suchtext).
- (erledigt) ~~**Feed-Filter** Budget/Bewertung/Ambiente~~ — `MapFilterSheet`
  (mit `showArt={false}`) jetzt auch im Feed, Trichter-Button neben der Suche.
- (erledigt) ~~**„Überrasch mich" / Shuffle**~~ — sichtbarer `SurpriseButton`
  oben im Feed; zufälliger Ort aus Stadt+Szene-Pool → Spot-Detail. (Shake-Geste
  bleibt separat in der Easter-Egg-Roadmap.)
- (erledigt) ~~**Onboarding-Personalisierung**~~ — bei Registrierung bis zu 3
  **Vibes** (Ambiente) wählen (`store/interests.tsx`); Feed sortiert passende
  Spots sanft nach oben (nichts ausgeblendet) + Hinweis „auf deinen Vibe
  abgestimmt". (Geheimtipp bleibt bewusst kuratiert pro Stadt.)
- (erledigt) ~~**Spot-Detail-Tiefe**~~ — „Jetzt geöffnet?"-Badge (aus
  Kategorie-Öffnungszeiten), Entfernung zum Zentrum, stilisierte Mini-Karte
  (`lib/spotMeta.ts` + `MiniMap`). Alles Expo-Go-fest, ohne GPS-Prompt.

### 🔴 Größer (strategisch / Architektur)
> **Alle drei Punkte → geplant via Supabase + RevenueCat** (siehe Abschnitt
> „Geplante Integrationen").
- (erledigt) ~~**⚠️⚠️ Persistenz fehlt**~~ — `saved`, `interests` und
  `geheimtipp` sind jetzt **pro Nutzer persistent** (Supabase `profiles` +
  `AsyncStorage` via `usePersistedList`); überleben App-Neustarts. `scene`/`city`
  bleiben bewusst in-memory (Session-Zustand, kein Mehrwert in der DB).
- **⚠️ Kein Backend / Daten nur als Mock**: Orte stecken im App-Bundle →
  Aktualisieren nur per App-Store-Update. Lösung: **Supabase**-Tabellen
  (CSV-Vorlagen in `data-collection/` als Import).
- **⚠️ Auth ist nur UI** (`register` → Feed). Lösung: **Supabase Auth**.
  Insider-Freischaltung (`useInsider`) später über **RevenueCat**-Entitlement.

### ⚠️ Aktiv geflaggte Risiken / latente Fallen
1. (erledigt) ~~**Listen ohne Virtualisierung**~~: Feed & Gespeichert nutzen jetzt
   **`FlatList`** (virtualisiert). Im Feed scrollt das Such-/Filter-/Kategorie-/
   Überrasch-Chrome als `ListHeaderComponent` mit weg — nur der Stadt-Kopf bleibt
   fix (weniger Dauer-Chrome über der ersten Karte).
2. (erledigt) ~~**Bezirks-Zuordnung per `startsWith`**~~ → jetzt **exakter Match**
   (`s.neighborhood === name`), da die Spot-`neighborhood` exakt dem Viertelnamen
   entspricht. Ein Test sichert das ab (jede Spot-`neighborhood` ist ein gültiges
   Viertel ihrer Stadt).
3. (teilw. erledigt) **Farb-Kontrast & Verwechslung**: bar/snack-Ovale **vertieft**
   (`bar #6FA82B`, `snack #D9700A`) → besserer Weiß-Kontrast; **`club` von
   `#FF4500` auf `#FF7A00`** (reines Orange) gerückt, klarer von restaurant-Rot
   getrennt. Weißer Text bleibt überall (Nutzer-Wunsch). Lime ist auch vertieft
   noch hell — bei Bedarf weiter beobachten.
4. **Easter Eggs vs. Auffindbarkeit**: versteckte Gesten sind charmant, aber
   Kernaktionen (Merken/Teilen) müssen **auch** ohne Geste erreichbar bleiben
   (sind sie im Detail — so halten).
5. (erledigt) ~~**Keine Tests**~~ — **vitest** eingezogen
   (`vitest.config.ts`, nur `src/**`-Logik, RN-frei). 17 Tests in
   `src/lib/__tests__/logic.test.ts` (matchesFilter, sortByCategory,
   isEventCategory, SCENE_CATEGORIES, getOpenState, distanceLabel,
   SPOTS-Integrität). `npm test`. Bei neuer Logik weiter abdecken.

### Empfohlene Reihenfolge
1. **Persistenz** (AsyncStorage hinter die Stores).
2. **Politur-Paket**: Profil-Stat dynamisch + a11y-Labels + Haptik.
3. **FlatList** für Feed/Gespeichert (bevor die Daten wachsen).

---

## Befehle

```bash
npm install            # Abhängigkeiten (nach git pull, v.a. bei neuen Libs)
npx expo start         # Dev-Server, QR mit Expo Go scannen
npx expo start -c      # mit geleertem Cache (bei komischen Fehlern)
npx expo start --tunnel  # falls WLAN zickt
npx tsc --noEmit       # Typecheck
npm test               # Unit-Tests der reinen Logik (vitest, src/**)
```

---

## Changelog

> Neueste Einträge oben. Format: `Hash · Datum · Titel` + Stichpunkte.
> (Der Hash des jeweils neuesten Eintrags wird im Folge-Commit nachgetragen.)

### (dieser Commit) · 2026-07-02 · CLAUDE.md überarbeitet (Stand: Backend live, Premium, Dark Mode)
- Tech-Stack, „Aktueller Stand", Architektur (neue Stores/Libs) und Konventionen
  (theme-fähige Tokens) auf den aktuellen Stand gebracht; Setup-Schritte für den
  Live-Betrieb (Supabase-Migrationen, OAuth-Provider, RevenueCat-Entitlement)
  festgehalten. Kein Code, nur Doku.

### ac775e2 · 2026-07-02 · Dark-Mode als Insider-Feature (theme-fähige Tokens)
- **Dark Mode** — nur für Insider. Umschalter in Einstellungen → „Dunkelmodus" (✦);
  Nicht-Insider tippen → Insider-Seite. Präferenz persistent (AsyncStorage),
  wirkt nur solange Insider aktiv (`src/store/appearance.tsx`).
- **Theme-fähige Farbtokens** via CSS-Variablen: `screen/surface/chip/ink/ink-2/
  ink-3` sind jetzt `rgb(var(--c-*) / <alpha-value>)` (Light-Defaults in
  `global.css`, Dark via `vars(DARK_VARS)` am Root in `app/_layout.tsx` →
  `ThemedApp`). StatusBar flippt mit. `accent`/`night` bleiben fix (in beiden ok).
- **Coverage:** die token-basierten Klassen (`bg-screen`, `bg-surface`,
  `text-ink…`) flippen automatisch. **Noch nicht** umgestellt: harte
  `border-black/x`-Hairlines und einzelne Inline-Hex-Ränder (auf Dunkel dezent
  unsichtbar) — Feinschliff-Backlog. `npx expo run:ios` reicht (reines JS).
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### ce66854 · 2026-07-02 · App-Icon-Varianten (Weiß/Schwarz Standard, Gold/Invers = Insider) + Euro-Preise
- **Neues Standard-App-Icon: Weiß/Schwarz** (`assets/icon.png` + `adaptive-icon.png`
  neu gerendert, aus dem „v." per PIL-Maske umgefärbt).
- **Insider-Extra: wählbare App-Icons** (iOS Alternate Icons via
  `expo-alternate-app-icons`): **Gold** (Gelb/Schwarz) + **Invers** (Schwarz/Gelb),
  Assets `assets/icon-gold.png`/`icon-inverse.png`. Neuer Screen `app/app-icon.tsx`
  (aus Einstellungen → „App-Icon"): Default für alle, Farb-Icons nur für Insider
  (sonst → Insider-Seite). `src/lib/appIcon.ts` (Expo-Go-fest, iOS-only).
  **→ braucht Dev Build** (natives Modul + Prebuild).
- **Preise in Euro:** Paywall formatiert die Beträge fest als **EUR** (Test-Store
  kann USD melden) statt der Store-`priceString`.
- **„Überrasch mich" nur für Insider** (Feed-Button ausgeblendet ohne Abo).
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### 77db2db · 2026-07-02 · Insider-Paywall neu + Funktionslücken (Vorschlag/Passwort/Konto)
- **Insider-Screen neu gestaltet** (`app/insider.tsx`): dunkle Bühne, Gold-Badge
  (Shimmer), Vorteils-Liste, **wählbare Plan-Karten** (Jährlich = „Bester Wert" +
  Ersparnis-% + Preis/Monat, Monatlich), Trial-Hinweis, gold CTA + „Käufe
  wiederherstellen" + Auto-Renew-Hinweis. `InsiderPackage` um `packageType/price/
  currencyCode/hasTrial` erweitert. Mock-Vorschau bleibt für Expo Go / ohne Produkte.
- **„Ort vorschlagen" schreibt jetzt in die DB** (`spot_suggestions`) statt Mock —
  `src/lib/suggestions.ts` (fail-soft), Screen mit Lade-/Danke-Zustand.
- **Passwort-Reset + ändern:** `auth` bekommt `resetPassword`/`updatePassword`/
  `deleteAccount`. `passwort-aendern` aktualisiert echt + „Passwort vergessen?"
  schickt Reset-Mail; auch im Login (`register`) „Passwort vergessen?".
- **Konto löschen** (DSGVO): `settings` → Bestätigungs-Dialog → `delete_user()`-
  RPC (löscht Auth-User, profiles cascaden) → Session weg → Welcome.
- **Migration `0006_suggestions_and_delete.sql`** (Tabelle + `delete_user`-Function).
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### cf91363 · 2026-07-02 · Push-Benachrichtigungen + Avatar-Upload
- **Push-Benachrichtigungen echt** (`expo-notifications` + `expo-device`): die drei
  Schalter in den Einstellungen (Geheimtipp · neue Spots · Events) funktionieren.
  - `src/lib/notifications.ts`: Handler, Permission-Anfrage, Expo-Push-Token
    (Expo-Go/Simulator-fest), **wöchentliche lokale Geheimtipp-Erinnerung** (Mo 9:00,
    kein Server nötig).
  - `src/store/notifications.tsx`: Prefs **persistent pro Nutzer** (`profiles.notify`);
    beim Aktivieren Permission + **Push-Token** speichern (`profiles.push_token`) für
    späteren Server-Versand (neue Spots/Events).
  - Migration `0004_profiles_notify.sql` + `expo-notifications`-Plugin in app.config.
- **Avatar-Upload** (`expo-image-picker` + Supabase Storage): „Foto ändern" in
  `profil-bearbeiten` wählt ein Bild, lädt es in den **öffentlichen `avatars`-Bucket**
  (`<uid>/avatar.jpg`) und speichert `profiles.avatar_url`. `src/lib/avatar.ts`
  (base64→ArrayBuffer). Avatar erscheint in **Bottom-Nav, Feed-Kopf, Profil,
  Profil bearbeiten** (sonst Initialen). Migration `0005_avatars.sql` (Spalte +
  Bucket + Storage-RLS). iOS-Foto-Permission ergänzt.
- **Setup:** in Supabase Migrationen `0004` und `0005` ausführen.
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### a3d… · 2026-07-01 · Fix-Runde: Profil echt, Insider-Kauf, Karten-Animationen
- **Echte Initialen überall:** neuer `src/lib/initials.ts` (`initialsFromName`);
  `InitialsAvatar` (Bottom-Nav/Feed) + `profil-bearbeiten` nutzen jetzt den echten
  Profilnamen statt Mock „LH"/„Lena Hofer". **Profil bearbeiten** ist prefilled
  aus `useProfile` und **speichert** name/username/bio (upsert).
- **Profil-Kopf:** `@username` sitzt jetzt in einer Zeile **neben** dem
  ???/Insider-Badge (statt darüber).
- **Name/Username-Race gefixt:** der Login-Fetch im `ProfileProvider` überschrieb
  den gerade gespeicherten Namen mit einer leeren DB-Antwort → `justSaved`-Ref
  hält den frischen Wert (Name bleibt nach Registrierung sichtbar).
- **Insider-Kauf erkennt jetzt korrekt:** `activeEntitlement` prüft nicht nur das
  benannte Entitlement `insider`, sondern auch **irgendein aktives Entitlement /
  Abo / Kauf** → ein Test-Kauf schaltet Insider frei (Szenen + goldenes Banner),
  auch wenn im Dashboard noch kein Entitlement gemappt ist. **Sauberer:** im
  RevenueCat-Dashboard ein Entitlement `insider` anlegen und die Produkte
  (yearly/monthly) daran hängen.
- **Insider testbar ohne Produkt:** solange keine Offering existiert, zeigt
  `app/insider.tsx` wieder den Mock-Vorschau-Schalter (statt leerer Paywall).
- **RevenueCat-Logs** auf WARN gedrosselt (kein DEBUG-Spam beim Start).
- **Karten-Animationen:** die Spot-Karte poppt federnd hoch (rise+scale+fade,
  re-poppt beim Pin-Wechsel); bei Auswahl **zentriert/zoomt die echte Karte sanft
  auf den Pin** (`animateToRegion`); auf der Fallback-Karte **hüpft der Punkt**.
- **Goldenes Insider-Oval nicht mehr antippbar** (öffnet nicht mehr den ???-Screen;
  reiner Status). **„???" (kein Insider)** bleibt tappbar → Upsell.
- **Welcome übersprungen bei bestehender Session:** eingeloggte Nutzer landen nach
  dem Lade-Screen direkt im Feed (Redirect unter dem Loader, kein Welcome-Flash).
- **Feed-Übergang:** die Liste fadet + steigt leicht auf beim Szenen-/Kategorie-
  Wechsel (statt hart zu erscheinen).
- **Profil bearbeiten** ist prefilled aus `useProfile` und **speichert** wirklich.
- **„Nach Google Maps exportieren" (Gespeichert) entfernt** — redundant zu den
  Deep-Links; `GoogleExportSheet` nicht mehr genutzt. (Ein zwischenzeitlicher
  „Verbundene Konten"-Screen wurde nach Abwägung wieder verworfen: einfache
  Deep-Links reichen; Apple/Google-Login steckt schon im Auth-Flow. E-Mail bleibt
  in den Einstellungen.)
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### 5cbe7e4 · 2026-07-01 · Name/Username bei Registrierung + Google/Apple-Login + goldenes Insider-Banner
- **Name & Username bei der Registrierung:** `register.tsx` hat im Registrier-
  Modus neue Felder **Name** (Pflicht) und **@username** (optional, wird zu einem
  Handle normalisiert). Beim Sign-up werden sie in `profiles` (`name`/`username`)
  gespeichert. **Neuer `src/store/profile.tsx`** (`ProfileProvider`/`useProfile`):
  lädt name/username/bio des angemeldeten Users, `save()` upsertet sie; Gast =
  Mock-Profil. `ProfileProvider` in `_layout.tsx` unter `AuthProvider`.
- **Profil zeigt echte Daten:** `profil.tsx` nutzt `useProfile` → echter Name,
  `@username` und **Initialen aus dem Namen** (statt hart „LH"/`MOCK_USER`).
- **Google/Apple-Login (Supabase OAuth):** `auth.tsx` `signInWithProvider` öffnet
  den Provider im System-Browser (`expo-web-browser`), Redirect via
  `Linking.createURL("auth-callback")`, PKCE → `exchangeCodeForSession`. Client
  auf `flowType: "pkce"` gestellt. Die Apple/Google-Buttons sind verdrahtet.
  **Setup nötig:** Provider in Supabase (Authentication → Providers) aktivieren +
  Redirect-URL unter URL Configuration erlauben; Google/Apple-Credentials in den
  jeweiligen Consoles. Ohne Konfiguration zeigt der Button eine Fehlermeldung.
- **Goldenes Insider-Banner:** `MysticBadge` wechselt bei aktivem Abo von „???"
  (schwarz, pulsierende gelbe Kontur) zu **„✦ VERSO INSIDER"** (Gold `#F4C430`,
  Glow, schimmernder Funke) — spiegelt `useInsider().isInsider`. Die Insider-
  Szenen (Sport/Live Events) schalten wie gehabt über denselben Flag frei.
- **`expo-web-browser`** ergänzt (Expo-Go-fest). tsc sauber, 18/18 vitest, Bundle baut.

### d21c7a0 · 2026-07-01 · RevenueCat: Insider-Entitlement + Paywall (Dev Build)
- **`useInsider` ist jetzt echt statt Mock (im Dev Build):** `src/store/insider.tsx`
  spiegelt das RevenueCat-**Entitlement „insider"** — `isInsider =
  customerInfo.entitlements.active.insider`. Kauf/Wiederherstellen über den Store
  (`purchase`/`restore`), RevenueCat-Identität an den Supabase-User gekoppelt
  (`Purchases.logIn(user.id)` / `logOut`).
- **Expo-Go-fest via Fallback:** `src/lib/revenuecat.ts` lädt
  `react-native-purchases` (10.4.0) **nur außerhalb Expo Go** (`require`-Guard über
  `Constants.executionEnvironment`) → in Expo Go bleibt die **Mock-Vorschau**
  (`setInsider(true)`) wie bisher. `hasRevenueCat`-Flag steuert den Modus.
- **`app/insider.tsx` = echte Paywall** wenn verfügbar: listet die Offering-Pakete
  mit Preis, Kauf-Button + „Käufe wiederherstellen", Fehleranzeige. Ohne Paywall
  (Expo Go) unverändert die Vorschau-Umschaltung.
- **Key** in `app.config.js` `extra.revenueCatIosKey` (RevenueCat **Test-Store**-
  Key `test_…`, public by design) + `revenueCatEntitlement: "insider"`.
- **Braucht Dev Build** (natives Modul): `npx expo run:ios`. Im RevenueCat-
  Dashboard ein Entitlement `insider` + eine Offering anlegen; echte Käufe via
  Test-Store bzw. später App-Store-Connect-Produkte + TestFlight-Sandbox.
- tsc sauber, 18/18 vitest, iOS-Bundle baut.

### 7ac4c70 · 2026-07-01 · Persistenz: saved/interests/geheimtipp in die DB (+ Demo-Login)
- **Stores sind nicht mehr in-memory:** `saved`, `interests` und `geheimtipp`
  werden jetzt **pro angemeldetem Nutzer persistiert** — Supabase `profiles`
  (Spalten `saved_spot_ids`, `interests`, `geheimtipp_abgeholt`) als Quelle der
  Wahrheit + **AsyncStorage** als Offline-Cache. Gemerkte Orte, Vibes und der
  abgeholte Wochentipp **überleben App-Neustarts** und folgen dem Konto.
- **Neuer Helfer `src/lib/profile.ts`** (loadLocal/saveLocal/fetchProfileColumn/
  patchProfileColumn, alle fail-soft) + **Hook `src/store/usePersistedList.ts`**:
  hydriert erst aus dem lokalen Cache (sofort), dann aus der DB; schreibt jede
  Änderung in beide. **Gast (nicht eingeloggt) = in-memory Mock** wie bisher.
  Die drei Stores nutzen den Hook (geheimtipp speichert die Liste der bereits
  abgeholten Städte statt eines Records).
- **Migration `0003_profiles_geheimtipp.sql`**: Spalte `geheimtipp_abgeholt
  text[]` auf `profiles`. **Setup:** nach 0001/0002 einmal ausführen.
- **Demo-Login** in `register.tsx` („Als Demo-Nutzer einloggen") meldet mit
  `demo@verso.app` / `versodemo` an (legt das Konto beim ersten Mal an, falls
  E-Mail-Bestätigung in Supabase aus ist) — zum schnellen Testen.
- tsc sauber, 18/18 vitest, iOS-Bundle baut. Reines JS → **läuft in Expo Go**.
  **Nächster Schritt:** RevenueCat (Insider-Entitlement + Paywall) — braucht
  Dev Build.

### 13988f8 · 2026-07-01 · Echte Supabase-Auth (E-Mail + Passwort, Session persistent)
- **Login ist jetzt echt** statt Mock: `register.tsx` „Konto erstellen"/
  „Anmelden" laufen über **Supabase Auth (E-Mail + Passwort)**. Neues
  **Passwort-Feld** (min. 6 Zeichen bei Registrierung), Fehler-/Ladezustand,
  Enter → Submit. Apple/Google bleiben UI-Platzhalter (Gast-Eintritt).
- **Neuer `src/store/auth.tsx`** (`AuthProvider`/`useAuth()`): hält `session`/
  `user`, `signUp`/`signIn`/`signOut`, `loading`. Läuft **ohne Supabase im
  Gastmodus** (Aktionen no-op → App bleibt nutzbar). `AuthProvider` in
  `_layout.tsx` unter `LanguageProvider`.
- **Session persistent:** `@react-native-async-storage/async-storage` (2.2.0,
  Expo-Go-fest) als Auth-Storage in `lib/supabase.ts` (`persistSession: true`,
  `autoRefreshToken: true`). **Eingeloggt bleibt eingeloggt** über App-Neustarts;
  Welcome-CTA zeigt dann „Weiter/Continue" → direkt in den Feed.
- **Abmelden** (`settings.tsx`) ruft jetzt `signOut()` (+ Store-Reset wie
  bisher); E-Mail-Zeile zeigt die **echte** angemeldete Adresse.
- **DB-Trigger** (`supabase/migrations/0002_profiles_trigger.sql`): neuer
  Auth-User → automatisch eine `profiles`-Zeile (`security definer`, umgeht RLS
  für den Insert). **Setup:** nach `0001_init.sql` einmal ausführen.
- tsc sauber, 18/18 vitest, iOS-Bundle baut. Reines JS → **läuft in Expo Go**.
  **Nächster Schritt:** Persistenz von `saved`/`interests`/`geheimtipp` in die DB.

### 7534c59 · 2026-07-01 · Screens lesen aus Supabase (CatalogProvider, Mock-Fallback)
- **Neuer `src/store/catalog.tsx`** (`CatalogProvider` / `useCatalog()`): hält
  `spots` + `neighborhoods`, startet mit dem lokalen Mock (`src/data/*`, sofort
  sichtbar/offline) und **swappt bei konfiguriertem Supabase** die echten Zeilen
  ein (`spots`/`neighborhoods` `select("*")`, snake→camel via `rowToSpot`/
  `rowToNeighborhood`). Fehler/leeres Ergebnis → **Mock bleibt** (sicherer
  Fallback). Exponiert außerdem `getSpotById` (Map) und `source` ("mock"|
  "supabase"). `CatalogProvider` in `_layout.tsx` ganz außen (unter
  `LanguageProvider`).
- **Alle Screens auf `useCatalog()` umgestellt** statt direkter Mock-Imports:
  Feed, Karte, Viertel, Bezirk, Gespeichert, Profil, Spot-Detail, Geheimtipp
  (SPOTS → `spots`, NEIGHBORHOODS → `neighborhoods`, `getSpotById` aus dem
  Katalog). `SPOTS` in die betroffenen `useMemo`-Deps ergänzt (Feed/Karte),
  Karte-`focus`-Effekt bekommt `SPOTS` in die Deps.
- Reines JS → **läuft in Expo Go**. tsc sauber, 18/18 vitest, iOS-Bundle baut.
  **Nächste Schritte:** Auth (`register` → Supabase Auth + Session-Persistenz),
  dann Persistenz der Stores (`saved`/`interests`/`geheimtipp`) in die DB.

### bbff402 · 2026-07-01 · Supabase-Fundament: Client + Schema + Seed
- **Supabase-Client** (`src/lib/supabase.ts`): `@supabase/supabase-js` (2.x) +
  `react-native-url-polyfill`. URL + publishable key in `app.config.js` `extra`
  (Key ist public by design; Schutz via RLS). `hasSupabase`-Flag für Fallback.
  Reines JS → **läuft auch in Expo Go**.
- **Schema + RLS** (`supabase/migrations/0001_init.sql`): Tabellen `spots`,
  `neighborhoods`, `geheimtipp_by_city`, `profiles` (inkl. DE-Felder: `blurb_de`,
  `teaser_de`, `spots.de` jsonb). Katalog öffentlich lesbar, `profiles` privat.
- **Seed** (`supabase/seed.sql`, generiert via `scripts/gen-seed.ts` mit `tsx`
  aus `src/data/*`): 8 Viertel, 21 Spots, 1 Geheimtipp — Upserts, re-runnbar.
- **Noch NICHT verbunden:** die Screens lesen weiter aus dem Mock (`src/data/*`).
  Nächster Schritt: Feed/Karte/Detail auf DB-Reads umstellen (mit Mock-Fallback),
  dann Auth, dann Persistenz. **Setup:** im Supabase-SQL-Editor erst
  `0001_init.sql`, dann `seed.sql` ausführen.

### 238c575 · 2026-07-01 · Spot-Detail „Auf Karte" → Verso-Karte statt native Maps
- Der **Mini-Karten-Tap** im Spot-Detail (`MiniMap`) öffnet jetzt **Versos
  eigenen Karte-Tab** statt der nativen Maps-App: `router.navigate("/karte",
  { focus: spot.id })`.
- **`karte.tsx`** liest den `focus`-Param (`useLocalSearchParams`): wechselt zur
  passenden **Szene** des Spots, wählt ihn aus (Spot-Karte öffnet) und **zentriert
  die echte Karte** darauf (neuer `centerOn`-Prop → `mapRef.animateToRegion`).
- Die expliziten **Apple/Google-Maps-Buttons** im Detail (Adresse) bleiben als
  native Deep-Links erhalten. Reines JS → Reload.

### 68d6d23 · 2026-07-01 · Karte: Marker-Tap zeigt wieder die Spot-Karte (kein Callout)
- **Fix:** react-native-maps zeigte beim Marker-Tap die native **Callout-Blase**
  (der „hässliche Text") statt unserer Spot-Karte. Ursache: `title` am Marker +
  unzuverlässiges `Marker.onPress` unter New Arch.
- **Lösung:** `title` entfernt (keine Callout-Blase), Auswahl jetzt über das
  Map-Level-Event **`onMarkerPress`** (Marker mit `identifier={spot.id}`) →
  `onSelect` → unsere schwebende Spot-Karte erscheint wieder. Reines JS → Reload.

### a526566 · 2026-07-01 · Karte: weißes Kopf-Feld + Logo/„+" bündig über der Nav
- **Kein Full-bleed-über-alles mehr:** Stadt-Kopf + Suche/Filter sitzen jetzt in
  einem **soliden weißen Feld** oben (mit Hairline-Border unten); nur die
  **Kategorie-Pills schweben** über der Karte. (Wunsch: „München + Filter im
  weißen Feld, nur die Karten auf der Map".)
- **Karten-Fläche endet bündig an der Nav-Oberkante** (`marginBottom = navH`) →
  das **Apple-Logo** (am Map-Frame-Boden) sitzt jetzt **direkt über der Hotbar**;
  `mapPadding.bottom` nur noch 8 (kleiner Abstand). `mapPadding.top` =
  gemessene Kategorie-Leisten-Höhe → Positions-Button unter den Pills.
- **„+"-FAB und Spot-Karte** auf `navH + 12` gesetzt → **unmittelbar über der
  Nav** (vorher schwebten sie zu hoch).
- Reines JS/Layout → **Reload reicht** (kein nativer Rebuild). tsc sauber,
  18/18 vitest, iOS-Bundle baut.

### 6b04f9b · 2026-07-01 · Karte full-bleed (react-native-maps + mapPadding) + Nav als Feld
- **Karten-Lib gewechselt: expo-maps → `react-native-maps` (1.20.1)** — nur so
  geht **full-bleed Karte + verschiebbare native Controls**: `mapPadding` rückt
  den **Positions-Button** unter die schwebenden Kategorie-Pills (oben) und das
  **Apple-Logo** über die Bottom-Nav (unten), während die Kacheln bis ganz oben
  durchlaufen. Apple Maps via `PROVIDER_DEFAULT` (kein Token). `showsUserLocation`
  + `showsMyLocationButton` (iOS-Location-Permission in `app.config.js`).
- **`karte.tsx` neu aufgebaut:** Karte liegt **absolut über den ganzen Screen**
  (bis unter die Statusbar); Stadt-Kopf + Suche + Kategorie-Leiste **schweben**
  darüber (`box-none`), Höhe wird gemessen → `mapPadding.top`. `mapPadding.bottom`
  = Nav-Höhe (`insets.bottom + 62`).
- **Bottom-Nav von Insel → durchgehendes Feld** (`BottomNav`): volle Breite,
  bündig unten, Hairline-Top-Border, Safe-Area unten; kein `mx-4`/Rundung mehr.
  Gilt app-weit.
- **`SceneToggle` entschlackt:** Nicht-Insider sehen nur Feiern/Essen + ein
  einzelnes ⭐-Chip (öffnet Insider-Upsell); Insider sehen alle vier Szenen
  (kein überlappendes Schloss-Badge mehr). Guard: wird die Vorschau beendet,
  fällt eine Insider-Szene auf „essen" zurück.
- expo-maps deinstalliert. tsc sauber, 18/18 vitest, iOS-Bundle baut.
  **→ braucht nativen Rebuild** (`npx expo run:ios`), react-native-maps ist nativ.

### a29a6b2 · 2026-07-01 · App-Icon + Apple-Maps-Controls einrücken
- **App-Icon** ergänzt (Prebuild-Warnung „No icon" behoben): `assets/icon.png`
  (1024, **deckend** dunkel, gelbes kursives „v.", KEINE runden Ecken — iOS
  maskiert selbst) + `assets/adaptive-icon.png` (Android-Foreground, transparent,
  „v." kleiner für die Safe-Zone) auf dunklem `backgroundColor`. In
  `app.config.js` als `icon` / `android.adaptiveIcon` verdrahtet. Gerendert mit
  DM Serif Display italic (2× Supersampling), gleiche Marke wie das Discord-Icon.
  **→ Icon erscheint erst nach nativem Rebuild** (`npx expo run:ios`).
- **Apple-Maps-Controls eingerückt:** expo-maps hat KEIN Padding/Inset-API; die
  nativen Controls (Positions-Button oben, **Apple-Logo unten** = Pflicht sichtbar)
  hängen am Map-View-Frame. Lösung: `CityMap` bekommt `topInset`/`bottomInset`,
  die im expo-maps-Zweig als `marginTop`/`marginBottom` den Frame schrumpfen →
  Positions-Button unter der Kategorie-Leiste, Apple-Logo über der Bottom-Nav.
  `karte.tsx` gibt `topInset={58}` / `bottomInset={insets.bottom+74}`. Nur echte
  Karte; Fallback (Expo Go) bleibt full-bleed. (JS-only → Reload reicht.)

### 1eeff0c · 2026-07-01 · Echte Karte auf Apple Maps (expo-maps) statt Mapbox
- **Mapbox → `expo-maps` (~0.12.10):** die echte Karte ist jetzt **Apple Maps
  auf iOS** (kein Token nötig), Google Maps auf Android. `@rnmapbox/maps`
  deinstalliert, Mapbox-Plugin + `MAPBOX_*`-Tokens aus `app.config.js` raus,
  `expo-maps`-Plugin ergänzt.
- **`CityMap.tsx`**: „echte Karte"-Zweig nutzt `ExpoMaps.AppleMaps.View`
  (iOS) / `GoogleMaps.View` (Android) mit **deklarativen nativen Markern**
  (Koordinaten + Titel + Kategorie-Tint). Marker-Tap → `onSelect` → Spot-Karte.
  Weiterhin nur im **Dev Build** (Expo Go = stilisierte Fallback-Karte).
- **Trade-off:** expo-maps rendert nur native Marker → die animierten
  Gelb-Oval-Pins + Doppeltipp-Easter-Egg gibt es **nur noch auf der Fallback-
  Karte**. `onMarkerClick` braucht iOS 18+.
- tsc sauber, 18/18 vitest, iOS-Bundle baut (kleiner ohne Mapbox).

### b23edfd · 2026-06-30 · Kategorie-Icons + Karte „+"-Ort-vorschlagen
- **Kategorie-Pills haben jetzt ein kleines Icon links** vom Namen
  (`CATEGORY_ICON` in `categories.ts`; `categoryFilters()` stellt es dem Label
  voran). Greift überall (Feed, Karte, Gespeichert, Bezirk) via `sceneFilters`.
  „Alle/All" bleibt ohne Icon. Caps-Labels (Karten-Badges) unverändert.
- **Karte: gelber „+"-FAB** (unten rechts, über der Nav; ausgeblendet, solange
  eine Spot-Karte offen ist) → neuer modaler Screen **`app/ort-vorschlagen.tsx`**:
  Mock-Formular (Name, Kategorie-Pills mit Icons, Viertel/Adresse, „warum
  besonders") + Danke-Zustand. Zweisprachig, `KeyboardDoneBar`. Kein Backend.

### 011652c · 2026-06-30 · Insider-Szenen: Sport + Live Events (oben rechts)
- **`SceneToggle` hat jetzt 4 Szenen** (oben rechts): Feiern 🎉 · Essen 🍴 +
  **Sport 🏃** und **Live Events 🎫** — Letztere sind **nur für Verso Insider**
  (🔒). Tippen auf eine gesperrte Szene öffnet die Insider-Seite (Upsell).
- **Neuer `store/insider.tsx`** (`useInsider`, in-memory, Default aus): kein
  Backend → die **Insider-Seite (`app/insider.tsx`) bietet eine Mock-Vorschau**
  („Insider-Vorschau aktivieren"), die die gesperrten Szenen freischaltet.
  `InsiderProvider` in `_layout.tsx`; Abmelden setzt Insider + Szene zurück.
- **Neue Kategorien.** Sport-Szene: **Pilates · Run Club · Cycle Club ·
  Fitnessstudio** (+ generisches Sport). Live-Events-Szene: **Konzerte** (neu) +
  Live-Musik & Kino/Date (aus Feiern hierher verschoben). Feiern jetzt nur noch
  Bar · Club · Rooftop.
- Durchgängig verdrahtet (types, categories +DE, PIN_COLORS, ART_OPTIONS +DE,
  CATEGORY_HOURS, SCENE_CATEGORIES). `konzerte` ist event-artig (Datum/Ticket).
- **5 neue Münchner Mock-Spots** (zweisprachig): Kernkraft (Pilates), Isarläufer
  (Run Club), Kettenreaktion (Cycle Club), Eisenhof (Gym), Hallenklang (Konzert,
  mit dateLabel). München jetzt 21 Spots. Tests grün (18).

### afdaf1d · 2026-06-30 · Discord-Server-Icon (PNG) aus dem App-Icon
- **`design/verso-discord-icon-1024.png` + `-512.png`**: das Favoriten-App-Icon
  (kursives „v." in Gelb `#FFE500` auf `#1A1A1A`, Radius ~22 %, DM Serif Display
  italic) als PNG fürs Discord-Server-Profilbild gerendert (2× Supersampling).
  „v." optisch zentriert → übersteht Discords Kreis-Crop. (Reines Asset, kein
  App-Code.)

### 52c0185 · 2026-06-30 · 6 neue Kategorien (Party + Essen) + Mock-Spots
- **Neue Kategorien.** Feiern: **Live-Musik** (`livemusik`), **Rooftop**
  (`rooftop`), **Kino / Date** (`kino`). Essen: **Süßes** (`dessert`),
  **Street Food** (`streetfood`), **Biergarten** (`biergarten`).
- Durchgängig verdrahtet: `Category`-Typ (types.ts), `CATEGORY_FILTERS`/
  `CATEGORY_LABEL`/`CATEGORY_ORDER` (+ DE), `PIN_COLORS` (eigene Farben:
  violet/blau/teal/pink/gold/oliv), `SCENE_CATEGORIES`, `ART_OPTIONS` (+ DE),
  `CATEGORY_HOURS` (Öffnungszeiten je neue Kategorie in spotMeta.ts).
- **6 Münchner Mock-Spots** (je 1 pro neue Kategorie, zweisprachig mit `de`):
  Kellerton (Live-Musik), Dachfunk (Rooftop), Lichtspiel (Kino), Zuckerbruch
  (Süßes), Hallengold (Street Food), Kastanienhof (Biergarten) → Hotbar-Pills
  nicht leer. München jetzt 16 Spots. Integritäts-Test bleibt grün.

### ea7ecc2 · 2026-06-30 · Szene: „Wein / Cooking" zu Essen verschoben
- `SCENE_CATEGORIES` in `scene.ts`: **`weintasting` von `feiern` → `essen`**.
  Feiern jetzt Bar · Club · Sport; Essen Restaurant · Snack · Café · Wein/Cooking.
  (Münchner Mock-Daten haben aktuell keine weintasting/sport-Spots → nur
  Hotbar-Zuordnung betroffen.) Tests bleiben grün (Szenen überschneidungsfrei).

### 932ce76 · 2026-06-30 · Einstellungen: Notification-Toggles animiert
- Die On/Off-Schalter (NOTIFICATIONS) waren statisch (Knopf sprang) → jetzt
  **Reanimated**: der Knopf **federt** per `withSpring` rüber, Track- und
  Knopf-Farbe **crossfaden** (`interpolateColor`). `tapSelection`-Haptik +
  `accessibilityRole="switch"` ergänzt. `TOGGLE_TRAVEL = 17px`.

### 49ab951 · 2026-06-30 · Gespeichert: Wisch-Aktionen wachsen mit (YouTube-Style)
- **Swipe-Zeilen neu auf Reanimated-Pan** (statt `Swipeable`): die farbige
  **Teilen-/Löschen-Box wächst mit dem Finger** — ihre Breite folgt der
  Wisch-Distanz (`width = ±translationX`), Icon am äußeren Rand. Wie in der
  YouTube-Mobile-App.
- **Auslösung** ab `SWIPE_THRESHOLD` (96px): rechts → Teilen (federt zurück),
  links → Löschen (Zeile gleitet raus → `toggle` entfernt sie). Darunter spring
  zurück. Vertikales Wischen lässt die Liste scrollen (`failOffsetY`).
- Zeilentext jetzt **lokalisiert** über `spotText` (Name/Hook in DE), Share-
  Nachricht ebenso. Kein `openRef`-Sonderfall mehr (Tippen öffnet immer Detail).

### 17bdc77 · 2026-06-30 · Gespeichert: Suche + Filter (wie im Feed)
- **Gespeichert** bekommt dieselbe **Such-/Filter-Zeile wie der Feed**:
  `SearchField` (matcht Name/Viertel/Tag) + Trichter-`FilterButton` →
  `MapFilterSheet` (`showArt={false}`, da die Kategorie-Hotbar die Art macht).
  `KeyboardDoneBar` fürs Suchfeld ergänzt.
- **Filterkette:** Stadt → Szene → Hotbar-Kategorie → **Suchtext** →
  **Budget/Bewertung/Ambiente** (`matchesFilter`), dann `sortByCategory`. Das
  Anzahl-Badge („X PLACES/ORTE") und der Leerzustand spiegeln jetzt das
  Such-/Filter-Ergebnis (eigener Leertext bei aktiver Suche/Filter).
- **Layout an den Screen angepasst:** Such-/Filter-Zeile fix unter dem Stadt-
  Kopf (nur wenn etwas gemerkt ist), Hotbar + Wisch-Hinweis scrollen im
  `ListHeaderComponent`; Abstände gestrafft (paddingTop 8, Hotbar mt-3).

### 9f1f55a · 2026-06-30 · Responsiveness Cycle 2: Audit + Fallback-Karten-Label
- **Audit** (Screens + Komponenten): App ist responsiv — Pins prozentual,
  Layouts flex/Prozent, Bars scrollen, große Display-Schrift skaliert/fittet
  (Cycle 1). Keine echten Overflow-Bugs.
- **Fix:** dekoratives Fallback-Karten-Straßenlabel „Rechte Wienzeile" stand auf
  `left:230` → klippte auf 320pt; jetzt `left:"62%"` (proportional).

### f9a72e6 · 2026-06-30 · Responsiveness Cycle 1: große Display-Schrift skaliert/fittet
- **`lib/responsive.ts`** neu (`useScaleSize()`): skaliert px-Größen nach
  Bildschirmbreite (Referenz 390pt, clamp 0.84–1.12) → passt von iPhone SE
  (320) bis Pro Max (430).
- **Welcome „verso"-Wortmarke** (92px) und **VersoLoader** (88px) skalieren jetzt
  mit der Breite (kein Überlaufen auf schmalen Geräten).
- **Dynamische Display-Titel** bekommen `numberOfLines` + `adjustsFontSizeToFit`:
  Spot-Name (46px) und Viertel-Name (38px) schrumpfen statt überzulaufen
  (lange Namen wie „Westend / Schwanthalerhöhe" auf 320pt).
- **Audit (2 Cycles, je Screens + Komponenten):** App ist grundsätzlich
  responsiv — Karten-Pins sind **prozentual** positioniert, Layouts nutzen
  flex/Prozent, horizontale Bars scrollen. Einziger echter Schmalbild-Mangel:
  ein dekoratives Fallback-Karten-Straßenlabel (`left:230`) lief auf 320pt aus
  dem Bild → auf `left:"62%"` umgestellt. Keine weiteren Bugs gefunden.

### 4c7fee4 · 2026-06-30 · Einstellungen gestreckt + „S"-Fix + Legal-Screen (zweisprachig)
- **Einstellungen:** Titel „Settings/Einstellungen" wurde oben leicht
  abgeschnitten → `lineHeight: 38` + `includeFontPadding:false`. Seite +
  weiße Karten **gestreckt**: ScrollView `flexGrow:1`, höhere Zeilen
  (`py-[18px]`/`py-[17px]`), und **flexible Spacer** zwischen ACCOUNT /
  NOTIFICATIONS / APP / Abmelden → Sektionen verteilen sich gleichmäßig über
  die Seitenhöhe statt oben zu klumpen.
- **Neuer `app/legal.tsx`** (Rechtliches & Hilfe): zweisprachiger **Mock-Text**
  (HILFE & FAQ, IMPRESSUM, DATENSCHUTZ, NUTZUNGSBEDINGUNGEN, KONTAKT) im
  Verso-Ton; verlinkt aus Einstellungen, im Root-Stack registriert.

### 5b92080 · 2026-06-30 · Emoji-Sprach-Toggle (Slide+Pop) + Feed-Karten-Adresse alignt
- **`LanguageToggle`** (neu): Emoji-Toggle **EN 🇬🇧 / DE 🇩🇪** in den Einstellungen
  (ersetzt die Text-Zeile). **Slide + Pop:** gelber Selector gleitet per Spring
  auf die gewählte Seite, die neue Flagge „poppt" (Scale-Bounce); Selektions-
  Haptik nur bei echtem Wechsel. Schaltet sofort die ganze App um.
- **Fix Feed-Karten:** Adress-Zeile in `SpotCard` war nicht auf einer Linie —
  `flex-row` → **`flex-row items-baseline`**, sodass „ADRESSE"-Label und Adresse
  auf gemeinsamer Grundlinie sitzen (Adresse saß vorher zu tief).

### d231d03 · 2026-06-30 · Zweisprachig (EN/DE) + Sprach-Toggle + englische Städtenamen
- **i18n eingeführt:** App läuft jetzt **Englisch & Deutsch**. Umschaltung im
  **Account → Einstellungen → „Language/Sprache"** (toggelt sofort die ganze App).
  Default = **Gerätesprache** (`expo-localization` ~17.0.9, neu).
- **Neue Bausteine:** `src/lib/lang.ts` (Lang-Typ, `cityLabel`, `pick`),
  `src/lib/i18n.ts` (`useT`/`useLang`), `src/lib/localized.ts` (`spotText`/
  `neighborhoodBlurb`/`geheimtippTeaser`), `src/store/language.tsx`
  (`LanguageProvider`, in `_layout.tsx` ganz außen). `expo-localization` als
  Plugin in `app.config.js`.
- **Englische Städtenamen:** in EN zeigt die App **Munich/Vienna/Zurich/Berlin/
  Hamburg/Frankfurt/Düsseldorf**; der **kanonische `City`-Wert bleibt deutsch**
  („München") — Daten/IDs unverändert. Anzeige überall via `cityLabel(city, lang)`
  (CityDropdown, Welcome, Bezirk-Kopf, …).
- **Deutsche Inhalte zurück:** `Spot.de` (alle 10 Spots), `Neighborhood.blurbDe`
  (8 Viertel), `GeheimtippDerWoche.teaserDe`, Profil-Bio — über `localized.ts`.
- **Label-Listen sprach-bewusst:** `categoryLabel`/`categoryFilters`/`sceneFilters`,
  `artOptions`/`ratingOptions`/`ambienteOptions`, `getOpenState`/`distanceLabel`
  nehmen jetzt `lang` (EN-Default → Tests bleiben grün, 18/18).
- **Alle Screens & Komponenten** auf `t("EN","DE")` umgestellt (Inline-Picker,
  kein zentrales Dictionary). `tsc` sauber, iOS-Bundle baut.

### 4864330 · 2026-06-29 · Marken-Lade-Screen „verso" (Pop-Animation)
- Neue **`VersoLoader`**-Komponente (`src/components/VersoLoader.tsx`): beim
  App-Start liegt ein **weißer Vollbild-Screen** über allem; das kursive
  **„verso"** „poppt" per Reanimated-Spring durch **7 Schritte** mit jeweils
  wechselnder **Farbe + Schriftart** (Marken-Hanken gemischt mit System-Fonts:
  Serif/Mono/Condensed/Script — genuine Typeface-Wechsel ohne neue Pakete) und
  **fadet danach aus → die braune Welcome-Bühne (`bg-night-2`) erscheint**.
- In **`app/_layout.tsx`** als oberster Overlay eingehängt (`loaderDone`-State,
  `pointerEvents="none"`); unmountet sich nach der Austritts-Animation selbst.
  Expo-Go-fest, reine Reanimated-Animation.

### 2026-06-29 · App komplett auf Englisch übersetzt
- **Gesamte App von Deutsch auf Englisch** umgestellt: alle sichtbaren UI-Texte
  (Feed, Karte, Viertel, Profil, Spot-Detail, Gespeichert, Geheimtipp, Settings,
  Welcome, Registrierung, …) **und** alle Code-Kommentare. Mock-Daten (`spots`,
  `cities`-Blurbs, `user`-Bio, Teaser) ebenfalls englisch.
- **Bewusst deutsch belassen:** Eigennamen — Stadtname „München", Viertelnamen
  (Glockenbachviertel, Isarvorstadt / Flaucher, …), Straßen-Adressen, sowie
  Code-Identifier/Routen (`gespeichert`, `bezirk`, `viertel`, `geheimtipp`,
  Funktionsnamen) und Store-/Daten-Keys.
- **Glossar:** Geheimtipp → hidden gem („Hidden Gem of the Week"), Viertel →
  Areas/neighborhood, Gespeichert → Saved, Merken → Save, Teilen → Share,
  „Überrasch mich" → „Surprise me", Ambiente intim/lebhaft/gemütlich/underground/
  elegant/draußen → Intimate/Lively/Cozy/Underground/Elegant/Outdoors,
  „kommt bald" → „coming soon".
- **Konvention geändert:** Code-Kommentare ab jetzt **englisch** (war deutsch).
- Tests/Typen grün: `tsc --noEmit` sauber, 18/18 vitest (englische String-
  Erwartungen in `logic.test.ts` mitgezogen, englische Zahlen-/Zeitformate).

### a949f3f · 2026-06-26 · Fix: Doppeltipp-Hinweis kollidiert nicht mehr mit Kategorie-Leiste
- Der Doppeltipp-Hinweis-Chip in `CityMap` lag bei `top: 12` — seit der
  schwebenden Kategorie-Leiste (oben ~6–56) überlappte er die Kategorie-Ovale.
  → Chip auf `top: 66` (unter die Leiste) verschoben.

### 2c06594 · 2026-06-26 · Karte: Such-/Filter-Zeile statt Filter-Schnellwahl
- **Karte** nutzt jetzt **dieselbe Such-/Filter-Zeile wie der Feed**: `SearchField`
  (filtert Pins nach Name/Viertel/Tag) + Trichter-`FilterButton` (öffnet das
  Filter-Sheet). Die alte Filter-Schnellwahl (Budget/Bewertung/Ambiente-Chips)
  und der „FILTER"-Button sind raus. `KeyboardDoneBar` für das Suchfeld ergänzt.
- Neue **`FilterButton`**-Komponente (Trichter + Aktiv-Indikator), aus dem Feed
  extrahiert und in Feed + Karte gemeinsam genutzt (DRY).

### 7d2be61 · 2026-06-26 · Kategorie-Leiste schwebt transparent (Feed + Karte)
- Neue **`CategoryBar`** (transparenter Hintergrund, Pills bleiben gefüllt) —
  als **schwebende Overlay-Leiste**: der Inhalt dahinter (Feed-Karten / Karte)
  bleibt sichtbar, man sieht „durch die Leiste".
- **Feed**: Stadt-Kopf + Suche/Filter bleiben fix & deckend; die Kategorie-Leiste
  liegt jetzt **absolut über** der `FlatList` (`paddingTop` aus gemessener
  Leistenhöhe), Karten scrollen sichtbar dahinter.
- **Karte**: dieselbe Leiste schwebt über `CityMap` und filtert die Pins nach
  Kategorie (`activeCategory`). „Art" wandert damit aus dem Karten-Filter-Sheet
  (`showArt={false}`), der redundante „Art"-Schnellchip ist raus.

### f5505cc · 2026-06-26 · App-Store-Texte + Design-Runtime aktualisiert
- Neue **`store/app-store-listing.txt`**: App-Store-Listing-Entwurf (de-DE) im
  Verso-Ton — App-Name, Untertitel, Promo-Text, Keywords, Beschreibung, Release
  Notes, Kategorien, Altersfreigabe-Hinweis (voraussichtlich 12+ wg. Bars/Alkohol),
  App-Privacy („keine Daten erfasst" im MVP) und Apple-Review-Notizen. Optionale
  englische Fassung dabei. Jeweils mit Apple-Zeichenlimits annotiert.
- **`design/support.js`** auf neuen dc-runtime-Build aktualisiert (die drei
  Design-Dateien — App-Icon, Mobile v2, Mobile v1 — waren unverändert/bereits im
  Repo, siehe `e8e19b0`).

### eb548d2 · 2026-06-26 · data-collection: CSV-Vorlagen (Sammeln)
- Neuer Ordner **`data-collection/`** mit CSV-Vorlagen zum Orte-Sammeln (Google
  Sheets → später Supabase-Import): `verso_spots_muenchen.csv` (10 Orte + 1
  Beispiel-Event, `published=FALSE`) und `verso_viertel_muenchen.csv` (8 Viertel).
  Spaltenformat deckungsgleich mit dem `Spot`-Typ. Kurze `README.md` erklärt
  Header, Event-Felder (`date_label`/`meeting_point`/`ticket_url`) und Wertelisten.

### 9155f39 · 2026-06-25 · „Fertig"-Leiste über der Tastatur
- Neue **`KeyboardDoneBar`** (iOS `InputAccessoryView`): ein **„Fertig"-Button**
  über der Tastatur, der sie via `Keyboard.dismiss()` wieder einzieht. Gemeinsame
  `KEYBOARD_DONE_ID`; pro Screen einmal gerendert.
- Angebunden an alle Textfelder: **Feed-Suche** (`SearchField`), **Registrierung**
  (E-Mail), **Profil bearbeiten** (Name/Benutzername/Bio), **Passwort ändern**
  (3 Felder) — je `inputAccessoryViewID={KEYBOARD_DONE_ID}`.
- iOS-only (Android rendert nichts; dort schließt die System-Zurück-Taste).

### e8e19b0 · 2026-06-25 · Design: App-Icon-Entwurf ins Repo
- **`design/Verso_App_Icon.dc.html`** ergänzt: App-Icon „v." (italic, DM Serif
  Display) in drei Farbvarianten (Gelb/Schwarz, Schwarz/Gelb, Weiß/Schwarz) +
  Homescreen-Vorschau. Gelb/Schwarz (`#FFE500`/`#1A1A1A`) ist der Favorit.
  Direkt relevant für die iOS-Release-Vorbereitung (1024er-Icon fehlt noch).
- **`design/Verso_Mobile.dc.html`** (frühere v1-Mockup-Variante) als Referenz
  mit abgelegt. v2 bleibt das maßgebliche Design.

### 6db2eef · 2026-06-25 · Pilotstadt München — andere Städte „kommt bald"
- **Pilot-Phase**: `LIVE_CITIES = ["München"]` + `isComingSoon()` in `cities.ts`.
  `CITIES` bleibt vollständig (alle erscheinen in der Hotbar), aber nur München
  ist auswählbar/befüllt. Default-Stadt = München (war Wien).
- **„kommt bald"-Markierung**: neue **`DiagonalStrike`**-Komponente (diagonaler
  Durchstrich, am Pillen-Radius geclippt). In **Stadt-Dropdown** (`CityDropdown`)
  und **Welcome** (`index.tsx`): gedimmt (Opacity), durchgestrichen,
  `pointerEvents="none"` → nicht antippbar; a11y-Label „… — kommt bald".
- **Mock-Data gelöscht**: `spots.ts` nur noch München (10 Spots); `NEIGHBORHOODS`
  nur München (8); `GEHEIMTIPP_BY_CITY` → `Partial`, nur München (Store fällt auf
  München zurück); `MOCK_USER.savedSpotIds` auf München-Spots umgestellt.
- Integritäts-Test bleibt grün (alle Spots ↔ München-Viertel).

### af5226f · 2026-06-25 · Selektions-Haptik auf Kategorie-/Filter-Chips
- **`Pill`** (interaktiv): `selectionAsync` (subtiles „tick") bei jeder Auswahl —
  deckt die Kategorie-Hotbar (Feed/Bezirk/Gespeichert) und die Stadt-Dropdown-
  Auswahl ab.
- **`MapFilterSheet`**: `tapSelection` in `toggleArt`/`toggleAmb` und beim
  Bewertungs-Chip. Gezielt an den Callsites (nicht in `AnimatedChip`), damit es
  nicht mit dem Merken-/Szenen-Haptik doppelt feuert.

### cd574ac · 2026-06-25 · Bezirks-Match exakt statt startsWith
- `bezirk/[name].tsx`: `s.neighborhood.startsWith(name)` → **`=== name`** (die
  Spot-`neighborhood` entspricht seit dem Daten-Umbau exakt dem Viertelnamen).
  Beseitigt die Präfix-Fehlmatch-Falle.
- **Test** ergänzt (jetzt 18): jede Spot-`neighborhood` ist ein gültiges Viertel
  ihrer Stadt → schützt den exakten Match vor künftigen Daten-Tippfehlern.

### 3de9b8e · 2026-06-25 · Stadtname immer volle Größe (Schrumpf-Logik raus)
- Nach dem Entfernen des Liste/Karte-Toggles war die Schrumpf-Maschinerie im
  `CityDropdown` toter, potenziell begrenzender Code. **Komplett entfernt**:
  `center`-Prop, `cityMaxWidth`/`maxWidth`, `adjustsFontSizeToFit`/
  `minimumFontScale`, `CITY_NUDGE`. Der Stadtname rendert jetzt **überall** in
  voller `text-title-md`-Größe (auch lange Namen wie Düsseldorf), nie verkleinert.

### 243a134 · 2026-06-25 · Liste/Karte-Toggle entfernt
- **`ListMapToggle` überall gelöscht** (Feed & Karte) + Komponente entfernt. Die
  Karte bleibt über den **„Karte"-Reiter der Bottom-Nav** erreichbar — der Toggle
  war redundant. `CityDropdown` wird in Feed/Karte jetzt ohne `center` genutzt →
  Stadtname links in voller Größe, Szenen-Toggle rechts.

### 0cd6b6d · 2026-06-25 · Farb-Kontrast: bar/snack vertieft, club reines Orange
- **bar** `#8BC53F → #6FA82B` und **snack** `#F7860D → #D9700A` vertieft
  (besserer Kontrast zum weißen Text, weißer Text bleibt — Nutzer-Wunsch).
- **club** `#FF4500 → #FF7A00` (reines Orange) — klar getrennt von restaurant-Rot
  `#E5392F`. Feiern-Hues jetzt: Lime · Cyan · Orange · Magenta.

### ed3c4e8 · 2026-06-25 · Tests: vitest für die reine Logik
- **vitest** als devDependency (^2.1.9) + `vitest.config.ts` (node-Env, nur
  `src/**`-Logik, RN-frei) + `npm test`-Script.
- **17 Tests** (`src/lib/__tests__/logic.test.ts`): `matchesFilter` (Art/Budget/
  Bewertung/Ambiente), `sortByCategory`, `isEventCategory`, `SCENE_CATEGORIES`
  (überschneidungsfrei), `getOpenState` (inkl. Fenster über Mitternacht +
  `hours`-Override), `distanceLabel`, SPOTS-Integrität (eindeutige ids, Events
  mit dateLabel).

### 943bd9a · 2026-06-25 · reduce-motion respektieren
- Neuer Hook **`lib/useReduceMotion.ts`** (liest `AccessibilityInfo`, live).
- `GeheimtippButton`, `MysticBadge` und der **CityMap-Pin-Puls** zeigen bei
  aktivierter Einstellung „Bewegung reduzieren" eine **ruhige, fixe** Variante
  statt des endlosen `withRepeat`-Pulses.

### 4bc29bb · 2026-06-25 · Politur: Haptik, dynamische Profil-Stat, a11y-Labels
- **Haptik** (`expo-haptics` 15.0.8, neu): `src/lib/haptics.ts` (tapLight/
  tapMedium/tapSelection/notifySuccess, Fehler geschluckt). Eingesetzt bei
  Merken (Detail), Szenen-Toggle, Geheimtipp-Reveal, „Überrasch mich".
- **Profil-Stat** „VIERTEL" nicht mehr hart `8`, sondern `viertelCount` aus
  `NEIGHBORHOODS` für die aktuelle Stadt.
- **a11y**: `accessibilityLabel` an Zurück/Schließen/Teilen/Filter-Buttons
  (Detail, Gespeichert, Settings, Bezirk, Register, Geheimtipp) + `SceneToggle`;
  `AnimatedChip` nimmt jetzt `accessibilityLabel` entgegen.

### ebd1771 · 2026-06-25 · Feed/Gespeichert auf FlatList + Feed-Kopf verschlankt
- **Feed**: von `ScrollView`+`.map` auf **`FlatList`** (virtualisiert). Suche,
  Filter, Kategorie-Bar, „Überrasch mich" und Vibe-Hinweis sitzen jetzt im
  **`ListHeaderComponent`** und scrollen mit weg — nur der Stadt-Kopf bleibt fix,
  also weniger Dauer-Chrome über der ersten Karte.
- **Gespeichert**: ebenfalls **`FlatList`** (Hotbar + Wisch-Hinweis im Header,
  Leerzustand als `ListEmptyComponent`).

### 21f708f · 2026-06-25 · Spot-Detail-Tiefe (offen? · Entfernung · Mini-Karte)
- **`lib/spotMeta.ts`** neu: `getOpenState` (Öffnungsstatus „jetzt geöffnet · bis
  23:00" aus typischen Kategorie-Zeiten; null bei Events) + `distanceLabel`
  (Haversine zum Stadtzentrum, „ca. 1,2 km vom Zentrum") — deterministisch, kein
  GPS-Prompt. Optionales `hours`-Feld am `Spot` (Override) ergänzt.
- **`MiniMap`** neu: stilisierte Detail-Mini-Karte (SVG-Hintergrund + Pin in
  Kategoriefarbe, Expo-Go-fest) — tippen öffnet Google Maps.
- **Spot-Detail**: Status-Zeile (Öffnen-Badge grün/rot + Entfernung) unter dem
  Hook; Mini-Karte unter der Adresse.

### 6a82925 · 2026-06-25 · Onboarding-Personalisierung (Vibes)
- Neuer **`store/interests.tsx`** (In-Memory, max 3 Ambiente-„Vibes").
  `InterestsProvider` in `_layout.tsx` ergänzt; Abmelden in `settings.tsx`
  leert die Vibes mit.
- **Registrierung**: „DEIN VIBE"-Auswahl (bis zu 3 Ambiente-Chips, optional) —
  nur im Register-Modus.
- **Feed**: sortiert Spots, deren Ambiente einen Vibe trifft, **sanft nach oben**
  (stabiler Sort → Kategorie-Reihenfolge bleibt; nichts ausgeblendet) + dezenter
  Hinweis „✦ auf deinen Vibe abgestimmt". Geheimtipp bleibt bewusst kuratiert.

### e880de3 · 2026-06-25 · „Überrasch mich"-Button im Feed
- Neue **`SurpriseButton`**-Komponente (dunkle Pille, gelbe Sparkle,
  Press-Bounce via Reanimated) oben im Feed.
- Zieht einen **zufälligen Ort** aus dem breiten **Stadt+Szene-Pool** (bewusst
  nicht aus der gefilterten Liste) → direkt zum Spot-Detail. Passt zum
  Geheimtipp-Kern; Shake-Geste bleibt separat in der Easter-Egg-Roadmap.

### 5efc5c7 · 2026-06-25 · Feed-Filter: Budget/Bewertung/Ambiente
- **`MapFilterSheet`** bekommt ein **`showArt`**-Prop (Default true). Im Feed
  `showArt={false}`, weil dort die Kategorie-Hotbar die „Art" macht — kein
  doppelter Kategorie-Filter.
- **Feed**: Trichter-Button (SVG) rechts neben der Suche öffnet das Sheet;
  aktiv-Indikator (gelb + Punkt), wenn Budget/Bewertung/Ambiente gesetzt sind.
  `matchesFilter` hängt additiv an der Filterkette (Stadt→Szene→Kategorie→Suche→
  Filter).

### 9e60670 · 2026-06-25 · Feed-Suche (Ort/Viertel/Tag)
- Neue wiederverwendbare **`SearchField`**-Komponente (Pille, SVG-Lupe,
  Clear-Button, Verso-Stil) — über der Kategorie-Bar im Feed.
- Feed filtert jetzt zusätzlich nach **Suchtext**: matcht `name`, `neighborhood`
  und `tags` (case-insensitive, Teilstring) — additiv auf
  Stadt→Szene→Kategorie. Leerzustand zeigt den Suchbegriff.

### cdb4225 · 2026-06-25 · Doku: Verbesserungs-Backlog (Review)
- Neue Sektion **„Verbesserungs-Backlog (Review)"** (nach Phase 2): strukturierte
  Review-Ergebnisse — Quick Wins (Haptik, dynamische Profil-Stat, a11y-Labels,
  reduce-motion), mittlere Features (Suche, Feed-Filter, Shuffle, Onboarding),
  größere Architektur (⚠️ Persistenz, Backend/CMS, Auth) und aktiv geflaggte
  Risiken (ScrollView→FlatList, `startsWith`-Bezirksmatch, Farb-Kontrast,
  Easter-Egg-Auffindbarkeit, fehlende Tests) + empfohlene Reihenfolge.

### ac9f7d3 · 2026-06-25 · Geheimtipp der Woche jetzt pro Stadt
- Der Wochentipp war fix das Wiener „Café Schwarzraum" — auch wenn der Nutzer
  München gewählt hatte. Jetzt **pro Stadt** ein kuratierter Tipp
  (`GEHEIMTIPP_BY_CITY` in `user.ts`, je ein „versteckter" Spot der Stadt).
- **Store city-aware** (`store/geheimtipp.tsx`): liest `useCity()`, liefert
  `spotId`/`weekLabel` der aktuellen Stadt; `abgeholt` wird **pro Stadt** geführt
  (`abgeholtByCity`) → Nav-„?"-Zelle spiegelt den Status der gewählten Stadt,
  `reset()` (Abmelden) leert alle Städte.
- **Screens** (`profil.tsx`, `geheimtipp.tsx`) nutzen jetzt den Store-`spotId`
  statt des statischen Imports. Alle Tipp-`spotId`s sind echte Spots derselben
  Stadt.

### cc0c3f3 · 2026-06-25 · Stadt-Toggle: Stadtname rollt + fadet beim Wechsel
- Beim Stadtwechsel sprang der Name im `CityDropdown` hart um. Jetzt **Roll +
  Fade** (neue Sub-Komponente `CityName`): alter Name rollt nach oben weg und
  fadet aus, neuer rollt von unten herein und fadet ein (`withTiming` 340 ms,
  ROLL 20 px). Abgehender Name liegt absolut über dem neuen → Layout-Breite folgt
  dem neuen Namen; `runOnJS` räumt ihn nach dem Roll auf. Schrumpf-Logik
  (`shrink`) bleibt an den zentrierten Toggle (Feed/Karte) gekoppelt.

### 692b196 · 2026-06-25 · Doku: Monetarisierung (B2C/B2B)
- Neue Sektion **„Monetarisierung (Produkt-Richtung)"**: B2C (Insider-Abo,
  Geschenk-Mitgliedschaft, Stadt-Packs, Affiliate) klar getrennt von B2B
  (verifizierte Orts-Profile, Ticketing-Provision, Verso-Abende, City-Marketing,
  White-Label/Daten). Leitplanke festgehalten: Kuration nie käuflich, keine
  Feed-Werbung.

### c8ca5eb · 2026-06-25 · Viertel an Nutzer-Liste angepasst + Spots für alle Städte
- **`NEIGHBORHOODS` neu** nach der vom Nutzer vorgegebenen Liste (echte, bekannte
  Viertel). Anzahl variiert jetzt pro Stadt (München 8 · Wien 7 · Zürich 5 ·
  Berlin 7 · Hamburg 7 · Frankfurt 6 · Düsseldorf 6) — **NICHT mehr fix 8**.
  Namen enthalten Bezirks-Nummern/Kreis (z. B. „Neubau (7.)", „Kreis 5 (Zürich
  West)").
- **`spots.ts` überarbeitet**: bestehende Spots auf die neuen Viertelnamen
  remapped (Bezirks-Screen matcht via `neighborhood.startsWith(name)`), plus
  **neue Mock-Locations** — vor allem für **Zürich, Hamburg, Frankfurt,
  Düsseldorf** (hatten bisher 0 Spots). Jede Stadt hat jetzt einen eigenen Feed
  mit beiden Szenen (Essen & Feiern). Alle Spot-IDs unverändert (Geheimtipp/
  Saved-Referenzen intakt).
- Konvention angepasst: **Viertelzahl pro Stadt variabel** (folgt der Liste),
  weiterhin event-artige Kategorien (weintasting/sport) mit `dateLabel`/Ticket.

### 23caa67 · 2026-06-25 · Pin-Farben: weißer Text (bar/snack), club Rot-Orange
- **bar** und **snack** Innen-Text von Schwarz (`#1A1A1A`) auf **Weiß** (`#FFFFFF`)
  umgestellt — konsistent weißer Text in den farbigen Ovalen.
- **club** von Blau-Violett auf **Knall-Rot-Orange** (`#FF4500`, weißer Text).

### 966170d · 2026-06-25 · CityDropdown: Stadtname ohne Toggle in voller Größe
- In **„Deine Orte"** war der Stadtname kaum lesbar: `CityDropdown` nutzte das
  `adjustsFontSizeToFit`/`minimumFontScale={0.4}`-Schrumpfen **immer**, obwohl es
  nur für den Fall mit zentriertem Liste/Karte-Toggle (Feed/Karte) gedacht war.
  → Schrumpf-Logik jetzt **an `center` gekoppelt**: ohne zentrierten Toggle
  (Gespeichert/Viertel) wird der Stadtname in **voller `text-title-md`-Größe**
  gerendert (kein `adjustsFontSizeToFit`).

### a2be9eb · 2026-06-25 · Pin-Farben: bar → Lime, club → Blau-Violett
- **bar** auf **Lime** (`#8BC53F`, dunkler Text) und **club** auf **Blau-Violett**
  (`#5B34C4`, weißer Text) gesetzt — „lila vs. blau vs. hellblau" war zu schwer
  zu unterscheiden; jetzt klar getrennt (Lime · Cyan · Blau-Violett · Magenta).

### 84daa12 · 2026-06-25 · Gespeichert: Stadt-Dropdown statt „Deine Orte"
- „Deine Orte"-Überschrift durch **`CityDropdown`** ersetzt (Anzahl-Badge als
  `right`); die Liste filtert jetzt zusätzlich nach der gewählten **Stadt**
  (Stadt → Szene → Kategorie). Topbar behält Zurück + Szenen-Toggle.

### 3427ebe · 2026-06-25 · Neue Pin-Palette + Gespeichert: Szene & Badge
- **`PIN_COLORS` komplett neu**: kräftige, klar getrennte Hues über den Farbkreis
  (Rot · Orange · Grün · Cyan · Indigo · Violett · Magenta) — Essen shiny, Feiern
  kühl; auf der Karte deutlich besser unterscheidbar.
- **Gespeichert**: Anzahl-Badge sitzt jetzt **auf Höhe von „Deine Orte"** (eigene
  Zeile, Grundlinie); **Szenen-Toggle** oben rechts ergänzt → Liste/Hotbar jetzt
  szenenabhängig (`SCENE_FILTERS`/`SCENE_CATEGORIES`), Reset bei Szenenwechsel.

### c710dcf · 2026-06-25 · Kategorien aufgeräumt: event/cooking/techno raus
- **event, cooking, techno** komplett entfernt (Typ, Filter, Labels, Order,
  `PIN_COLORS`, Szene, `ART_OPTIONS`, `EVENT_CATEGORIES`). Alle Event-Spots
  (14) gelöscht, Techno-Spot gelöscht, Cooking-Spot → `weintasting` umgetaggt.
- **weintasting** umbenannt zu Label **„Wein / Cooking"**. Party-Kategorien jetzt:
  Bar · Clubs · Wein / Cooking · Sport.

### 7b9bdb5 · 2026-06-25 · Fix: Gespeichert — Tipp nach Teilen navigiert nicht
- Nach dem Teilen (Swipe rechts) bleibt die Zeile offen; ein Tipp **schließt sie
  nur** (statt zur Spot-Detailseite zu springen). `openRef` via
  `onSwipeableWillOpen/Close`; Row-`onPress` prüft das zuerst.

### 2a5d3aa · 2026-06-25 · Neue Party-Kategorien + pulsierende Pin-Kontur
- **4 neue Kategorien** (Party): Weintasting, Cooking, Techno, Sport — als
  Category-Typ, in `CATEGORY_FILTERS`/`CATEGORY_LABEL`/`CATEGORY_ORDER`,
  `PIN_COLORS` (eigene Farben), `SCENE_CATEGORIES.feiern`, `ART_OPTIONS`. Neue
  Helper `EVENT_CATEGORIES`/`isEventCategory` (event-artige Kategorien zeigen
  Datum/Ticket); `CityMap` + Spot-Detail nutzen das statt `=== "event"`.
  4 Beispiel-Spots (Wien) für die neuen Kategorien ergänzt.
- **Pulsierende Kontur** um JEDEN Karten-Punkt (Ring wächst & fadet endlos,
  `withRepeat`) — in der Farbe des jeweiligen Punkts (`CityMap` `Pin`).

### b390699 · 2026-06-25 · Filter: Art szenenabhängig; Swipe-Griff unten
- **Art** zeigt jetzt nur die Kategorien der **aktuellen Szene** (`useScene` →
  `SCENE_CATEGORIES[scene]`); `karte.tsx` leert den `art`-Filter beim Szenenwechsel
  (sonst filtern szenenfremde Arten alles weg).
- **Swipe-Griff** ist jetzt das **graue Oval unten**: dort nach oben wischen
  schließt das Sheet (GestureDetector vom Header zum Grabber verschoben).

### efba593 · 2026-06-25 · Fix: Karte-Doppeltipp setzt Auswahl mit zurück
- Edge-Case: Doppeltipp (alle an) → Pin wählen → Doppeltipp ließ den gewählten
  Ort/die Karte hängen. Jetzt setzt der Doppeltipp **auch die Einzel-Auswahl**
  zurück (`onClearSelection` von `CityMap` → `setSelected(null)` in `karte.tsx`).

### 35838c5 · 2026-06-25 · Filter-Sheet: Art-Zeilen, Slider-Tap, Swipe-Dismiss
- **ART**: zwei feste Zeilen nach Szene — Z1 Essen (Restaurant/Snack/Café),
  Z2 Feiern (Bar/Club/Event); max. 4 pro Zeile.
- **Budget-`RangeSlider`**: Tippen auf die Schiene zieht den nächstgelegenen
  Regler **animiert** dorthin (Reanimated; Drag bleibt instant). Regler-/Bereich
  via Shared Values + translateX.
- **Sheet**: öffnet animiert (Slide+Fade); **Swipe nach oben** auf der Kopfzeile
  schließt (Gesture.Pan → withTiming raus + Backdrop-Fade). „Orte zeigen"/Backdrop
  nutzen dieselbe Austritts-Animation.

### b66c5e1 · 2026-06-25 · Detail-Merken (Anim + Herzen) · Herz-Richtung
- **Spot-Detail „Merken"**: nutzt jetzt `AnimatedChip` (Crossfade/Pop/Press,
  ungemerkt = weiß/Outline, gemerkt = gelb) + **Herz-Burst** beim Hinzufügen.
- **`QuestionBubbles.burst(x,y,direction)`**: neue Richtung „up"/„down". Herzen
  fallen **nach unten**, wenn die Stelle nah am oberen Rand ist (oberste Feed-
  Karte / Detail-Button) — sonst unsichtbar nach oben. SpotCard wählt die
  Richtung anhand der Bildschirm-Y-Position; Detail misst den Button (`measureInWindow`).

### 7a6aa26 · 2026-06-25 · Auswahl-Animation auch auf den Toggles
- **`ListMapToggle`** (Liste/Karte) und **`SceneToggle`** (🎉/🍴) nutzen jetzt
  ebenfalls `AnimatedChip` pro Hälfte → Crossfade + Pop + Press, konsistent.

### b771f50 · 2026-06-25 · Auswahl-Animation: Crossfade + Pop + Press
- Neue **`AnimatedChip`**: animierte Auswahl (Hintergrund/Border-**Crossfade** via
  `interpolateColor`, **Pop** beim Aktivieren, **Press-Down** beim Drücken).
- Eingesetzt in **`Pill`** (Hotbar Feed/Bezirk/Gespeichert + Stadt-Dropdown),
  **Welcome-Stadt-Chips** (`index.tsx`) und **`MapFilterSheet`** (Art/Bewertung/
  Ambiente) → konsistentes Auswahl-Gefühl überall. Kein neues Paket.

### bdffaa2 · 2026-06-25 · Städte-Reihenfolge: Dropdown + Welcome
- **Dropdown/Hotbar** (`CITIES`): München, Wien, Zürich, Berlin, Hamburg,
  Frankfurt, Düsseldorf.
- **Welcome** (`index.tsx`, `WELCOME_ROWS`): feste 3 Zeilen — Z1 München/Zürich/
  Wien, Z2 Berlin/Frankfurt/Hamburg, Z3 Düsseldorf (eigene Anordnung, unabhängig
  von `CITIES`).

### 701d312 · 2026-06-25 · Zürich als Mock-up-Stadt ergänzt
- **Zürich** in `CITIES` aufgenommen (jetzt 7 Städte) — mit **8 Vierteln**
  (Niederdorf, Langstrasse, Kreis 5, Seefeld, Wiedikon, Enge, Oberstrass,
  Hottingen) und **2 Events** (Seebad-Sunset, Viaduktnacht).
- `CITY_NUDGE` in `CityDropdown`: Zürich = +3 (gleiche Wortlänge wie Berlin).

### cdc9659 · 2026-06-25 · Stadt-Dropdown: animiertes Aufklappen
- `CityDropdown`: Pfeil dreht beim Öffnen von ▾ zu ▴ (Reanimated), und die
  Stadt-Pills **ploppen gestaffelt** per Spring herein (Fade + Scale + leichtes
  Hochsteigen, `DropdownCity`). Konsistent zum Spring-Muster der App.

### 9bb99fb · 2026-06-25 · Feed: Long-Press-Geste signalisieren (Demo + Chip)
- Auf der **ersten** Feed-Karte (einmal pro Session, `feedHintShown` in-memory):
  **(A)** Kreis-Menü ploppt ~1,6 s automatisch auf/zu; **(B)** Hinweis-Chip **oben
  rechts auf der Karte** „Lange drücken: Merken & Teilen" (fadet aus).
  → `SpotCard.tsx` (`hintCandidate`-Prop, im Feed an Index 0).

### 65a1088 · 2026-06-25 · Karte: Doppeltipp-Geste signalisieren (Demo + Chip)
- Beim **ersten** Kartenbesuch (einmal pro Session, `demoShown` in-memory):
  **(A)** alle Pin-Labels ploppen ~1,6 s automatisch auf und wieder zu;
  **(B)** Hinweis-Chip **oben rechts in der Karte** „Doppeltippen zeigt alle Orte"
  (fadet nach ein paar Sekunden aus). Beides nur auf der Fallback-Karte. → `CityMap.tsx`.

### 3946e82 · 2026-06-25 · UI-Feinschliff: Farben, Pfeile, Footer
- **Breitere Pfeile** (neue SVG-Komponente `Arrow`, Breite:Höhe ~2:1) in den
  Viertel-Zeilen und Profil-Listenzeilen statt des schmalen „→"-Glyphs.
- **Kategorie-Farben** (`pinColors.ts`) angepasst: restaurant = Bordeaux
  `#6E1423`; snack = Dunkelgrün `#2E5D3C` + weißer Text; events **umgedreht**
  (schwarzes Oval `#1A1A1A` + gelber Text `#FFE500`).
- Profil-Footer: „MADE IN WIEN" → „MADE IN MUNICH".

### 800eaba · 2026-06-25 · Doku: Verso-Insider Premium-Features
- Neue Sektion „Verso Insider — Premium-Features (geplant)": drei Säulen
  (Geheimtipps · Türöffner · Reise & Reichweite) als Produkt-Richtung festgehalten.

### 2fad320 · 2026-06-25 · Snack-Innenfarbe auf #E8DCC6
- `snack.inner` von `#1A1A1A` (Schwarz) auf `#E8DCC6` (Creme) in `pinColors.ts`.

### 5ace8ef · 2026-06-25 · Listen nach Kategorie sortiert (nicht mehr chaotisch)
- Neuer Helper `sortByCategory` + `CATEGORY_ORDER` in `categories.ts` (Reihenfolge
  Restaurant→Snack→Café→Bar→Club→Event, stabil). Angewandt in **Feed**, **Bezirk**
  und **Gespeichert** → Karten erscheinen nach Art gruppiert.

### 4d218d3 · 2026-06-25 · CityDropdown: lange Städtenamen überlappen Toggle nicht
- Stadt-Name wird bei vorhandenem `center` auf die linke Zone (bis vor den Toggle)
  begrenzt (`maxWidth` aus Fensterbreite) + `adjustsFontSizeToFit`/`numberOfLines=1`
  → lange Namen (z. B. Düsseldorf) verkleinern sich statt unter den Liste/Karte-
  Toggle zu laufen; kurze (Wien) bleiben groß.

### 8c14b97 · 2026-06-25 · SpotCard-Badge in Kategorie-Farbe; Wien-Ausrichtung
- **SpotCard:** Kategorie-Badge oben links jetzt in der **Kategorie-Farbe**
  (`PIN_COLORS`, oval+inner) statt fest Gelb — gilt in Feed & Bezirk-Karten.
- **CityDropdown:** zentriertes Element (Liste/Karte) jetzt auch **vertikal mittig**
  → „Wien" sitzt auf einer Linie mit Liste/Karte & Szene (war ein paar px tiefer).

### b620063 · 2026-06-25 · Gespeichert: Kategorie-Hotbar + Export-Button höher
- **Gespeichert** bekommt eine **Kategorie-Hotbar** (alle Kategorien, Farben pro
  Kategorie) zum Filtern der gemerkten Orte; Leerzustand pro Kategorie ergänzt.
- **„Nach Google Maps exportieren"**-Button 10px höher (bottom 16 → 26) und mit
  `zIndex` in den Vordergrund (überlappt Orte sauber).

### 04d8bb3 · 2026-06-25 · Kategorie-Farben überall (Hotbar + Art-Filter)
- `Pill` nimmt jetzt `activeColor`/`activeTextColor` → aktive Kategorie-Pills in
  **Feed- und Bezirk-Hotbar** erscheinen in ihrer `PIN_COLORS`-Farbe (Alle = Gelb).
- **„Art"-Filter** im `MapFilterSheet`: ausgewählte Arten in Kategorie-Farbe.
- Karten-Pins nutzten die Farben bereits → Farbsystem jetzt durchgängig.

### c1f232e · 2026-06-25 · Gespeichert: „Nach Google Maps exportieren"
- Button **unten rechts** (Google-Logo) im Gespeichert-Screen öffnet
  **`GoogleExportSheet`**: verknüpft (MOCK) ein Google-Konto und „exportiert" die
  gemerkten Orte in eine Google-Maps-Liste **„?"**. Hinweis: echter Export bräuchte
  Backend + OAuth (keine öffentliche Maps-Listen-API) — im MVP bewusst Mock.

### 7330715 · 2026-06-25 · Karten-Pins: zentrale Farben pro Kategorie
- Neue **`src/lib/pinColors.ts`**: pro Kategorie `oval` (Box-Hintergrund),
  `inner` (Text) und `dot` (Punkt). `Pin` in `CityMap` nutzt diese Farben statt
  fester bg-accent/bg-night. Default-Palette: restaurant=Rot, snack=Amber,
  kaffee=Espresso, bar=Pflaume, clubs=Indigo, events=Gelb. (Hex zentral änderbar.)

### fe20f9d · 2026-06-25 · Header: Wien auf Toggle-Höhe (eine Zeile)
- Feed & Karte: **eine kombinierte Kopfzeile** statt zwei. `CityDropdown` nimmt
  jetzt `center` (Liste/Karte-Toggle, exakt zentriert) + `right` (Szene) — „Wien"
  links auf **derselben Höhe** wie die Toggles. Separate Toggle-Zeile (`TopToggles`)
  entfernt → keine Lücke mehr, Inhalt darunter rückt nach.

### 9fc12b8 · 2026-06-25 · Karte: Name antippbar -> Ort wieder verbergen
- `Pin` bekommt `onPress`; **Punkt UND Name** lösen jetzt die Auswahl aus (Toggle
  via `onSelect` in `karte.tsx`). Label ist nur antippbar, wenn sichtbar
  (`pointerEvents` „box-none"/„none"). Umschließende `Pressable` in `CityMap`
  entfernt — `Pin` behandelt Tipps selbst.

### 6f24eef · 2026-06-24 · Szenen-Toggle (Feiern/Essen), zentrierter Liste/Karte-Toggle
- **Szene** (neu): app-weiter Store (`store/scene.tsx`) + `lib/scene.ts` —
  Umschalten zwischen **Feiern** (Bar/Club/Event) und **Essen**
  (Restaurant/Snack/Café). `SceneToggle` (🎉/🍴) oben rechts auf Feed, Karte und
  Bezirk; filtert Liste/Pins und die Kategorie-Hotbar.
- **Header neu** via `TopToggles` (Feed+Karte): Liste/Karte-Umschalter **zentriert
  unter dem Notch**, Szenen-Toggle rechts; Stadt-Dropdown darunter.
- **Bezirk**: bekommt jetzt die **Kategorie-Hotbar** (szenenabhängig) + Szenen-Toggle.
- **SpotCard-Menü:** Herz **toggelt** jetzt (erneut antippen entfernt den Ort wieder).
- **Karte:** ausgewählten Pin **erneut antippen verdeckt** ihn wieder.

### 15303fb · 2026-06-24 · Swipe-Zeilen (Gespeichert), Detail-Share, Karte-Toggle
- **`react-native-gesture-handler` (~2.28.0)** ergänzt; Root in `_layout.tsx` mit
  `GestureHandlerRootView` umschlossen (+ `import "react-native-gesture-handler"`).
- **Gespeichert:** Zeilen sind jetzt **wischbar** (`Swipeable`): nach **links →
  Löschen** (rot), nach **rechts → Teilen** (`Share`, gelb). Wisch-Hinweis ergänzt.
- **Spot-/Event-Detail:** **Share-Button** (↗) im Hero-Kopf neben „Merken".
- **Karte-Doppeltipp ist jetzt ein Toggle**: zweiter Doppeltipp blendet alle
  Labels wieder aus (`popSeed` → `popAll`-Boolean).

### ad9e07c · 2026-06-24 · SpotCard-Long-Press: Pinterest-Kreis-Menü
- Long-Press öffnet jetzt ein **aufploppendes Kreis-Menü** (`SpotActionMenu`):
  **Merken** (♥ + Herz-Burst) und **Teilen** (↗ → systemeigenes `Share`-Sheet,
  iMessage/WhatsApp/…) — statt nur des Herz-Bursts.

### 7eb87e5 · 2026-06-24 · Easter Eggs: SpotCard-Long-Press + Karte-Doppeltipp
- **SpotCard Long-Press** → merkt den Spot + Herz-Bubble-Burst an der Druckstelle
  (`QuestionBubbles glyph="♥"`). `QuestionBubbles` nimmt jetzt `glyph/color/textColor`.
- **Karte Doppeltipp** (leere Fläche) → alle Pin-Labels ploppen gleichzeitig auf
  (`popSeed` in `CityMap` → `flash` je `Pin`). Fallback-Karte (Expo Go).

### 07e6c55 · 2026-06-24 · Profil: Abstände 21px, Einladen-Text-Umbruch
- Einladen-Karte & Footer jetzt **21px** Abstand (mt-4=16 → `marginTop: 21`),
  beide gleich.
- Einladen-Untertitel: manueller Umbruch → „Gib den Geheimtipp weiter." steht
  in eigener Zeile.

### ded6c4b · 2026-06-24 · CLAUDE.md: Easter-Eggs-Sektion
- Neue prominente Sektion **„Easter Eggs 🥚"** (nach Geheimtipp-Mechanik):
  Konventionen, eingebautes Egg („verso"-Bubbles) + Ideen-Roadmap. Regel
  etabliert: jedes neue Egg dort dokumentieren.

### ff879f7 · 2026-06-24 · Profil-Footer: beide Abstände halbiert (mt-4)
- Einladen-Karte UND Footer jetzt **`mt-4`** (vorher mt-8) — beide Abstände
  gleich und halbiert.

### e6d8464 · 2026-06-24 · Profil-Footer: Abstand & Zitat einzeilig
- Footer-Abstand `mt-10` → `mt-8` = derselbe Abstand wie die Einladen-Karte.
- Zitat steht jetzt in **einer Zeile** (`numberOfLines={1}` + `adjustsFontSizeToFit`,
  `max-w` entfernt) statt umzubrechen.

### e7e854c · 2026-06-24 · Welcome: „?"-Bubble-Easter-Egg auf „verso"
- Neue Komponente **`QuestionBubbles`** (ref-API `burst(x,y)`): gelbe „?"-Bubbles
  steigen per Reanimated von der Tipp-Stelle auf (Zufalls-Drift/Höhe/Größe/Dauer,
  Ein-/Ausfaden), entfernen sich nach dem Aufstieg selbst.
- Welcome (`index.tsx`): „verso"-Wortmarke ist jetzt `Pressable`; `onPressIn`
  löst über `pageX/pageY` einen Bubble-Schwung aus. Overlay als oberste Ebene
  (pointerEvents none). Greift nur hier = vor der Registrierung.

### 1873343 · 2026-06-24 · Profil: Einladen-Karte + stiller Footer
- Den White Space unter „Vorschlag machen" gefüllt: **„Freund einladen"-Karte**
  (dunkel, öffnet das systemeigene `Share`-Sheet — kein neues Paket, Expo-Go-fest)
  + **stiller Marken-Footer** (Wortmarke `Brand`, „VERSION 0.1 · MADE IN WIEN",
  poetischer Einzeiler).

### 3820ec6 · 2026-06-24 · Karte: Event-Label als abgerundetes Rechteck
- Event-Pop-up-Label in `CityMap.tsx`: Radius von `rounded-card` (24px) auf
  **`rounded-button` (16px)** + etwas mehr Padding (`px-3.5 py-2`). Das große
  Oval wirkte auf der kleinen Name+Datum-Box gequetscht; das Rechteck mit
  abgerundeten Ecken fasst den Infogehalt besser. Orts-Pille bleibt Pille.

### c2984bf · 2026-06-24 · „???"-Badge öffnet Insider-Pop-up
- Neuer modaler Screen **`app/insider.tsx`** im Geheimtipp-Pop-up-Stil (dunkel,
  drehende Squiggle ums „???"): sagt, das Feature ist **noch nicht verfügbar**,
  Button **„Zurück zum Profil"** (+ ✕). Als Modal (`slide_from_bottom`) im Root-
  Stack registriert.
- **`MysticBadge`** ist jetzt antippbar → öffnet `/insider`.

### 889be13 · 2026-06-24 · Daten: 8 Viertel + ≥2 Events pro Stadt
- **`cities.ts`:** jede der 6 Städte hat jetzt **genau 8 Viertel** (Wien/Berlin/
  München aufgestockt; Frankfurt/Düsseldorf/Hamburg neu, je 8) — mit poetischen
  Einzeilern im Verso-Ton. `CITIES_WITH_CONTENT` = alle Städte (`[...CITIES]`).
- **`spots.ts`:** **mindestens 2 Events pro Stadt** — 10 neue Events für Berlin,
  München, Frankfurt, Düsseldorf, Hamburg (Wien hatte schon 2). Volle Felder
  inkl. lat/lng, `dateLabel`, `meetingPoint`, `ticketUrl`.
- Konvention notiert: **8 Viertel/Stadt**, **≥2 Events/Stadt**.

### 20c8203 · 2026-06-24 · Profil: Abstand zum Notch = „Wien"-Abstand im Feed
- Profil-Kopf-`paddingTop` 60 → **14**: „PROFIL" hat jetzt denselben Abstand zum
  Notch wie „Wien" im Feed (dort `pt-2` 8 + Zentrierung in der 42er-Zeile 6 = 14).

### 5fc9670 · 2026-06-24 · Profil: „???"-Badge mystisch, Insider-Box raus
- **„???"-Badge** im Profil-Kopf als neue Komponente **`MysticBadge`**: schwarze
  Pille, gelbe „???", **sanft gelb pulsierende Kontur** (Reanimated
  `interpolateColor`) — im Stil des früheren Insider-Sterns.
- **Verso-Insider-Box komplett entfernt** (`InsiderTeaser` aus dem Profil und
  die Komponenten-Datei gelöscht).
- Profil-Kopf-Höhe (`paddingTop: 60`) **erneut geprüft**: „PROFIL"/Name liegen
  bündig auf Höhe von „GESPEICHERT"/„Deine Orte" (beide inset+60, gleiches
  Label-Styling + paddingHorizontal 24).

### 53a1551 · 2026-06-24 · Profil: „???"-Badge + Kopf auf Höhe von „Deine Orte"
- Badge unter dem Namen: „NOCH KEIN INSIDER" → **„???"** (mystisch, kurz).
- Profil-Kopf („PROFIL" + Name) startet jetzt auf **gleicher Höhe** wie
  „GESPEICHERT"/„Deine Orte" im Gespeichert-Screen: ScrollView-`paddingTop`
  8 → **60** (gleicht die fehlende Topbar aus: dort Topbar 48 + paddingTop 12).

### c25c748 · 2026-06-24 · Profil: Geheimtipp ohne Pop-up; Insider-Box mystisch
- **Geheimtipp-Karte** im Profil führt jetzt **direkt zum Spot-Detail** (statt
  das Lade-/Reveal-Pop-up `/geheimtipp` zu öffnen) — der Tipp wird stationär
  gezeigt. Name + Hook stehen weiterhin auf der Karte selbst.
- **Verso-Insider-Box** neu als **`InsiderTeaser`**: dunkel + mystisch
  (Sternchen, sanft pulsierender Schimmer via Reanimated), Label
  „DEMNÄCHST · NEUE VERSION" — signalisiert ein verborgenes, kommendes Feature
  (führt bewusst nirgendwohin, kein Pfeil mehr).

### 92b457b · 2026-06-24 · Feed: Liste/Karte-Toggle; Nav: Profil-Icon statt „DU"
- Feed-Kopf zeigt jetzt den **Liste/Karte-Umschalter** (oben rechts) statt des
  Profil-Avatars. Toggle in neue Komponente **`ListMapToggle`** (`active`-Prop)
  ausgelagert und auf Feed (`liste`) UND Karte (`karte`) wiederverwendet.
- Bottom-Nav: der „profil"-Reiter zeigt jetzt das **Initialen-Icon** statt des
  Text-Labels „DU".
- Neue Komponente **`InitialsAvatar`** (Initialen-Kreis, eine Quelle für
  Feed-Größe und Nav-Größe). **`DuAvatar` entfernt** (verwaist: Initialen → 
  `InitialsAvatar`, Geheimtipp-Zugang → `GeheimtippButton` in der Nav).

### 9a14f53 · 2026-06-24 · Navigation: horizontaler Slide statt Fade
- Root-`Stack` in `app/_layout.tsx`: `animation` von `fade` auf
  **`slide_from_right`** umgestellt — neue Screens kommen von rechts herein
  (Inhalt wandert nach links), Zurück gleitet nach rechts hinaus. `gestureEnabled`
  aktiviert (Wischen vom linken Rand = zurück).
- `geheimtipp`-Modal bleibt Pop-up, aber jetzt `slide_from_bottom` (statt `fade`),
  damit es sich klar vom seitlichen Screen-Slide abhebt.

### 8e70892 · 2026-06-24 · Karte: Events optisch abgesetzt (gelber Punkt + Datum)
- `Pin` in `CityMap.tsx` unterscheidet jetzt Events (`category === "event"`):
  - **Punkt:** gelb mit schwarzer Kontur (statt schwarz mit heller Kontur).
  - **Label:** schwarze Box (`bg-night`) mit gelbem Namen + gelbem Datum
    (`dateLabel`) — Orte behalten die gelbe Box mit schwarzem Namen.
  - Events nutzen dieselbe Pop-Animation (Label-Wrapper ist der animierte View).

### 2a68016 · 2026-06-24 · Karte: gelbes Label „ploppt" beim Auswählen auf
- `Pin` in `CityMap.tsx` animiert das gelbe Orts-Label jetzt per Reanimated-Spring
  (`pop`-SharedValue 0→1: Scale 0.6→1, steigt 8px hoch, blendet ein) statt es hart
  per `active ?` ein-/auszuschalten. Beim Abwählen federt es ruhig per `withTiming`
  zurück. Label bleibt gemountet (inaktiv: Opacity 0 + `pointerEvents="none"`).

### c4a3e62 · 2026-06-22 · Geheimtipp-Pop-up auf Vollbild
- Beide Phasen füllen jetzt den ganzen Screen (Vollbild-`SafeAreaView`), kein
  cremefarbener Rand mehr. Karten-Wrapper (cardW/cardH) entfernt.

### 47341b7 · 2026-06-22 · Geheimtipp-Pop-up größer + Grau im Reveal weg
- Reveal-Phase hatte noch den grauen Backdrop → jetzt auch Creme (`bg-screen`)
  + Schatten (war beim früheren Fix wegen Einrückung übersehen worden).
- Beide Karten größer: 0.84×0.8 → **0.92×0.9** des Screens; Reveal-Bild 236.

### b73bb93 · 2026-06-22 · Karte: Pin verrutscht nicht mehr beim Auswählen
- Das gelbe Label liegt jetzt **absolut über dem Punkt** (vorher im Layout
  darüber → Punkt wurde nach unten gedrückt). Punkt bleibt stationär.

### 23b8db1 · 2026-06-22 · Karte-Filter wirken + Budget-Slider ziehbar
- **Budget-Range-Slider** mit zwei ziehbaren Reglern (`RangeSlider`,
  PanResponder) — funktioniert in Expo Go.
- Filter **wirken jetzt wirklich**: `lib/mapFilter.ts` filtert die Pins UND die
  „X Orte zeigen"-Anzahl nach Art/Budget/Bewertung/Ambiente (ODER innerhalb,
  UND zwischen Gruppen). Schnell-Chips oben zeigen aktive Gruppen.

### a618e78 · 2026-06-22 · Karte: Pin-Auswahl, Filter-Sheet
- Pins sind antippbar -> erst dann erscheint die Spot-Karte (vorher immer
  sichtbar). Karte sitzt über der Nav (Safe-Area + Nav-Höhe), kein Überlappen.
- Filter-Chips größer; neuer **FILTER ▾**-Button öffnet das neue
  **MapFilterSheet** (Art / Budget / Bewertung / Ambiente, nach Mockup 04b).

### 2794672 · 2026-06-22 · Mapbox hinter der Karte (mit Expo-Go-Fallback)
- `@rnmapbox/maps` integriert: neue Komponente `CityMap` rendert im **Dev Build**
  (mit Token) die echte Karte mit Markern an den Spot-Koordinaten; in **Expo Go**
  automatisch die stilisierte Fallback-Karte.
- `app.json` → `app.config.js` (Mapbox-Download-Token aus Env, Plugin ergänzt).

### 984c932 · 2026-06-22 · Geheimtipp-Pop-up: kein grauer Backdrop
- Abgedunkelter (grauer) Hintergrund raus → Karte sitzt jetzt auf dem
  Creme-App-Hintergrund (`bg-screen`) mit weichem Schatten.

### 7160d3f · 2026-06-22 · Viertel klickbar, Karte, Nav 5→4, Pop-up
- Viertel-Zeilen klickbar → neuer **Bezirks-Screen** (`bezirk/[name]`) mit den
  Spots des Viertels.
- **Kartenansicht** gebaut: stilisierte Karte (Pins, schwebende Spot-Karte,
  Filter-Optik) — läuft in Expo Go; echte Karte bleibt Phase 2.
- Bottom-Nav: nach dem Reveal verschwindet das „?" → **4 statt 5** Zellen,
  die sich gleichmäßig neu verteilen (`abgeholt` steuert die Zellenzahl).
- Geheimtipp-Pop-up: Lade- und Reveal-Phase als **zentrierte Karte (~80%)**
  auf abgedunkeltem Hintergrund → deutlich weniger Vollflächen-Gelb.

### 9cea515 · 2026-06-22 · Profil bearbeiten + Passwort ändern
- Zwei neue UI-Screens (`profil-bearbeiten`, `passwort-aendern`) nach Mockup
  07c/07d, aus den Einstellungen verlinkt.
- Feed: Weiß unten in der Kategorie-Bar reduziert (paddingBottom 34 → 14).

### 4351372 · 2026-06-22 · CityDropdown: feste Zeilenhöhe
- Kopfzeile in `CityDropdown` hat jetzt feste Höhe (42) → „Wien" sitzt auf
  Feed/Viertel/Karte exakt gleich hoch, egal ob rechts ein Element steht.

### ca19ee5 · 2026-06-22 · Detail-Hook, einheitliches Stadt-Dropdown
- Spot-Detail: ADRESSE-Zeile an der Grundlinie ausgerichtet (`items-baseline`);
  Hook jetzt **kursiv + unterstrichen** statt gelber Box.
- Geheimtipp-Lade-Screen: Umrandung ums „?" ist jetzt die **krummlinige
  Squiggle** (SVG, dreht sich) — wie in der Nav.
- Neue Komponente **`CityDropdown`**: identischer Stadt-Kopf mit Dropdown auf
  Feed, Viertel und Karte.

### efc75e3 · 2026-06-22 · Feed: Kategorie-Bar in der Höhe gestreckt
- Weiß jetzt INNERHALB der Kategorie-Bar (Scroll-Content `paddingBottom` 34)
  statt nur Abstand zur Liste — die Bar wirkt höher.

### 28f9d72 · 2026-06-22 · UI-Runde: Nav-Puls, Reveal zentriert, Avatar-Initialen
- Feed: noch mehr Luft unter der Kategorie-Bar (paddingTop 44).
- Bottom-Nav: Aktiv-Pill auf **75%** Zellenbreite; „?" hat eine **pulsierende
  Squiggle-Umrandung** (`GeheimtippButton`, SVG + Reanimated-Puls).
- Geheimtipp-Reveal: Café **vertikal zentriert** (weniger leeres Gelb).
- Gespeichert: Überlappung „GESPEICHERT"/„Deine Orte" behoben (lineHeight 40).
- Feed-Avatar: zeigt **Initialen (LH) in Schwarz** statt „Du" in Grau.

### 2423639 · 2026-06-22 · Spot-Detail füllt den Screen
- Inhalts-Sheet `flex-1` + Spacer → CTAs sitzen unten, kein leeres weißes
  Feld mehr. Hero-Bild auf 400px erhöht. ScrollView `flexGrow:1`.

### 67ab3f7 · 2026-06-22 · Mehr Mocks, OpenTable-Button, Nav-Slider
- Spot-Detail: Überlappung Meta-Zeile/Name behoben (lineHeight 48);
  **OpenTable-„Tisch reservieren"** jetzt bei allen Orten (nicht nur mit
  `reserveUrl`).
- Mock-Daten: je **+4 Spots** für Berlin und München (jetzt 7/7, Wien 12).
- Bottom-Nav: 5 gleich breite Zellen; gelber Aktiv-Pill auf **50%**
  Zellenbreite, **gleitet smooth** (Reanimated) statt zu springen.

### dd96a5d · 2026-06-22 · Auth-Logos hinter den Text
- Apple-/Google-Logo steht jetzt **nach** „Weiter mit Apple/Google" (vorher
  davor). Logos via `react-native-svg` — braucht `npm install` nach Pull.

### 3ee5aaa · 2026-06-22 · Welcome: Stadt-Chips kugelsicher zentriert
- Text in den Stadt-Chips exakt zentriert (lineHeight, textAlign,
  `includeFontPadding:false` für Android). Liste hat bereits 6 Städte.

### 835e671 · 2026-06-22 · Feed: mehr Abstand unter Kategorie-Bar
- Klarere Trennung zwischen Kategorie-Pills und Karten (Liste `paddingTop` 28,
  Pills `mt-5`).

### cb2096d · 2026-06-22 · UI-Feinschliff nach Nutzer-Feedback
- Feed: mehr Abstand unter den Kategorie-Pills; Stadt-Dropdown jetzt
  **horizontal** (scrollbare Pill-Reihe statt vertikaler Liste).
- Welcome: Stadtnamen in den Chips zentriert; Städte-Liste erweitert
  (`CITIES` = Wien/München/Berlin/Frankfurt/Düsseldorf/Hamburg,
  `CITIES_WITH_CONTENT` markiert die mit Inhalten).
- Registrierung: echte **Apple-/Google-Logos** (`react-native-svg`,
  neue Komponente `Logos.tsx`).
- Geheimtipp-Reveal: Überlappung Label/Name behoben (Zeilenhöhe/Abstand).
- Viertel: Leerzustand für Städte ohne Bezirke.

### 241b3e5 · 2026-06-22 · CLAUDE.md hinzugefügt
- Projektgedächtnis angelegt: Überblick, Tech-Stack/Versionen, Stolperfallen,
  Architektur, Konventionen, Geheimtipp-Mechanik, Stand, Changelog.
- Konvention etabliert: diese Datei bei **jedem** Commit mitpflegen.

### 8bbf56b · 2026-06-22 · Geheimtipp-Mechanik (Reanimated) + v2-Design-Treue
- Geheimtipp-Store (`abgeholt`), „?"-Badge am Du-Avatar (Reanimated-Spring).
- Lade-Screen: Spin-Ring + Lade-Balken, Auto-Reveal; Reveal: Throb +
  antippbares Bild → Spot-Detail. Alles via Reanimated.
- Einstellungen: gruppierte Karten, Toggles, **Abmelden** (Reset → Welcome).
- Design-Treue: Welcome (92px-Wortmarke, flächiges gelbes Band), Bottom-Nav
  (schwebend, gelber Aktiv-Pill, „?"-Kreis), Hook-Highlight (Inline-Marker),
  Streifen-Textur als Komponente. Mockup unter `design/` ins Repo gelegt.

### acab460 · 2026-06-22 · Fix: React-Versions-Konflikt
- react/react-dom/react-native exakt gepinnt (19.1.0 / 19.1.0 / 0.81.5),
  behebt „Incompatible React versions".

### 95431b7 · 2026-06-22 · Phase 1: Verso Mobile MVP (Expo + NativeWind)
- Projekt-Setup (Expo SDK 54, Expo Router, NativeWind 4.1, Hanken Grotesk,
  zentrale Design-Tokens).
- 18 Mock-Spots/Events (Wien, Berlin, München), wiederverwendbare Komponenten,
  alle Phase-1-Screens, Merken-/Stadt-Stores.
