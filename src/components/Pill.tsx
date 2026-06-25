import { Pressable, Text, View } from "react-native";

// Pill / Chip. Zwei Einsätze:
//  - interaktiv (Filter): `onPress` + `active`
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

  // Aktiv mit Kategorie-Farbe (per style) ODER Standard-Gelb (per className).
  const customActive = active && !!activeColor;
  const bgClass = active ? (customActive ? "" : "bg-accent") : "bg-chip";
  const textClass = active
    ? customActive
      ? ""
      : "text-accent-ink"
    : "text-ink-2";

  const content = (
    <View
      className={`rounded-pill ${padding} ${bgClass}`}
      style={customActive ? { backgroundColor: activeColor } : undefined}
    >
      <Text
        className={`font-hk-semibold ${textSize} ${textClass}`}
        style={customActive ? { color: activeTextColor ?? "#FFFFFF" } : undefined}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} hitSlop={4}>
      {content}
    </Pressable>
  );
}
