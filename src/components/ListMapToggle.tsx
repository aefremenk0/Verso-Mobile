import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

// Umschalter Liste/Karte (oben rechts im Feed UND auf der Karte).
// `active` bestimmt, welche Seite gelb hervorgehoben ist; die jeweils andere
// ist antippbar und navigiert zum passenden Tab.
export function ListMapToggle({ active }: { active: "liste" | "karte" }) {
  const router = useRouter();

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      {active === "liste" ? (
        <View className="rounded-pill bg-accent px-4 py-2">
          <Text className="font-hk-semibold text-[13px] text-accent-ink">Liste</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => router.push("/(tabs)/feed")}
          className="rounded-pill px-4 py-2"
        >
          <Text className="font-hk-semibold text-[13px] text-ink-2">Liste</Text>
        </Pressable>
      )}

      {active === "karte" ? (
        <View className="rounded-pill bg-accent px-4 py-2">
          <Text className="font-hk-semibold text-[13px] text-accent-ink">Karte</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => router.push("/(tabs)/karte")}
          className="rounded-pill px-4 py-2"
        >
          <Text className="font-hk-semibold text-[13px] text-ink-2">Karte</Text>
        </Pressable>
      )}
    </View>
  );
}
