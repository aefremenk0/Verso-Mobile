import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { AnimatedChip } from "./AnimatedChip";

// Umschalter Liste/Karte (oben in Feed & Karte). Beide Hälften nutzen
// AnimatedChip (Farb-Crossfade + Pop + Press), konsistent zu den übrigen
// Auswahl-Elementen. `active` bestimmt die gelbe Seite; die andere navigiert.
export function ListMapToggle({ active }: { active: "liste" | "karte" }) {
  const router = useRouter();

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      <AnimatedChip
        active={active === "liste"}
        onPress={() => {
          if (active !== "liste") router.push("/(tabs)/feed");
        }}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Text
          className={`font-hk-semibold text-[13px] ${
            active === "liste" ? "text-accent-ink" : "text-ink-2"
          }`}
        >
          Liste
        </Text>
      </AnimatedChip>

      <AnimatedChip
        active={active === "karte"}
        onPress={() => {
          if (active !== "karte") router.push("/(tabs)/karte");
        }}
        activeBg="#FFE500"
        inactiveBg="rgba(255,229,0,0)"
        style={{ borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Text
          className={`font-hk-semibold text-[13px] ${
            active === "karte" ? "text-accent-ink" : "text-ink-2"
          }`}
        >
          Karte
        </Text>
      </AnimatedChip>
    </View>
  );
}
