// Babel-Konfiguration für Expo + NativeWind.
// - "jsxImportSource: nativewind" lässt das `className`-Prop auf RN-Komponenten zu.
// - "nativewind/babel" wandelt die Tailwind-Klassen zur Build-Zeit in Styles um.
// - "react-native-worklets/plugin" wird von Reanimated 4 benötigt (das NativeWind
//   intern nutzt) und MUSS das letzte Plugin in der Liste sein.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-worklets/plugin"],
  };
};
