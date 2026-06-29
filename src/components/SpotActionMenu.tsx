import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { shadows } from "../theme";

// Pop-up action menu over a spot card (Pinterest-style): two circles that
// appear on long-press — "Save" (heart) and "Share" (forward).
// Tapping selects, tapping the dimmed background closes.

interface SpotActionMenuProps {
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onClose: () => void;
}

// A single circle + label that pops in staggered (spring).
function Circle({
  index,
  circleClass,
  glyph,
  glyphColor,
  glyphSize,
  label,
  onPress,
}: {
  index: number;
  circleClass: string;
  glyph: string;
  glyphColor: string;
  glyphSize: number;
  label: string;
  onPress: () => void;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      index * 70, // slight offset -> they pop in one after another
      withSpring(1, { damping: 12, stiffness: 200, mass: 0.6 }),
    );
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.4 + p.value * 0.6 }, { translateY: (1 - p.value) * 12 }],
  }));

  return (
    <View className="items-center">
      <Animated.View style={style}>
        <Pressable
          onPress={onPress}
          className={`h-16 w-16 items-center justify-center rounded-pill ${circleClass}`}
          style={shadows.card}
        >
          <Text style={{ fontSize: glyphSize, color: glyphColor }}>{glyph}</Text>
        </Pressable>
      </Animated.View>
      <Text className="mt-2 font-hk-bold text-[10px] tracking-[1.5px] text-screen">
        {label}
      </Text>
    </View>
  );
}

export function SpotActionMenu({
  saved,
  onSave,
  onShare,
  onClose,
}: SpotActionMenuProps) {
  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ zIndex: 10 }}
    >
      {/* Dimmed background (covers the card) — tap to close. */}
      <Pressable onPress={onClose} className="absolute inset-0 rounded-card bg-night/50" />

      {/* Two action circles */}
      <View className="flex-row gap-8">
        <Circle
          index={0}
          circleClass="bg-accent"
          glyph={saved ? "♥" : "♡"}
          glyphColor="#1A1A1A"
          glyphSize={26}
          label="SAVE"
          onPress={onSave}
        />
        <Circle
          index={1}
          circleClass="bg-surface"
          glyph="↗"
          glyphColor="#1A1A1A"
          glyphSize={24}
          label="SHARE"
          onPress={onShare}
        />
      </View>
    </View>
  );
}
