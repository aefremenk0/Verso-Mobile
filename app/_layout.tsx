import "react-native-gesture-handler";
import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CityProvider } from "../src/store/city";
import { GeheimtippProvider } from "../src/store/geheimtipp";
import { SavedProvider } from "../src/store/saved";
import { SceneProvider } from "../src/store/scene";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <CityProvider>
        <SceneProvider>
        <SavedProvider>
          <GeheimtippProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.screen },
              // Horizontaler Slide: neuer Screen kommt von rechts herein
              // (Inhalt wandert nach links), Zurück gleitet nach rechts hinaus.
              animation: "slide_from_right",
              // Per Wischen vom linken Rand zurück (wie nativ üblich).
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="spot/[id]" />
            <Stack.Screen name="gespeichert" />
            {/* Geheimtipp als modaler Overlay-Screen — bewusst als Pop-up von
                unten (slide_from_bottom), nicht als seitlicher Slide. */}
            <Stack.Screen
              name="geheimtipp"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            {/* „Verso Insider"-Hinweis (Feature noch nicht verfügbar) — Pop-up */}
            <Stack.Screen
              name="insider"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="settings" />
            <Stack.Screen name="profil-bearbeiten" />
            <Stack.Screen name="passwort-aendern" />
            <Stack.Screen name="bezirk/[name]" />
          </Stack>
          </GeheimtippProvider>
        </SavedProvider>
        </SceneProvider>
      </CityProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
