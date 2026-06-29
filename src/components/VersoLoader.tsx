import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Branded launch loader: a white screen with an italic "verso" that "pops"
// through several modern color + font-family changes, then fades out to reveal
// the brown Welcome hero underneath. Reanimated only -> Expo-Go-safe.

// One step = one pop. Each carries its own font family (genuinely different
// typefaces — the brand Hanken mixed with platform system fonts so the face
// visibly switches) and a bold color that pops on white.
type Step = { font: string; color: string };

// Platform system fonts -> distinct typefaces without bundling new packages.
const serif = Platform.select({ ios: "Georgia", default: "serif" })!;
const mono = Platform.select({ ios: "Courier New", default: "monospace" })!;
const cursive = Platform.select({ ios: "Snell Roundhand", default: "cursive" })!;
const condensed = Platform.select({
  ios: "Avenir Next Condensed",
  default: "sans-serif-condensed",
})!;

const STEPS: Step[] = [
  { font: "HankenGrotesk_800ExtraBold_Italic", color: "#1A1A1A" }, // brand baseline
  { font: serif, color: "#FF2D55" }, // editorial serif, hot red
  { font: mono, color: "#007AFF" }, // techy mono, electric blue
  { font: condensed, color: "#00B894" }, // condensed, teal
  { font: cursive, color: "#5B34C4" }, // playful script, purple
  { font: "HankenGrotesk_900Black", color: "#FF7A00" }, // heavy, orange
  { font: "HankenGrotesk_800ExtraBold_Italic", color: "#1A1A1A" }, // back to brand
];

const STEP_MS = 360; // dwell time per pop
const HOLD_MS = 520; // hold on the final brand frame before fading out
const FADE_MS = 460; // white screen fade-out (reveals the brown hero)

export function VersoLoader({ onDone }: { onDone: () => void }) {
  // Font/color live in React render, so the visible step is plain state; the
  // pop (scale/rotate/opacity) is driven by Reanimated shared values.
  const [step, setStep] = useState(0);
  const scale = useSharedValue(0.6);
  const rot = useSharedValue(-7);
  const wordOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const pop = (i: number) => {
      setStep(i);
      // Reset, then spring up: scale 0.6 -> 1, slight rotate -7° -> 0.
      scale.value = 0.6;
      rot.value = -7;
      wordOpacity.value = 0;
      scale.value = withSpring(1, { damping: 8, stiffness: 170, mass: 0.7 });
      rot.value = withSpring(0, { damping: 9, stiffness: 150 });
      wordOpacity.value = withTiming(1, { duration: 150 });
    };

    STEPS.forEach((_, i) => timers.push(setTimeout(() => pop(i), i * STEP_MS)));

    // After the last pop + a short hold, fade the white screen away.
    const total = STEPS.length * STEP_MS + HOLD_MS;
    timers.push(
      setTimeout(() => {
        screenOpacity.value = withTiming(
          0,
          { duration: FADE_MS, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(onDone)();
          },
        );
      }, total),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ scale: scale.value }, { rotateZ: `${rot.value}deg` }],
  }));
  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  const current = STEPS[step] ?? STEPS[0];

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.screen, screenStyle]}
    >
      <Animated.Text
        style={[
          styles.word,
          wordStyle,
          { fontFamily: current.font, color: current.color },
        ]}
      >
        verso
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  word: {
    fontSize: 88,
    fontStyle: "italic", // system fonts honor this; brand files are already italic
    includeFontPadding: false,
    textAlign: "center",
  },
});
