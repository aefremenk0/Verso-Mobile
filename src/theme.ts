// Design-Tokens als JS-Werte.
//
// Die meisten Styles kommen über Tailwind/NativeWind-Klassen (siehe
// tailwind.config.js). Ein paar Dinge brauchen aber echte JS-Werte:
//   - die Schrift-Dateien zum Laden (useFonts)
//   - Schatten (in React Native am zuverlässigsten als Style-Objekt)
//   - Farben für Dinge außerhalb von className (z. B. StatusBar)
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_400Regular_Italic,
  HankenGrotesk_500Medium,
  HankenGrotesk_500Medium_Italic,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_600SemiBold_Italic,
  HankenGrotesk_700Bold,
  HankenGrotesk_700Bold_Italic,
  HankenGrotesk_800ExtraBold,
  HankenGrotesk_800ExtraBold_Italic,
  HankenGrotesk_900Black,
} from "@expo-google-fonts/hanken-grotesk";

// Diese Map geht 1:1 an `useFonts`. Die Schlüssel müssen mit den
// fontFamily-Namen aus tailwind.config.js übereinstimmen.
export const fontMap = {
  HankenGrotesk_400Regular,
  HankenGrotesk_400Regular_Italic,
  HankenGrotesk_500Medium,
  HankenGrotesk_500Medium_Italic,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_600SemiBold_Italic,
  HankenGrotesk_700Bold,
  HankenGrotesk_700Bold_Italic,
  HankenGrotesk_800ExtraBold,
  HankenGrotesk_800ExtraBold_Italic,
  HankenGrotesk_900Black,
};

// Farben (Spiegel der Tailwind-Tokens) für Stellen ohne className.
export const colors = {
  screen: "#F7F4EF",
  surface: "#FFFFFF",
  chip: "#EDE9E1",
  accent: "#FFE500",
  ink: "#1A1A1A",
  ink2: "#6E6A63",
  ink3: "#8A857C",
  night: "#1A1A1A",
} as const;

// Weiche Schatten als wiederverwendbare Style-Objekte.
export const shadows = {
  card: {
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  nav: {
    shadowColor: "#1A1A1A",
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;
