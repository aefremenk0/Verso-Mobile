import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../lib/useReduceMotion";

// Mysterious "???" badge in the profile header — in the style of the former
// insider star: black pill, yellow "???", whose outline gently pulses yellow
// (Reanimated). Tapping opens the modal "Verso Insider" hint (`/insider`).
export function MysticBadge() {
  const router = useRouter();
  const pulse = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.6; // calm, fixed outline instead of an endless pulse
      return;
    }
    // Slow swelling/fading of the outline -> feels mysterious, "alive".
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true, // back and forth
    );
  }, [pulse, reduceMotion]);

  // Only the border color pulses (slightly yellow), the box stays black.
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pulse.value,
      [0, 1],
      ["rgba(255,229,0,0.3)", "rgba(255,229,0,0.9)"],
    ),
  }));

  return (
    <Pressable onPress={() => router.push("/insider")} hitSlop={8}>
      <Animated.View
        style={[
          {
            marginTop: 4,
            alignSelf: "flex-start",
            borderRadius: 999,
            backgroundColor: "#1A1A1A",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderWidth: 1.5,
          },
          borderStyle,
        ]}
      >
        <Text className="font-hk-bold text-[11px] tracking-[2px] text-accent">???</Text>
      </Animated.View>
    </Pressable>
  );
}
