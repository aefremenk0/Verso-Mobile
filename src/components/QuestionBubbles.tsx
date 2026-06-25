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

// Verspieltes Easter Egg: gelbe „?"-Bubbles, die von der Tipp-Stelle nach oben
// aufsteigen und ausfaden. Genutzt vom Welcome-Screen, wenn man auf die
// „verso"-Wortmarke tippt (dort ist man noch nicht registriert).
//
// Über die ref-Methode `burst(x, y)` (Bildschirmkoordinaten) wird ein Schwung
// ausgelöst. Mehrfaches Tippen häuft Bubbles an („ganz viele").

export interface QuestionBubblesHandle {
  // direction: "up" (Standard) lässt die Bubbles aufsteigen, "down" fallen —
  // nützlich, wenn die Tipp-Stelle nah am oberen Rand ist.
  burst: (x: number, y: number, direction?: "up" | "down") => void;
}

interface BubbleData {
  id: number;
  x: number;
  y: number;
  dir: number; // -1 = nach oben, 1 = nach unten
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

  // Zufallsparameter einmalig festlegen (jede Bubble fliegt etwas anders).
  const [cfg] = useState(() => ({
    drift: (Math.random() - 0.5) * 140, // seitliches Wandern (px)
    rise: 200 + Math.random() * 220, // Steighöhe (px)
    size: 24 + Math.random() * 22, // Durchmesser (px)
    dur: 1200 + Math.random() * 900, // Lebensdauer (ms)
    delay: Math.random() * 120, // leicht versetzter Start (ms)
    rot: (Math.random() - 0.5) * 50, // Drehung (Grad)
  }));

  useEffect(() => {
    p.value = withDelay(
      cfg.delay,
      withTiming(
        1,
        { duration: cfg.dur, easing: Easing.out(Easing.quad) },
        (finished) => {
          // Nach dem Aufstieg sich selbst aus der Liste entfernen.
          if (finished) runOnJS(onDone)(id);
        },
      ),
    );
    // Nur beim Mounten starten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: cfg.drift * p.value },
      { translateY: dir * cfg.rise * p.value }, // dir: -1 hoch, 1 runter
      { scale: 0.5 + p.value * 0.7 },
      { rotate: `${cfg.rot * p.value}deg` },
    ],
    // schnell einblenden, gegen Ende ausfaden
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
  glyph?: string; // Standard „?"
  color?: string; // Bubble-Hintergrund (Standard Signalgelb)
  textColor?: string; // Glyph-Farbe
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
        const count = 10 + Math.floor(Math.random() * 6); // 10–15 pro Tipp
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
