import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Liest die iOS/Android-Einstellung „Bewegung reduzieren" und hält sie aktuell.
// Komponenten mit endlosen Animationen (Puls, Roll, Bubbles) sollen damit eine
// ruhigere Variante zeigen — barrierefrei und angenehmer für Empfindliche.
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
