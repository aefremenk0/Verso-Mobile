import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { useT } from "../lib/i18n";
import { isInsiderScene, type Scene } from "../lib/scene";
import { useInsider } from "../store/insider";
import { useScene } from "../store/scene";
import { AnimatedChip } from "./AnimatedChip";

// Scene toggle in the top right. Free: going out (🎉) / dining (🍴). Insider
// only: sport (🏃) / live events (🎫) — locked with a 🔒 until the user is an
// Insider; tapping a locked scene opens the Insider upsell instead of switching.

const SEGMENTS: { scene: Scene; icon: string; en: string; de: string }[] = [
  { scene: "feiern", icon: "🎉", en: "Show going out", de: "Ausgehen anzeigen" },
  { scene: "essen", icon: "🍴", en: "Show dining", de: "Essen anzeigen" },
  { scene: "sport", icon: "🏃", en: "Show sport (Insider)", de: "Sport anzeigen (Insider)" },
  { scene: "events", icon: "🎫", en: "Show live events (Insider)", de: "Live Events anzeigen (Insider)" },
];

export function SceneToggle() {
  const { scene, setScene } = useScene();
  const { isInsider } = useInsider();
  const router = useRouter();
  const t = useT();

  const onPress = (s: Scene) => {
    if (isInsiderScene(s) && !isInsider) {
      router.push("/insider"); // premium upsell instead of switching
      return;
    }
    if (s !== scene) tapSelection(); // feedback only on a real change
    setScene(s);
  };

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      {SEGMENTS.map((seg) => {
        const locked = isInsiderScene(seg.scene) && !isInsider;
        return (
          <View key={seg.scene}>
            <AnimatedChip
              active={scene === seg.scene}
              onPress={() => onPress(seg.scene)}
              activeBg="#FFE500"
              inactiveBg="rgba(255,229,0,0)"
              style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}
              accessibilityLabel={t(seg.en, seg.de)}
            >
              <Text
                className="text-[15px]"
                style={locked ? { opacity: 0.4 } : undefined}
              >
                {seg.icon}
              </Text>
            </AnimatedChip>
            {locked ? (
              <Text
                style={{ position: "absolute", right: -1, top: -3, fontSize: 10 }}
                pointerEvents="none"
              >
                🔒
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
