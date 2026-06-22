import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CityProvider } from "../src/store/city";
import { GeheimtippProvider } from "../src/store/geheimtipp";
import { SavedProvider } from "../src/store/saved";
import { colors, fontMap } from "../src/theme";

// Splash erst ausblenden, wenn die Schriften geladen sind (verhindert Flackern).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Solange die Fonts laden, nichts rendern (Splash bleibt sichtbar).
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <CityProvider>
        <SavedProvider>
          <GeheimtippProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.screen },
              // sanfte Übergänge zwischen den Screens
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="spot/[id]" />
            <Stack.Screen name="gespeichert" />
            {/* Geheimtipp als modaler Overlay-Screen */}
            <Stack.Screen
              name="geheimtipp"
              options={{ presentation: "modal", animation: "fade" }}
            />
            <Stack.Screen name="settings" />
            <Stack.Screen name="profil-bearbeiten" />
            <Stack.Screen name="passwort-aendern" />
          </Stack>
          </GeheimtippProvider>
        </SavedProvider>
      </CityProvider>
    </SafeAreaProvider>
  );
}
