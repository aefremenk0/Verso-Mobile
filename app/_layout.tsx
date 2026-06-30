import "react-native-gesture-handler";
import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VersoLoader } from "../src/components/VersoLoader";
import { CityProvider } from "../src/store/city";
import { LanguageProvider } from "../src/store/language";
import { GeheimtippProvider } from "../src/store/geheimtipp";
import { InterestsProvider } from "../src/store/interests";
import { SavedProvider } from "../src/store/saved";
import { SceneProvider } from "../src/store/scene";
import { colors, fontMap } from "../src/theme";

// Only hide the splash once the fonts have loaded (prevents flicker).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  // Branded launch loader on top of everything; unmounts once it has finished
  // popping through its color/font changes and faded out to reveal Welcome.
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // While the fonts are loading, render nothing (the splash stays visible).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <LanguageProvider>
      <CityProvider>
        <SceneProvider>
        <SavedProvider>
          <GeheimtippProvider>
          <InterestsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.screen },
              // Horizontal slide: a new screen comes in from the right
              // (content moves left), Back slides out to the right.
              animation: "slide_from_right",
              // Swipe from the left edge to go back (as is native-standard).
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="spot/[id]" />
            <Stack.Screen name="gespeichert" />
            {/* Hidden gem as a modal overlay screen — deliberately a pop-up from
                the bottom (slide_from_bottom), not a sideways slide. */}
            <Stack.Screen
              name="geheimtipp"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            {/* "Verso Insider" notice (feature not available yet) — pop-up */}
            <Stack.Screen
              name="insider"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="settings" />
            <Stack.Screen name="legal" />
            <Stack.Screen name="profil-bearbeiten" />
            <Stack.Screen name="passwort-aendern" />
            <Stack.Screen name="bezirk/[name]" />
          </Stack>
          </InterestsProvider>
          </GeheimtippProvider>
        </SavedProvider>
        </SceneProvider>
      </CityProvider>
      </LanguageProvider>
    </SafeAreaProvider>
    {/* On top of everything: the branded launch loader (white -> verso pops ->
        fades out to the brown Welcome hero). */}
    {!loaderDone ? <VersoLoader onDone={() => setLoaderDone(true)} /> : null}
    </GestureHandlerRootView>
  );
}
