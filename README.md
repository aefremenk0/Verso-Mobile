# Verso — Mobile Discovery

Kuratierte Discovery-App für besondere, weniger bekannte Orte in europäischen
Städten — Restaurants, Bars, Clubs, Cafés und Events. Ton: *Geheimtipp von
einem gut vernetzten Freund*, kein Branchenverzeichnis.

Gebaut mit **Expo (React Native) + TypeScript**, **Expo Router** (file-based
Routing), **NativeWind** (Tailwind für RN) und der Schrift **Hanken Grotesk**.

---

## So startest du die App (Phase 1, läuft in Expo Go)

1. **Abhängigkeiten installieren** (einmalig):

   ```bash
   npm install
   ```

2. **Entwicklungsserver starten**:

   ```bash
   npx expo start
   ```

3. **Auf dem Handy öffnen**:
   - Installiere die App **Expo Go** (App Store / Play Store).
   - **iPhone:** scanne den QR-Code aus dem Terminal mit der Kamera-App.
   - **Android:** scanne den QR-Code direkt in der Expo-Go-App.
   - Handy und Computer müssen im **selben WLAN** sein. Klappt das WLAN nicht,
     starte mit `npx expo start --tunnel`.

> Tipp: Im Browser geht's mit `npx expo start --web`, fürs Gefühl ist aber das
> Handy am besten.

---

## Projektstruktur

```
app/                      Screens (Expo Router – Dateiname = Route)
  _layout.tsx             Wurzel: lädt Fonts, hängt Provider ein, Stack-Navigation
  index.tsx               01 · Welcome (dunkles Hero, Stadt-Auswahl)
  register.tsx            01 · Registrierung (nur UI, führt in den Feed)
  (tabs)/
    _layout.tsx           Tab-Navigator mit schwebender Bottom-Nav
    feed.tsx              02 · Discovery-Feed (Stadt-Dropdown + Kategorie-Filter)
    viertel.tsx           05 · Stadt-Übersicht (Bezirke)
    karte.tsx             Karte (Phase-1-Platzhalter, echte Karte = Phase 2)
    profil.tsx            07 · Profil
  spot/[id].tsx           03 · Spot-Detail UND Event-Detail (eine Route)
  gespeichert.tsx         06 · Gespeicherte Orte
  geheimtipp.tsx          08 · Geheimtipp der Woche (Laden → Reveal)
  settings.tsx            07 · Einstellungen (Phase-1-Platzhalter)

src/
  components/             Wiederverwendbare Bausteine
    Brand.tsx             Wortmarke "verso"
    ImagePlaceholder.tsx  Dunkler Bild-Platzhalter mit Streifen-Textur
    HookHighlight.tsx     Gelb hinterlegter italic-Hook
    Pill.tsx              Chip / Filter-Pill
    Button.tsx            Buttons (accent / dark / light)
    SpotCard.tsx          Karte im Feed
    BottomNav.tsx         Schwebende Navigationsleiste
  data/                   Mock-Daten + TypeScript-Typen (kein Backend)
    types.ts  spots.ts  cities.ts  categories.ts  user.ts
  store/                  Zustand zur Laufzeit (React Context)
    saved.tsx             Gemerkte Orte (in-memory)
    city.tsx              Aktuell gewählte Stadt
  lib/maps.ts             Deep-Links zu Apple Karten / Google Maps
  theme.ts                Design-Tokens als JS (Fonts, Farben, Schatten)

tailwind.config.js        Zentrale Design-Tokens (Farben, Radien, Schriften)
global.css                Tailwind-Direktiven
```

## Design-Tokens

Alles Visuelle ist zentral in `tailwind.config.js` (für `className`) und in
`src/theme.ts` (für JS) hinterlegt:

- **Schrift:** Hanken Grotesk. Wortmarke = kleingeschrieben, italic, weight 800.
- **Farben:** Screen `#F7F4EF`, Signalgelb `#FFE500`, Text `#1A1A1A`.
- **Form:** Karten 24px, Sheets 30px, Pills/Chips rund, Buttons 16px.

## Was im MVP bewusst fehlt

Echtes Login/Backend, Datenbank, echte Reservierungs-/Ticket-Integration (nur
Deep-Links), Push-Notifications, Bezahlung — und die **echte Karte**.

---

## Phase 2 (nach Abnahme von Phase 1)

Die Kartenansicht nutzt `react-native-maps` und läuft **nicht in Expo Go**,
sondern erst über einen **Dev Build**. Geplant:

- Karte mit Liste/Karte-Umschalter, custom Map-Style, gelbe Pins.
- Filter-Sheet: Art / Budget / Bewertung / Ambiente (Multi-Select).
- Voll funktionsfähige Einstellungen, Profil bearbeiten, Passwort ändern.

Der Wechsel von Expo Go auf einen Dev Build wird Schritt für Schritt erklärt,
sobald wir Phase 2 angehen.
