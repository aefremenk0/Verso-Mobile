// Design tokens as JS values.
//
// Most styles come through Tailwind/NativeWind classes (see
// tailwind.config.js). A few things need real JS values, though:
//   - the font files to load (useFonts)
//   - shadows (most reliable as a style object in React Native)
//   - colors for things outside of className (e.g. StatusBar)
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

// This map goes 1:1 into `useFonts`. The keys must match the
// fontFamily names from tailwind.config.js.
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

// Colors (mirror of the Tailwind tokens) for spots without className.
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

// Soft shadows as reusable style objects.
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
