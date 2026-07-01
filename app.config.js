// Expo app configuration as JS.
//
// The real map uses **expo-maps** (Apple Maps on iOS — no token needed; Google
// Maps on Android). It only renders in a Dev Build / standalone app; in Expo Go
// the Map screen shows the stylized fallback map (see src/components/CityMap.tsx).
//
// Android note: to show Google Maps tiles in a dev build you need a Google Maps
// API key (set config.android.config.googleMaps.apiKey). iOS/Apple Maps needs no
// key. Not required for the iOS pilot.

export default {
  expo: {
    name: "Verso",
    slug: "verso-mobile",
    version: "0.1.0",
    orientation: "portrait",
    scheme: "verso",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      backgroundColor: "#1A1A1A",
      resizeMode: "contain",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "app.verso.mobile",
    },
    android: {
      package: "app.verso.mobile",
      adaptiveIcon: {
        backgroundColor: "#FFE500",
      },
    },
    web: {
      bundler: "metro",
      output: "single",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-localization",
      [
        "expo-maps",
        {
          // Location permission strings (used only if we ever request the user's
          // location; we currently don't, but the module sets these up).
          requestLocationPermission: false,
          locationPermission:
            "Allow Verso to use your location to center the map.",
        },
      ],
    ],
  },
};
