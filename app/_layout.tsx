import "react-native-gesture-handler";
import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { vars } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VersoLoader } from "../src/components/VersoLoader";
import { initAnalytics, track } from "../src/lib/analytics";
import {
  AppearanceProvider,
  DARK_VARS,
  useAppearance,
} from "../src/store/appearance";
import { AuthProvider } from "../src/store/auth";
import { CatalogProvider } from "../src/store/catalog";
import { CityProvider } from "../src/store/city";
import { ProfileProvider } from "../src/store/profile";
import { LanguageProvider } from "../src/store/language";
import { GeheimtippProvider } from "../src/store/geheimtipp";
import { InsiderProvider } from "../src/store/insider";
import { InterestsProvider } from "../src/store/interests";
import { NotificationsProvider } from "../src/store/notifications";
import { RecentProvider } from "../src/store/recent";
import { SavedProvider } from "../src/store/saved";
import { SceneProvider } from "../src/store/scene";
import { fontMap } from "../src/theme";

// Only hide the splash once the fonts have loaded (prevents flicker).
SplashScreen.preventAutoHideAsync();

// Root wrapper that applies the theme: in dark mode it sets the dark CSS
// variables via vars() (which cascade to every themed token) and flips the
// status bar. bg-screen itself is themed, so the whole app follows.
function ThemedApp({ children }: { children: ReactNode }) {
  const { isDark } = useAppearance();
  return (
    <View
      className="flex-1 bg-screen"
      style={isDark ? vars(DARK_VARS) : undefined}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </View>
  );
}

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

  // Load analytics consent + install the global crash handler, then log app open.
  useEffect(() => {
    initAnalytics().then(() => track("app_open"));
  }, []);

  // While the fonts are loading, render nothing (the splash stays visible).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <LanguageProvider>
      <AuthProvider>
      <ProfileProvider>
      <CatalogProvider>
      <CityProvider>
        <SceneProvider>
        <RecentProvider>
        <SavedProvider>
          <GeheimtippProvider>
          <InsiderProvider>
          <InterestsProvider>
          <NotificationsProvider>
          <AppearanceProvider>
          <ThemedApp>
          <Stack
            screenOptions={{
              headerShown: false,
              // Transparent -> the themed root View's bg-screen shows through
              // (so dark mode applies during transitions too).
              contentStyle: { backgroundColor: "transparent" },
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
            <Stack.Screen
              name="ort-vorschlagen"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="share-import"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="profil-bearbeiten" />
            <Stack.Screen name="passwort-aendern" />
            <Stack.Screen
              name="reset-password"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="app-icon" />
            <Stack.Screen name="bezirk/[name]" />
          </Stack>
          </ThemedApp>
          </AppearanceProvider>
          </NotificationsProvider>
          </InterestsProvider>
          </InsiderProvider>
          </GeheimtippProvider>
        </SavedProvider>
        </RecentProvider>
        </SceneProvider>
      </CityProvider>
      </CatalogProvider>
      </ProfileProvider>
      </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
    {/* On top of everything: the branded launch loader (white -> verso pops ->
        fades out to the brown Welcome hero). */}
    {!loaderDone ? <VersoLoader onDone={() => setLoaderDone(true)} /> : null}
    </GestureHandlerRootView>
  );
}
