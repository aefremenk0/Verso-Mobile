import { useEffect, useRef } from "react";
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Range-Slider mit zwei Reglern (0–100).
//  - Ziehen: PanResponder (folgt dem Finger, instant).
//  - Tippen auf die Schiene: nächstgelegener Regler zieht ANIMIERT dorthin.
// Reanimated steuert die Regler-/Bereichs-Position; bei Drag instant, bei
// Tap/Reset sanft per withTiming.

const GAP = 5; // Mindestabstand der Regler (%)
const HALF = 14; // halbe Wrap-Breite (28/2)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const thumb = {
  width: 22,
  height: 22,
  borderRadius: 999,
  backgroundColor: "#FFFFFF",
  borderWidth: 2,
  borderColor: "#1A1A1A",
} as const;

export function RangeSlider({
  lo,
  hi,
  onChange,
}: {
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
}) {
  const wRef = useRef(0);
  const wSV = useSharedValue(0);
  const loSV = useSharedValue(lo);
  const hiSV = useSharedValue(hi);

  const loRef = useRef(lo);
  loRef.current = lo;
  const hiRef = useRef(hi);
  hiRef.current = hi;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const loStart = useRef(lo);
  const hiStart = useRef(hi);

  // Props -> Shared Value angleichen: bei großer Abweichung (Tap/Reset) sanft
  // animieren, sonst instant (Drag folgt dem Finger ohne Nachzieh-Lag).
  useEffect(() => {
    if (Math.abs(loSV.value - lo) > 1) loSV.value = withTiming(lo, { duration: 220 });
    else loSV.value = lo;
  }, [lo, loSV]);
  useEffect(() => {
    if (Math.abs(hiSV.value - hi) > 1) hiSV.value = withTiming(hi, { duration: 220 });
    else hiSV.value = hi;
  }, [hi, hiSV]);

  const loPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        loStart.current = loRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const w = wRef.current;
        if (!w) return;
        const v = clamp(
          Math.round(loStart.current + (g.dx / w) * 100),
          0,
          hiRef.current - GAP,
        );
        loSV.value = v; // instant
        onChangeRef.current(v, hiRef.current);
      },
    }),
  ).current;

  const hiPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        hiStart.current = hiRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const w = wRef.current;
        if (!w) return;
        const v = clamp(
          Math.round(hiStart.current + (g.dx / w) * 100),
          loRef.current + GAP,
          100,
        );
        hiSV.value = v; // instant
        onChangeRef.current(loRef.current, v);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    wRef.current = e.nativeEvent.layout.width;
    wSV.value = e.nativeEvent.layout.width;
  };

  // Tippen auf die Schiene -> nächstgelegener Regler dorthin (animiert via Effekt).
  const onTrackPress = (e: GestureResponderEvent) => {
    const w = wRef.current;
    if (!w) return;
    const val = clamp(Math.round((e.nativeEvent.locationX / w) * 100), 0, 100);
    if (Math.abs(val - loRef.current) <= Math.abs(val - hiRef.current)) {
      onChangeRef.current(clamp(val, 0, hiRef.current - GAP), hiRef.current);
    } else {
      onChangeRef.current(loRef.current, clamp(val, loRef.current + GAP, 100));
    }
  };

  const activeStyle = useAnimatedStyle(() => ({
    left: (loSV.value / 100) * wSV.value,
    width: ((hiSV.value - loSV.value) / 100) * wSV.value,
  }));
  const loStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (loSV.value / 100) * wSV.value - HALF }],
  }));
  const hiStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (hiSV.value / 100) * wSV.value - HALF }],
  }));

  return (
    <View onLayout={onLayout} style={{ height: 28, justifyContent: "center" }}>
      {/* Tap-Fläche (hinter den Reglern) */}
      <Pressable
        onPress={onTrackPress}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {/* Schiene */}
      <View
        pointerEvents="none"
        style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(26,26,26,0.12)" }}
      />
      {/* aktiver Bereich */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", height: 6, borderRadius: 999, backgroundColor: "#FFE500" },
          activeStyle,
        ]}
      />
      {/* unterer Regler */}
      <Animated.View
        {...loPan.panHandlers}
        style={[
          { position: "absolute", left: 0, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
          loStyle,
        ]}
      >
        <View style={thumb} />
      </Animated.View>
      {/* oberer Regler */}
      <Animated.View
        {...hiPan.panHandlers}
        style={[
          { position: "absolute", left: 0, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
          hiStyle,
        ]}
      >
        <View style={thumb} />
      </Animated.View>
    </View>
  );
}
