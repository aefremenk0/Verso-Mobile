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
}

export function Pill({ label, active = false, onPress, small = false }: PillProps) {
  const padding = small ? "px-3 py-1.5" : "px-4 py-2";
  const textSize = small ? "text-[13px]" : "text-[14px]";

  const content = (
    <View
      className={`rounded-pill ${padding} ${
        active ? "bg-accent" : "bg-chip"
      }`}
    >
      <Text
        className={`font-hk-semibold ${textSize} ${
          active ? "text-accent-ink" : "text-ink-2"
        }`}
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
