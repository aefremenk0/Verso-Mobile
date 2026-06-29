import { Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// Funnel icon (filter) — SVG, fits the editorial tone (no emoji).
function FilterGlyph({ color = "#1A1A1A" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M3 5 H21 L14 13 V20 L10 18 V13 Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Round funnel button that opens the filter sheet. `active` = budget/rating/
// ambience set → yellow background + small dot indicator.
// Shared by Feed and Map (next to the search field).
export function FilterButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Open filters"
      className={`h-11 w-11 items-center justify-center rounded-pill ${
        active ? "bg-accent" : "bg-chip"
      }`}
    >
      <FilterGlyph color={active ? "#1A1A1A" : "#6E6A63"} />
      {active ? (
        <View className="absolute right-2 top-2 h-2 w-2 rounded-pill bg-night" />
      ) : null}
    </Pressable>
  );
}
