import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../lib/useReduceMotion";

// Loading placeholder shaped like a SpotCard (image block + text lines). A gentle
// opacity "breath" shimmers while the catalog's first fetch is in flight. Honors
// "reduce motion" (then it just sits at a calm fixed opacity).

function Bar({ w, h = 12, mt = 0 }: { w: string | number; h?: number; mt?: number }) {
  return (
    <View
      className="rounded-pill bg-chip"
      style={{ width: w as number, height: h, marginTop: mt }}
    />
  );
}

export function SpotCardSkeleton() {
  const reduce = useReduceMotion();
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    if (reduce) {
      pulse.value = 0.85;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
  }, [reduce, pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={style} className="mb-5">
      <View className="overflow-hidden rounded-card bg-surface">
        {/* Image block */}
        <View className="bg-chip" style={{ height: 150 }} />
        {/* Text lines */}
        <View className="px-5 pb-5 pt-4">
          <Bar w={"70%"} h={22} />
          <Bar w={"90%"} h={13} mt={12} />
          <Bar w={"40%"} h={10} mt={14} />
          <Bar w={"60%"} h={13} mt={10} />
        </View>
      </View>
    </Animated.View>
  );
}

/** A short stack of skeleton cards for the first load. */
export function SpotListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SpotCardSkeleton key={i} />
      ))}
    </View>
  );
}
