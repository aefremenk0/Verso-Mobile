import { Pressable, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import type { Spot } from "../data/types";
import { useT } from "../lib/i18n";
import { PIN_COLORS } from "../lib/pinColors";

// Lightweight, stylized mini-map for the spot detail page (Expo-Go-safe, no
// Mapbox). Purely decorative: muted background + hinted "streets" + a pin in
// the category color. Tapping opens the real map (deep link).

export function MiniMap({ spot, onPress }: { spot: Spot; onPress: () => void }) {
  const col = PIN_COLORS[spot.category];
  const t = useT();

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={t("Open in maps app", "In Karten-App öffnen")}
      className="overflow-hidden rounded-card"
      style={{ height: 150 }}
    >
      {/* Background + hinted streets (skewed, purely decorative) */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <Rect x={0} y={0} width={100} height={60} fill="#E7E3D7" />
        <Line x1={0} y1={19} x2={100} y2={13} stroke="#D4CFC0" strokeWidth={2.5} />
        <Line x1={0} y1={43} x2={100} y2={49} stroke="#D4CFC0" strokeWidth={2.5} />
        <Line x1={28} y1={0} x2={36} y2={60} stroke="#D4CFC0" strokeWidth={2.5} />
        <Line x1={70} y1={0} x2={63} y2={60} stroke="#D4CFC0" strokeWidth={2.5} />
        <Line x1={0} y1={31} x2={100} y2={33} stroke="#DEDACB" strokeWidth={1.5} />
      </Svg>

      {/* Pin in the category color, centered */}
      <View className="absolute inset-0 items-center justify-center">
        <View
          className="h-5 w-5 rounded-pill"
          style={{
            backgroundColor: col.dot,
            borderWidth: 3,
            borderColor: "#F7F4EF",
          }}
        />
      </View>

      {/* Bottom bar: address + "open" */}
      <View
        className="absolute bottom-2 left-2 right-2 flex-row items-center justify-between rounded-pill px-3.5 py-2"
        style={{ backgroundColor: "rgba(26,26,26,0.82)" }}
      >
        <Text
          numberOfLines={1}
          className="mr-2 flex-1 font-hk-semibold text-[12px] text-screen"
        >
          {spot.address}
        </Text>
        <Text className="font-hk-bold text-[12px] text-accent">
          {t("On map ↗", "In Karte ↗")}
        </Text>
      </View>
    </Pressable>
  );
}
