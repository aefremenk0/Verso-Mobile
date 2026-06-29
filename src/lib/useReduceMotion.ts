import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Reads the iOS/Android "Reduce Motion" setting and keeps it up to date.
// Components with endless animations (pulse, roll, bubbles) should show a
// calmer variant — accessible and more pleasant for sensitive users.
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}
