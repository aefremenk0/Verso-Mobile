/** @type {import('tailwindcss').Config} */
// Zentrale Design-Tokens für Verso (aus dem v2-Mockup übernommen).
// Alles Visuelle – Farben, Radien, Schriften, Schatten – ist hier definiert,
// damit das Design an EINER Stelle gepflegt wird.
module.exports = {
  // Wo NativeWind nach className-Nutzung sucht:
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Flächen — theme-fähig über CSS-Variablen (Light-Default in global.css,
        // Dark via vars() zur Laufzeit). <alpha-value> für /xx-Opazität.
        screen: "rgb(var(--c-screen) / <alpha-value>)", // App-Hintergrund
        surface: "rgb(var(--c-surface) / <alpha-value>)", // Karten / Sheets
        chip: "rgb(var(--c-chip) / <alpha-value>)", // Toggle-/Chip-Flächen
        // Hairline-/Rahmenfarbe — theme-fähig: dunkel auf Hell, hell auf Dunkel.
        // Nutzung mit Opazität: border-line/10, border-line/[0.18] …
        line: "rgb(var(--c-line) / <alpha-value>)",
        // Akzent (in beiden Modi gleich)
        accent: "#FFE500", // Signalgelb
        "accent-ink": "#1A1A1A", // Text auf Gelb
        // Text — theme-fähig
        ink: "rgb(var(--c-ink) / <alpha-value>)", // primär
        "ink-2": "rgb(var(--c-ink-2) / <alpha-value>)", // sekundär
        "ink-3": "rgb(var(--c-ink-3) / <alpha-value>)", // tertiär / Labels
        // Dunkle Bühnen (Welcome, Geheimtipp-Lade, dunkle Heros)
        night: "#1A1A1A",
        "night-2": "#231F1A", // dunkler Bild-Platzhalter (Start)
        "night-3": "#2A211C", // dunkler Bild-Platzhalter (Ende)
        // Karte (Phase 2)
        "map-land": "#E7E2D9",
        "map-park": "#D8E0CE",
        "map-water": "#CFD6D9",
      },
      borderRadius: {
        phone: "46px", // Phone-Rahmen
        card: "24px", // Spot-Karten
        sheet: "30px", // Detail-Sheet (oben)
        button: "16px", // Buttons
        pill: "999px", // Pills / Chips
      },
      fontFamily: {
        // Jeder Schnitt ist in RN eine eigene Datei -> eigene Utility-Klasse.
        // Nutzung: className="font-hk-extrabold-italic"
        hk: ["HankenGrotesk_400Regular"],
        "hk-medium": ["HankenGrotesk_500Medium"],
        "hk-semibold": ["HankenGrotesk_600SemiBold"],
        "hk-bold": ["HankenGrotesk_700Bold"],
        "hk-extrabold": ["HankenGrotesk_800ExtraBold"],
        "hk-black": ["HankenGrotesk_900Black"],
        "hk-italic": ["HankenGrotesk_400Regular_Italic"],
        "hk-medium-italic": ["HankenGrotesk_500Medium_Italic"],
        "hk-semibold-italic": ["HankenGrotesk_600SemiBold_Italic"],
        "hk-bold-italic": ["HankenGrotesk_700Bold_Italic"],
        "hk-extrabold-italic": ["HankenGrotesk_800ExtraBold_Italic"],
      },
      fontSize: {
        // Editoriale Skala aus dem Mockup
        label: ["11px", { lineHeight: "14px", letterSpacing: "1px" }],
        hook: ["17px", { lineHeight: "23px" }],
        "title-sm": ["22px", { lineHeight: "24px" }],
        "title-md": ["30px", { lineHeight: "30px" }],
        "title-lg": ["38px", { lineHeight: "37px" }],
        "title-xl": ["46px", { lineHeight: "44px" }],
      },
      boxShadow: {
        card: "0 18px 40px rgba(26,26,26,0.10)",
        nav: "0 12px 30px rgba(26,26,26,0.14)",
      },
    },
  },
  plugins: [],
};
