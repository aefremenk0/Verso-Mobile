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
                          MapFilterSheet (Filter-Panel; `showArt`-Prop —
                          im Feed aus, da Hotbar die Art macht),
                          SearchField (Such-Pille mit SVG-Lupe + Clear),
                          SurpriseButton („Überrasch mich"; Sparkle + Press-Bounce),
                          MiniMap (stilisierte Detail-Mini-Karte, SVG, tippbar),
                          RangeSlider (Budget, PanResponder)
  lib/mapFilter.ts        Filter-Typ + matchesFilter (Art/Budget/Bewertung/Ambiente)
  lib/pinColors.ts        Karten-Pin-Farben pro Kategorie (oval/inner/dot)
  lib/spotMeta.ts         Detail-Tiefe: getOpenState (Öffnungsstatus) +
                          distanceLabel (Entfernung zum Stadtzentrum)
  lib/scene.ts            Szene (feiern/essen): Kategoriengruppen + Pills
  store/scene.tsx         aktuelle Szene (Feiern vs. Essen), app-weit

app.config.js             Expo-Config (ersetzt app.json; Mapbox-Token via Env)
  data/                   types.ts, spots.ts (Mock-Orte + Events, ≥2/Stadt),
                          cities.ts (Viertel pro Stadt, Anzahl variabel),
                          categories.ts,
                          user.ts  (kein Backend)
  store/                  city.tsx, saved.tsx, geheimtipp.tsx,
                          interests.tsx (Onboarding-Vibes, max 3)  (React-Context,
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

## Verbesserungs-Backlog (Review 2026-06-25)

> Strukturierte Review-Ergebnisse (Features · Design · UI · Risiken). Sortiert
> nach Aufwand/Wirkung. **⚠️ = aktiv aufpassen / latente Falle.** Beim Abarbeiten
> Punkte hier abhaken und in den Changelog verschieben.

### 🟢 Quick Wins (billig, hohe Wirkung)
- **Haptik** (`expo-haptics`, Expo-Go-fest) bei Merken, Szenen-Toggle,
  Geheimtipp-Reveal — lässt die App sofort „teuer" wirken.
- **⚠️ Profil-Stat „8 VIERTEL" ist hart codiert** (`profil.tsx`, `n: 8`), obwohl
  die Viertelzahl jetzt pro Stadt variiert (München 8, Wien 7, Zürich 5 …).
  → dynamisch aus `NEIGHBORHOODS` für die aktuelle Stadt ableiten.
- **⚠️ Icon-Buttons ohne `accessibilityLabel`** (✕ / → / ♥ / ←) — für Screenreader
  unbeschriftet. Schnell nachrüstbar.
- **`reduce motion` respektieren** (`AccessibilityInfo.isReduceMotionEnabled`):
  ruhigere Varianten für Puls/Roll/Bubbles bei aktivierter iOS-Einstellung.

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
- **⚠️⚠️ Persistenz fehlt** — *wichtigster Punkt.* Alle Stores (`saved`, `scene`,
  `city`, `geheimtipp`) sind rein in-memory → App schließen = gemerkte Orte,
  abgeholter Tipp, gewählte Stadt sind weg. Lösung: `AsyncStorage`/MMKV hinter
  die Stores. Überschaubarer Aufwand, riesiger gefühlter Unterschied.
- **⚠️ Kein Backend / Daten nur als Mock**: Orte ändern sich, aber die Liste
  steckt im App-Bundle → Aktualisieren nur per App-Store-Update. (= frühere
  Google-Sheets/CMS-Diskussion.)
- **⚠️ Auth ist nur UI** (`register` → Feed). Für Sync/Personalisierung später
  echtes Auth nötig.

### ⚠️ Aktiv geflaggte Risiken / latente Fallen
1. **Listen ohne Virtualisierung**: Feed/Gespeichert nutzen `ScrollView` + `.map`.
   Bei wachsenden Daten speicher-/scroll-lastig → auf **`FlatList`** umstellen.
2. **Bezirks-Zuordnung per `startsWith(name)`** (`bezirk/[name].tsx`): fragil,
   wenn je zwei Viertel **derselben Stadt** existieren, bei denen ein Name Präfix
   des anderen ist (matcht beide). Aktuell konfliktfrei → besser exakter Match
   oder `neighborhoodId`.
3. **Farb-Kontrast & Verwechslung**: weißer Text auf **Lime (`bar`)** und
   **Orange (`snack`)** ist WCAG-grenzwertig (bei Sonne schwer lesbar);
   **`club #FF4500` ≈ `restaurant #E5392F`** (nur durch Szene getrennt). Im Auge
   behalten, falls Lesbarkeit/Unterscheidung leidet.
4. **Easter Eggs vs. Auffindbarkeit**: versteckte Gesten sind charmant, aber
   Kernaktionen (Merken/Teilen) müssen **auch** ohne Geste erreichbar bleiben
   (sind sie im Detail — so halten).
5. **Keine Tests** (anders als Schwester-Projekt „Lügen"): reine Helfer
   (`mapFilter`, `sortByCategory`, `scene`, künftige Persistenz) sind leicht
   testbar → vor dem nächsten Daten-Umbau einziehen.

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
```

---

## Changelog

> Neueste Einträge oben. Format: `Hash · Datum · Titel` + Stichpunkte.
> (Der Hash des jeweils neuesten Eintrags wird im Folge-Commit nachgetragen.)

### (dieser Commit) · 2026-06-25 · Spot-Detail-Tiefe (offen? · Entfernung · Mini-Karte)
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
