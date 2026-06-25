import { Pressable, Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { AnimatedChip } from "./AnimatedChip";

// Pill / Chip. Zwei Einsätze:
//  - interaktiv (Filter): `onPress` + `active` -> animierte Auswahl (AnimatedChip)
//  - statisch (Tag): nur `label`

interface PillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Kleinere Variante für Tags im Detail. */
  small?: boolean;
  /** Aktiv-Hintergrund (z. B. Kategorie-Farbe) statt Standard-Gelb. */
  activeColor?: string;
  /** Aktiv-Textfarbe passend zu activeColor. */
  activeTextColor?: string;
}

export function Pill({
  label,
  active = false,
  onPress,
  small = false,
  activeColor,
  activeTextColor,
}: PillProps) {
  const padding = small ? "px-3 py-1.5" : "px-4 py-2";
  const textSize = small ? "text-[13px]" : "text-[14px]";
  const customActive = active && !!activeColor;

  // Statischer Tag (kein onPress) — ohne Animation.
  if (!onPress) {
    return (
      <View
        className={`rounded-pill ${padding} ${
          active ? (customActive ? "" : "bg-accent") : "bg-chip"
        }`}
        style={customActive ? { backgroundColor: activeColor } : undefined}
      >
        <Text
          className={`font-hk-semibold ${textSize} ${
            active ? (customActive ? "" : "text-accent-ink") : "text-ink-2"
          }`}
          style={customActive ? { color: activeTextColor ?? "#FFFFFF" } : undefined}
        >
          {label}
        </Text>
      </View>
    );
  }

  // Interaktiv: Pop + Press + Farb-Crossfade (AnimatedChip) + Selektions-Haptik.
  const activeBg = customActive ? (activeColor as string) : "#FFE500";
  const handlePress = () => {
    tapSelection(); // subtiles „tick" bei jeder Chip-Auswahl
    onPress();
  };
  return (
    <AnimatedChip
      active={active}
      onPress={handlePress}
      activeBg={activeBg}
      inactiveBg="#EDE9E1"
      style={{
        borderRadius: 999,
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 6 : 8,
      }}
    >
      <Text
        className={`font-hk-semibold ${textSize} ${
          active ? (customActive ? "" : "text-accent-ink") : "text-ink-2"
        }`}
        style={customActive && active ? { color: activeTextColor ?? "#FFFFFF" } : undefined}
      >
        {label}
      </Text>
    </AnimatedChip>
  );
}
