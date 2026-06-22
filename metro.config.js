// Metro-Bundler-Konfiguration. `withNativeWind` verknüpft unsere globale
// CSS-Datei (mit den Tailwind-Direktiven) mit dem Build-Prozess.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
