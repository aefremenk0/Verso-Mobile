import { useRef } from "react";
import { type LayoutChangeEvent, PanResponder, View } from "react-native";

// Range-Slider mit zwei ziehbaren Reglern (0–100).
// Nutzt PanResponder (in React Native eingebaut, läuft in Expo Go).
// Stabile Responder + Refs, damit das Ziehen mitten in der Geste nicht abbricht.

const GAP = 5; // Mindestabstand der beiden Regler (in %)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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
  const loRef = useRef(lo);
  loRef.current = lo;
  const hiRef = useRef(hi);
  hiRef.current = hi;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const loStart = useRef(lo);
  const hiStart = useRef(hi);

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
        onChangeRef.current(loRef.current, v);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    wRef.current = e.nativeEvent.layout.width;
  };

  return (
    <View onLayout={onLayout} style={{ height: 28, justifyContent: "center" }}>
      {/* Schiene */}
      <View
        style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(26,26,26,0.12)" }}
      />
      {/* aktiver Bereich */}
      <View
        style={{
          position: "absolute",
          height: 6,
          borderRadius: 999,
          backgroundColor: "#FFE500",
          left: `${lo}%`,
          right: `${100 - hi}%`,
        }}
      />
      {/* unterer Regler */}
      <View
        {...loPan.panHandlers}
        style={{
          position: "absolute",
          left: `${lo}%`,
          marginLeft: -14,
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "#1A1A1A",
          }}
        />
      </View>
      {/* oberer Regler */}
      <View
        {...hiPan.panHandlers}
        style={{
          position: "absolute",
          left: `${hi}%`,
          marginLeft: -14,
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "#1A1A1A",
          }}
        />
      </View>
    </View>
  );
}
