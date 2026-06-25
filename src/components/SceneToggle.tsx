import { Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { useScene } from "../store/scene";
import { AnimatedChip } from "./AnimatedChip";

// Umschalter oben rechts: Ausgehen (🎉 Bar/Club/Event) vs. Essen (🍴 Restaurant/
// Snack/Café). Beide Hälften nutzen AnimatedChip (Farb-Crossfade + Pop + Press).
export function SceneToggle() {
  const { scene, setScene } = useScene();

  // Nur bei echtem Wechsel haptisch quittieren (kein Feedback beim Re-Tap).
  const switchTo = (next: "feiern" | "essen") => {
    if (next !== scene) tapSelection();
    setScene(next);
  };

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      <AnimatedChip
        active={scene === "feiern"}
        onPress={() => switchTo("feiern")}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
        accessibilityLabel="Ausgehen anzeigen"
      >
        <Text className="text-[16px]">🎉</Text>
      </AnimatedChip>

      <AnimatedChip
        active={scene === "essen"}
        onPress={() => switchTo("essen")}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
        accessibilityLabel="Essen anzeigen"
      >
        <Text className="text-[16px]">🍴</Text>
      </AnimatedChip>
    </View>
  );
}
