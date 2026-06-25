import { Text, View } from "react-native";
import { useScene } from "../store/scene";
import { AnimatedChip } from "./AnimatedChip";

// Umschalter oben rechts: Ausgehen (🎉 Bar/Club/Event) vs. Essen (🍴 Restaurant/
// Snack/Café). Beide Hälften nutzen AnimatedChip (Farb-Crossfade + Pop + Press).
export function SceneToggle() {
  const { scene, setScene } = useScene();

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      <AnimatedChip
        active={scene === "feiern"}
        onPress={() => setScene("feiern")}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <Text className="text-[16px]">🎉</Text>
      </AnimatedChip>

      <AnimatedChip
        active={scene === "essen"}
        onPress={() => setScene("essen")}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <Text className="text-[16px]">🍴</Text>
      </AnimatedChip>
    </View>
  );
}
