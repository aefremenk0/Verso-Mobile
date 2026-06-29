import { useEffect, useRef, type ReactNode } from "react";
import { Pressable, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// Unified selection micro-interaction for chips/pills:
//  - color crossfade of the background (and optionally the border) instead of a hard switch
//  - "pop" when activating (a brief scale overshoot)
//  - "press-down" when pressed
// Content comes in as children (text etc.); layout (padding/radius/border) via style.
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
  const sel = useSharedValue(active ? 1 : 0); // 0 inactive -> 1 active (crossfade)
  const press = useSharedValue(0); // press-down
  const pop = useSharedValue(0); // pop when activating
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
