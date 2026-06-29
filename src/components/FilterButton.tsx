import { Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// Trichter-Icon (Filter) — SVG, passt zum redaktionellen Ton (kein Emoji).
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

// Runder Trichter-Button, der das Filter-Sheet öffnet. `active` = Budget/
// Bewertung/Ambiente gesetzt → gelb hinterlegt + kleiner Punkt-Indikator.
// Gemeinsam genutzt von Feed und Karte (neben dem Suchfeld).
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
      accessibilityLabel="Filter öffnen"
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
