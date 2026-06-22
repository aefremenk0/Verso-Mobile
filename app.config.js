// Expo-App-Konfiguration als JS, damit der (geheime) Mapbox-Download-Token
// aus einer Umgebungsvariable kommt und NICHT im Repo landet.
//
// Vor einem Dev Build setzen:
//   MAPBOX_DOWNLOAD_TOKEN=sk....   (geheimer Download-Token, nur Build-Zeit)
//   EXPO_PUBLIC_MAPBOX_TOKEN=pk.... (öffentlicher Token, zur Laufzeit der App)
//
// Ohne Token / in Expo Go zeigt der Karte-Screen die stilisierte Fallback-Karte.
const MAPBOX_DOWNLOAD_TOKEN = process.env.MAPBOX_DOWNLOAD_TOKEN || "";

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
      [
        "@rnmapbox/maps",
        {
          // Geheimer Download-Token (nur fürs native Bauen, aus der Umgebung).
          RNMapboxMapsDownloadToken: MAPBOX_DOWNLOAD_TOKEN,
        },
      ],
    ],
  },
};
