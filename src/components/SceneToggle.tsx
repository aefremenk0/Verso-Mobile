import { Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { useScene } from "../store/scene";
import { AnimatedChip } from "./AnimatedChip";

// Toggle in the top right: going out (🎉 Bar/Club/Event) vs. dining (🍴
// Restaurant/Snack/Café). Both halves use AnimatedChip (color crossfade + pop + press).
export function SceneToggle() {
  const { scene, setScene } = useScene();

  // Only give haptic feedback on an actual change (no feedback on re-tap).
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
        accessibilityLabel="Show going out"
      >
        <Text className="text-[16px]">🎉</Text>
      </AnimatedChip>

      <AnimatedChip
        active={scene === "essen"}
        onPress={() => switchTo("essen")}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
        accessibilityLabel="Show dining"
      >
        <Text className="text-[16px]">🍴</Text>
      </AnimatedChip>
    </View>
  );
}
