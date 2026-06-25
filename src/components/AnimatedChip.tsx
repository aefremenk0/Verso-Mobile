import { useEffect, useRef, type ReactNode } from "react";
import { Pressable, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// Einheitliche Auswahl-Mikrointeraktion für Chips/Pills:
//  - Farb-Crossfade von Hintergrund (und optional Rahmen) statt hartem Umschalten
//  - „Pop" beim Aktivieren (kurzer Scale-Überschwung)
//  - „Press-Down" beim Drücken
// Inhalt kommt als children (Text etc.); Layout (Padding/Radius/Border) via style.
interface AnimatedChipProps {
  active: boolean;
  onPress: () => void;
  children: ReactNode;
  activeBg: string;
  inactiveBg: string;
  activeBorder?: string;
  inactiveBorder?: string;
  style?: ViewStyle;
  hitSlop?: number;
  accessibilityLabel?: string;
}

export function AnimatedChip({
  active,
  onPress,
  children,
  activeBg,
  inactiveBg,
  activeBorder,
  inactiveBorder,
  style,
  hitSlop = 4,
  accessibilityLabel,
}: AnimatedChipProps) {
  const sel = useSharedValue(active ? 1 : 0); // 0 inaktiv -> 1 aktiv (Crossfade)
  const press = useSharedValue(0); // Press-Down
  const pop = useSharedValue(0); // Pop beim Aktivieren
  const wasActive = useRef(active);

  useEffect(() => {
    sel.value = withTiming(active ? 1 : 0, { duration: 200 });
    if (active && !wasActive.current) {
      pop.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 170 }),
      );
    }
    wasActive.current = active;
  }, [active, sel, pop]);

  const aStyle = useAnimatedStyle(() => {
    const s: Record<string, unknown> = {
      transform: [{ scale: 1 - press.value * 0.04 + pop.value * 0.08 }],
      backgroundColor: interpolateColor(sel.value, [0, 1], [inactiveBg, activeBg]),
    };
    if (activeBorder) {
      s.borderColor = interpolateColor(
        sel.value,
        [0, 1],
        [inactiveBorder ?? activeBorder, activeBorder],
      );
    }
    return s;
  });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 140 });
      }}
    >
      <Animated.View style={[style, aStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
