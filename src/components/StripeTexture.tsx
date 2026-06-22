import { View } from "react-native";

// Diagonale Streifen-Textur (das `repeating-linear-gradient` aus dem Mockup).
// React Native kann keine wiederholenden Verläufe, also bauen wir die Textur
// aus vielen dünnen, gedrehten Linien nach. Rein dekorativ.

const STRIPES = Array.from({ length: 16 });

export function StripeTexture({ size = 900 }: { size?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -size,
        bottom: -size,
        left: -size,
        right: -size,
        transform: [{ rotate: "30deg" }],
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {STRIPES.map((_, i) => (
        <View key={i} style={{ width: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />
      ))}
    </View>
  );
}
