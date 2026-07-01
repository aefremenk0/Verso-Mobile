import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { useT } from "../lib/i18n";
import type { Scene } from "../lib/scene";
import { useInsider } from "../store/insider";
import { useScene } from "../store/scene";
import { AnimatedChip } from "./AnimatedChip";

// Scene toggle in the top right.
// - Everyone sees the two free scenes: going out (🎉) / dining (🍴).
// - Non-Insiders additionally see ONE ⭐ chip -> opens the Insider upsell.
// - Insiders instead see the two extra scenes inline: sport (🏃) / events (🎫).
// This keeps the bar clean (no crammed lock badges) while still teasing Insider.

const FREE: { scene: Scene; icon: string; en: string; de: string }[] = [
  { scene: "feiern", icon: "🎉", en: "Show going out", de: "Ausgehen anzeigen" },
  { scene: "essen", icon: "🍴", en: "Show dining", de: "Essen anzeigen" },
];

const INSIDER: { scene: Scene; icon: string; en: string; de: string }[] = [
  { scene: "sport", icon: "🏃", en: "Show sport", de: "Sport anzeigen" },
  { scene: "events", icon: "🎫", en: "Show live events", de: "Live Events anzeigen" },
];

export function SceneToggle() {
  const { scene, setScene } = useScene();
  const { isInsider } = useInsider();
  const router = useRouter();
  const t = useT();

  // If the Insider preview is turned off while on an Insider-only scene, fall
  // back to a free scene so the view isn't stuck on hidden categories.
  useEffect(() => {
    if (!isInsider && (scene === "sport" || scene === "events")) setScene("essen");
  }, [isInsider, scene, setScene]);

  const switchTo = (s: Scene) => {
    if (s !== scene) tapSelection();
    setScene(s);
  };

  const segments = isInsider ? [...FREE, ...INSIDER] : FREE;

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      {segments.map((seg) => (
        <AnimatedChip
          key={seg.scene}
          active={scene === seg.scene}
          onPress={() => switchTo(seg.scene)}
          activeBg="#FFE500"
          inactiveBg="rgba(255,229,0,0)"
          style={{ borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}
          accessibilityLabel={t(seg.en, seg.de)}
        >
          <Text className="text-[15px]">{seg.icon}</Text>
        </AnimatedChip>
      ))}

      {/* Non-Insiders: a single ⭐ chip that opens the Insider upsell. */}
      {!isInsider ? (
        <AnimatedChip
          active={false}
          onPress={() => router.push("/insider")}
          activeBg="#FFE500"
          inactiveBg="rgba(255,229,0,0)"
          style={{ borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}
          accessibilityLabel={t("Verso Insider", "Verso Insider")}
        >
          <Text className="text-[15px]">⭐</Text>
        </AnimatedChip>
      ) : null}
    </View>
  );
}
