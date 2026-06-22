import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SpotCard } from "../../src/components/SpotCard";
import { NEIGHBORHOODS } from "../../src/data/cities";
import { SPOTS } from "../../src/data/spots";
import { useCity } from "../../src/store/city";

// Bezirks-Detail: alle Spots eines Stadtteils der aktuellen Stadt.
// Wird aus der Stadt-Übersicht (Viertel) geöffnet.

export default function Bezirk() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { city } = useCity();

  const blurb = NEIGHBORHOODS.find(
    (n) => n.city === city && n.name === name,
  )?.blurb;

  // Spot-Bezirk steht z. B. als "Wieden, 4. Bezirk" -> Anfang vergleichen.
  const spots = SPOTS.filter(
    (s) => s.city === city && s.neighborhood.startsWith(name ?? ""),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-2 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          {city.toUpperCase()}
        </Text>
        <Text
          className="mt-2 font-hk-extrabold text-ink"
          style={{ fontSize: 38, lineHeight: 40 }}
        >
          {name}
        </Text>
        {blurb ? (
          <Text className="mt-2 font-hk-medium-italic text-[15px] leading-[21px] text-ink-2">
            {blurb}
          </Text>
        ) : null}

        <View className="mt-6">
          {spots.length > 0 ? (
            spots.map((spot) => <SpotCard key={spot.id} spot={spot} />)
          ) : (
            <Text className="mt-6 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
              Hier kramen wir noch. Bald gibt's auch in {name} etwas zu entdecken.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
