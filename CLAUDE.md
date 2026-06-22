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
| react-native-svg | **15.12.1** (exakt) | Logos/Vektorgrafik, in Expo Go |
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
6. **Keine nativen Module, die Expo Go nicht kennt** (z. B.
   `react-native-maps`). Echte Karte erst in Phase 2 über einen Dev Build.

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
    karte.tsx             Karte (Phase-1-Platzhalter)
    profil.tsx            07 Profil
  spot/[id].tsx           03 Spot- UND Event-Detail (eine Route)
  gespeichert.tsx         06 Gespeichert
  geheimtipp.tsx          08 Geheimtipp (Laden -> Reveal, Reanimated, modal)
  settings.tsx            07 Einstellungen (+ Abmelden)

src/
  components/             Brand, ImagePlaceholder, StripeTexture, HookHighlight,
                          Pill, Button, SpotCard, BottomNav, DuAvatar
  data/                   types.ts, spots.ts (18 Mocks), cities.ts,
                          categories.ts, user.ts  (kein Backend)
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

## Aktueller Stand

**Phase 1 (MVP) — fertig**, läuft komplett in Expo Go. Alle Screens 01–08
(Welcome, Registrierung, Feed, Spot-/Event-Detail, Stadt-Übersicht,
Gespeichert, Profil, Einstellungen, Geheimtipp). Karte-Tab = Platzhalter.

## Nächste Schritte (Phase 2 — erst nach Abnahme)

- Echte **Kartenansicht** mit `react-native-maps` (→ Dev Build, nicht Expo Go):
  Liste/Karte-Toggle, custom Map-Style, gelbe Pins.
- **Karte-Filter-Sheet**: Art / Budget / Bewertung / Ambiente (Ambiente als
  Multi-Select, ODER innerhalb / UND zwischen Gruppen).
- **Profil bearbeiten** & **Passwort ändern** als echte UI-Screens
  (Mockup 07c/07d liegen vor).

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

### (dieser Commit) · 2026-06-22 · Feed: mehr Abstand unter Kategorie-Bar
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
