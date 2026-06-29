import { View } from "react-native";

// Diagonal "strikethrough" over a pill/oval — marks "coming soon" cities.
// Sits absolutely over the (relatively positioned) parent element and is
// clipped at the pill radius. pointerEvents none, purely decorative.
export function DiagonalStrike({
  color = "rgba(26,26,26,0.6)",
}: {
  color?: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 999,
      }}
    >
      <View
        style={{
          height: 1.8,
          width: "150%",
          backgroundColor: color,
          transform: [{ rotate: "-14deg" }],
        }}
      />
    </View>
  );
}
