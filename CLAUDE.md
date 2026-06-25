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

Der Nutzer hat **wenig App-Erfahrung** → Code aufgeräumt und **auf Deutsch
kommentiert** halten, Entscheidungen kurz erklären.

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
| @rnmapbox/maps | ^10.3.1 | echte Karte, **NUR Dev Build** (nicht Expo Go) |
| @expo-google-fonts/hanken-grotesk | ^0.4.x | |
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
6. **Mapbox (`@rnmapbox/maps`) läuft NICHT in Expo Go.** `src/components/CityMap.tsx`
   lädt Mapbox per `require` nur, wenn (a) NICHT Expo Go
   (`Constants.executionEnvironment`) und (b) `EXPO_PUBLIC_MAPBOX_TOKEN` gesetzt
   ist — sonst stilisierte Fallback-Karte. Für die echte Karte braucht es einen
   **Dev Build** + zwei Tokens: `MAPBOX_DOWNLOAD_TOKEN` (sk.*, Build-Zeit, in
   `app.config.js`) und `EXPO_PUBLIC_MAPBOX_TOKEN` (pk.*, Laufzeit).
7. **Config liegt in `app.config.js`** (nicht mehr `app.json`), damit der
   geheime Mapbox-Token aus der Umgebung kommt.
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
    karte.tsx             04 Kartenansicht (stilisierte Karte, Pins, Phase 1)
    profil.tsx            07 Profil
  spot/[id].tsx           03 Spot- UND Event-Detail (eine Route)
  bezirk/[name].tsx       Bezirks-Detail (Spots eines Viertels)
  gespeichert.tsx         06 Gespeichert
  geheimtipp.tsx          08 Geheimtipp (Laden -> Reveal, Reanimated, modal)
  insider.tsx             „Verso Insider"-Hinweis (Feature kommt noch, modal)
  settings.tsx            07 Einstellungen (+ Abmelden)
  profil-bearbeiten.tsx   07c Profil bearbeiten (UI)
  passwort-aendern.tsx    07d Passwort ändern (UI)

src/
  components/             Brand, Arrow (breiter SVG-Pfeil), ImagePlaceholder,
                          StripeTexture, HookHighlight,
                          Pill, Button, SpotCard, BottomNav, InitialsAvatar,
                          AnimatedChip (Auswahl: Crossfade+Pop+Press),
                          (Initialen-Kreis), ListMapToggle (Liste/Karte oben),
                          CityDropdown (Stadt-Kopf; center+right-Props für
                          zentrierten Toggle & rechtes Element), Logos,
                          GeheimtippButton (pulsierende Squiggle-"?"),
                          MysticBadge ("???"-Badge, pulsierende Kontur),
                          QuestionBubbles (aufsteigende Bubbles, konfig. Glyph),
                          SpotActionMenu (Long-Press-Kreis-Menü: Merken/Teilen),
                          SceneToggle (Feiern/Essen oben rechts),
                          CityMap (Mapbox + Expo-Go-Fallback),
                          MapFilterSheet (Karte-Filter-Panel),
                          RangeSlider (Budget, PanResponder)
  lib/mapFilter.ts        Filter-Typ + matchesFilter (Art/Budget/Bewertung/Ambiente)
  lib/pinColors.ts        Karten-Pin-Farben pro Kategorie (oval/inner/dot)
  lib/scene.ts            Szene (feiern/essen): Kategoriengruppen + Pills
  store/scene.tsx         aktuelle Szene (Feiern vs. Essen), app-weit

app.config.js             Expo-Config (ersetzt app.json; Mapbox-Token via Env)
  data/                   types.ts, spots.ts (Mock-Orte + Events, ≥2/Stadt),
                          cities.ts (8 Viertel pro Stadt), categories.ts,
                          user.ts  (kein Backend)
  store/                  city.tsx, saved.tsx, geheimtipp.tsx  (React-Context,
                          alles in-memory)
  lib/maps.ts             Deep-Links Apple/Google Maps
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
- **Schrift:** jeder Hanken-Schnitt ist eine eigene `font-hk-*`-Klasse
  (RN hat pro Gewicht eine Datei). Wortmarke = `font-hk-extrabold-italic`.
- **Animationen:** ausschließlich `react-native-reanimated`
  (`useSharedValue` + `withTiming`/`withRepeat`/`withSpring`). Niemals
  CSS-`@keyframes` aus dem Mockup übernehmen — nur als Referenz lesen
  (`verso-spin` 9s, `verso-load` 1.3s, `verso-throb` 1.5s, `verso-pulse`).
- **Daten:** alles Mock in `src/data/`. Kein Login/Backend/DB im MVP.
- **Kommentare auf Deutsch**, knapp, erklären *warum*.
- **Vor jedem Commit:** `npx tsc --noEmit` (Typecheck) und idealerweise
  `npx expo export --platform ios --output-dir /tmp/x` (Bundle baut?).

---

## Geheimtipp-Mechanik (Kern-Feature)

Einmal pro Woche darf der Nutzer einen kuratierten Spot „abholen".
- Status in `src/store/geheimtipp.tsx` (`abgeholt`, in-memory).
- Solange nicht abgeholt: gelbes **„?"-Badge** am „Du"-Avatar im Feed
  (`DuAvatar.tsx`, Auftritt via `withSpring`). Tippen → `geheimtipp`.
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

## Aktueller Stand

**Phase 1 (MVP) — fertig**, läuft komplett in Expo Go. Alle Screens 01–08
(Welcome, Registrierung, Feed, Spot-/Event-Detail, Stadt-Übersicht,
Gespeichert, Profil, Einstellungen, Geheimtipp). Karte-Tab = Platzhalter.

## Nächste Schritte (Phase 2 — erst nach Abnahme)

- Echte **Kartenansicht** mit `react-native-maps` (→ Dev Build, nicht Expo Go):
  Liste/Karte-Toggle, custom Map-Style, gelbe Pins.
- **Karte-Filter-Sheet**: Art / Budget / Bewertung / Ambiente (Ambiente als
  Multi-Select, ODER innerhalb / UND zwischen Gruppen).
- (erledigt) ~~Profil bearbeiten & Passwort ändern~~ — UI-Screens stehen.

---

## Befehle

```bash
npm install            # Abhängigkeiten (nach git pull, v.a. bei neuen Libs)
npx expo start         # Dev-Server, QR mit Expo Go scannen
npx expo start -c      # mit geleertem Cache (bei komischen Fehlern)
npx expo start --tunnel  # falls WLAN zickt
npx tsc --noEmit       # Typecheck
```

---

## Changelog

> Neueste Einträge oben. Format: `Hash · Datum · Titel` + Stichpunkte.
> (Der Hash des jeweils neuesten Eintrags wird im Folge-Commit nachgetragen.)

### (dieser Commit) · 2026-06-25 · Gespeichert: Stadt-Dropdown statt „Deine Orte"
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
