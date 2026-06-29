import { View } from "react-native";

// Diagonal stripe texture (the `repeating-linear-gradient` from the mockup).
// React Native cannot do repeating gradients, so we recreate the texture from
// many thin, rotated lines. Purely decorative.

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
