import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useReduceMotion } from "../lib/useReduceMotion";

// Hidden-gem button for the bottom nav: a dark "?" circle with a hand-drawn
// yellow outline (squiggle) that pulses.
// (Squiggle path taken exactly from Verso_Mobile_v2.dc.html, pulse instead of
// a CSS keyframe.)

const RING = 46; // size of the outline

export function GeheimtippButton({ onPress }: { onPress: () => void }) {
  const pulse = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      // Calm variant: no endless pulse, a fixed middle state.
      pulse.value = 0.6;
      return;
    }
    // verso-pulse: opacity (and a touch of scale) gently back and forth, endless.
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center"
      style={{ width: RING, height: RING }}
    >
      {/* Pulsing squiggle outline */}
      <Animated.View
        pointerEvents="none"
        style={[{ position: "absolute", width: RING, height: RING }, ringStyle]}
      >
        <Svg viewBox="0 0 56 56" width={RING} height={RING}>
          <Path
            d="M27 8 C40 4 52 15 49 27 C52 41 38 52 26 49 C13 52 5 38 8 26 C4 14 16 5 31 9"
            stroke="#FFE500"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* "?" circle */}
      <View className="h-[26px] w-[26px] items-center justify-center rounded-pill bg-night">
        <Text className="font-hk-extrabold text-[14px] text-accent">?</Text>
      </View>
    </Pressable>
  );
}
