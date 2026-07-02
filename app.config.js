// Expo app configuration as JS.
//
// The real map uses **react-native-maps** (Apple Maps on iOS via
// PROVIDER_DEFAULT — no token needed; Google Maps on Android). It only renders
// in a Dev Build / standalone app; in Expo Go the Map screen shows the stylized
// fallback map (see src/components/CityMap.tsx).
//
// Android note: to show Google Maps tiles in a dev build you need a Google Maps
// API key (android.config.googleMaps.apiKey). iOS/Apple Maps needs no key.
// Not required for the iOS pilot.

export default {
  expo: {
    name: "Verso",
    slug: "verso-mobile",
    version: "0.1.0",
    orientation: "portrait",
    scheme: "verso",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    // App icon: yellow italic "v." on dark (design/Verso_App_Icon). iOS masks
    // the square automatically (no pre-rounded corners in the asset).
    icon: "./assets/icon.png",
    splash: {
      backgroundColor: "#1A1A1A",
      resizeMode: "contain",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "app.verso.mobile",
      infoPlist: {
        // Needed for the blue "you are here" dot + location button on the map.
        NSLocationWhenInUseUsageDescription:
          "Verso uses your location to show where you are on the map.",
        // Standard HTTPS only -> declare no non-exempt encryption, so TestFlight
        // doesn't ask the export-compliance question on every build.
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "app.verso.mobile",
      adaptiveIcon: {
        // Yellow "v." foreground on the dark brand background.
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1A1A1A",
      },
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-localization",
      // Push / local notifications. Android accent color = brand yellow.
      ["expo-notifications", { color: "#FFE500" }],
    ],
    web: {
      bundler: "metro",
      output: "single",
    },
    // Supabase config. The publishable key is public by design (ships in the
    // app); write access is protected by Row Level Security, not by secrecy.
    // RevenueCat: the public SDK key is likewise safe to ship (it can only read
    // offerings / make purchases as the user, never manage the account).
    extra: {
      supabaseUrl: "https://nzdhnfkoegzcjpkkmbmm.supabase.co",
      supabaseKey: "sb_publishable_zQEIeJRC-xcoRgnGat6oEQ_nV4km4UG",
      // iOS public SDK key (RevenueCat Test Store key for now).
      revenueCatIosKey: "test_GgChnfUgBORlmxIgyTaLCwfucJn",
      // Entitlement identifier that unlocks Insider (create it in the dashboard).
      revenueCatEntitlement: "insider",
    },
  },
};
