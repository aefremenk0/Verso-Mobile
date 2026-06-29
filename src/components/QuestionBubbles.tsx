import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// Playful easter egg: yellow "?" bubbles that rise from the tap point and fade
// out. Used by the Welcome screen when tapping the "verso" wordmark (where the
// user is not yet registered).
//
// A burst is triggered via the ref method `burst(x, y)` (screen coordinates).
// Tapping repeatedly piles up bubbles ("lots of them").

export interface QuestionBubblesHandle {
  // direction: "up" (default) makes the bubbles rise, "down" makes them fall —
  // useful when the tap point is near the top edge.
  burst: (x: number, y: number, direction?: "up" | "down") => void;
}

interface BubbleData {
  id: number;
  x: number;
  y: number;
  dir: number; // -1 = upward, 1 = downward
}

let nextId = 0;

function Bubble({
  id,
  x,
  y,
  dir,
  onDone,
  glyph,
  color,
  textColor,
}: BubbleData & {
  onDone: (id: number) => void;
  glyph: string;
  color: string;
  textColor: string;
}) {
  const p = useSharedValue(0);

  // Set random parameters once (each bubble flies a little differently).
  const [cfg] = useState(() => ({
    drift: (Math.random() - 0.5) * 140, // sideways drift (px)
    rise: 200 + Math.random() * 220, // rise height (px)
    size: 24 + Math.random() * 22, // diameter (px)
    dur: 1200 + Math.random() * 900, // lifetime (ms)
    delay: Math.random() * 120, // slightly staggered start (ms)
    rot: (Math.random() - 0.5) * 50, // rotation (degrees)
  }));

  useEffect(() => {
    p.value = withDelay(
      cfg.delay,
      withTiming(
        1,
        { duration: cfg.dur, easing: Easing.out(Easing.quad) },
        (finished) => {
          // After rising, remove itself from the list.
          if (finished) runOnJS(onDone)(id);
        },
      ),
    );
    // Only start on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: cfg.drift * p.value },
      { translateY: dir * cfg.rise * p.value }, // dir: -1 up, 1 down
      { scale: 0.5 + p.value * 0.7 },
      { rotate: `${cfg.rot * p.value}deg` },
    ],
    // fade in quickly, fade out toward the end
    opacity:
      p.value < 0.12
        ? p.value / 0.12
        : p.value > 0.7
          ? 1 - (p.value - 0.7) / 0.3
          : 1,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x - cfg.size / 2,
          top: y - cfg.size / 2,
          width: cfg.size,
          height: cfg.size,
          borderRadius: cfg.size / 2,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        className="font-hk-extrabold"
        style={{
          fontSize: cfg.size * 0.5,
          lineHeight: cfg.size * 0.62,
          color: textColor,
        }}
      >
        {glyph}
      </Text>
    </Animated.View>
  );
}

interface QuestionBubblesProps {
  glyph?: string; // default "?"
  color?: string; // bubble background (default signal yellow)
  textColor?: string; // glyph color
}

export const QuestionBubbles = forwardRef<
  QuestionBubblesHandle,
  QuestionBubblesProps
>(function QuestionBubbles(
  { glyph = "?", color = "#FFE500", textColor = "#1A1A1A" },
  ref,
) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

    useImperativeHandle(ref, () => ({
      burst: (x, y, direction = "up") => {
        const dir = direction === "down" ? 1 : -1;
        const count = 10 + Math.floor(Math.random() * 6); // 10–15 per tap
        const batch: BubbleData[] = [];
        for (let i = 0; i < count; i++) batch.push({ id: nextId++, x, y, dir });
        setBubbles((prev) => [...prev, ...batch]);
      },
    }));

    const remove = (rid: number) =>
      setBubbles((prev) => prev.filter((b) => b.id !== rid));

    return (
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      >
        {bubbles.map((b) => (
          <Bubble
            key={b.id}
            {...b}
            onDone={remove}
            glyph={glyph}
            color={color}
            textColor={textColor}
          />
        ))}
      </View>
    );
  },
);
