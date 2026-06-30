import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useT } from "../lib/i18n";

// "Surprise me" — draws a random place. Fits the hidden-gem core:
// dark pill, yellow sparkle, brief press-bounce (Reanimated).

function Sparkle({ size = 16, color = "#FFE500" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z"
        fill={color}
      />
    </Svg>
  );
}

export function SurpriseButton({ onPress }: { onPress: () => void }) {
  const t = useT();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 220 });
        }}
        accessibilityLabel={t(
          "Surprise me — show a random place",
          "Überrasch mich — zufälligen Ort zeigen",
        )}
        className="flex-row items-center justify-center gap-2 rounded-pill bg-night py-3"
      >
        <Sparkle />
        <Text className="font-hk-extrabold text-[15px] text-screen">
          {t("Surprise me", "Überrasch mich")}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
