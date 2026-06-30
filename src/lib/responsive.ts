import { useWindowDimensions } from "react-native";

// Responsive scaling for the few places that use big, fixed display sizes.
// Most of the app already uses flex / NativeWind utilities (which adapt on their
// own); this only helps the large display type so it stays proportional and
// never overflows on narrow phones (e.g. iPhone SE, 320pt) or looks tiny on
// large ones (Pro Max, 430pt).

// Reference width: iPhone 13/14 (390pt). Clamp so phones don't get extreme.
const BASE_WIDTH = 390;
const MIN = 0.84; // ~SE
const MAX = 1.12; // ~Pro Max / large Androids

/** Hook: returns a function that scales a px size by the current screen width. */
export function useScaleSize() {
  const { width } = useWindowDimensions();
  const factor = Math.min(MAX, Math.max(MIN, width / BASE_WIDTH));
  return (size: number) => Math.round(size * factor);
}
