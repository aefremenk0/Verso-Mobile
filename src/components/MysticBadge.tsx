import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useT } from "../lib/i18n";
import { useReduceMotion } from "../lib/useReduceMotion";
import { useInsider } from "../store/insider";

// Badge in the profile header. Two states:
//  • Not an Insider -> mysterious "???" (black pill, gently pulsing yellow
//    outline). Tapping opens the "/insider" upsell/paywall.
//  • Insider (subscription active) -> golden "✦ VERSO INSIDER" pill with a soft
//    shimmering sparkle. Tapping still opens "/insider" (manage/status).
export function MysticBadge() {
  const router = useRouter();
  const t = useT();
  const { isInsider } = useInsider();
  const pulse = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.6; // calm, fixed instead of an endless pulse
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  // "???" state: only the outline pulses (slightly yellow), box stays black.
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pulse.value,
      [0, 1],
      ["rgba(255,229,0,0.3)", "rgba(255,229,0,0.9)"],
    ),
  }));
  // Insider state: the sparkle softly shimmers.
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.55,
  }));

  if (isInsider) {
    return (
      <Pressable onPress={() => router.push("/insider")} hitSlop={8}>
        <View
          style={{
            marginTop: 4,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 999,
            backgroundColor: "#F4C430", // gold
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderWidth: 1.5,
            borderColor: "#FFE9A8",
            // soft golden glow
            shadowColor: "#F4C430",
            shadowOpacity: 0.6,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Animated.Text
            style={[{ fontSize: 11, color: "#1A1A1A" }, sparkleStyle]}
          >
            ✦{" "}
          </Animated.Text>
          <Text className="font-hk-bold text-[11px] tracking-[2px] text-night">
            {t("VERSO INSIDER", "VERSO INSIDER")}
          </Text>
        </View>
      </Pressable>
    );
  }

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
