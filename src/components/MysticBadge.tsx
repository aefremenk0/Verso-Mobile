import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Mystisches „???"-Badge im Profil-Kopf — im Stil des früheren Insider-Sterns:
// schwarze Pille, gelbe „???", deren Kontur sanft gelb pulsiert (Reanimated).
export function MysticBadge() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Langsames Auf-/Abschwellen der Kontur -> wirkt geheimnisvoll, „lebt".
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1, // endlos
      true, // hin und zurück
    );
  }, [pulse]);

  // Nur die Rahmenfarbe pulsiert (leicht gelb), Box bleibt schwarz.
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pulse.value,
      [0, 1],
      ["rgba(255,229,0,0.3)", "rgba(255,229,0,0.9)"],
    ),
  }));

  return (
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
  );
}
