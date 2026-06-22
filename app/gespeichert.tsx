import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { CATEGORY_LABEL } from "../src/data/categories";
import { SPOTS } from "../src/data/spots";
import { useSaved } from "../src/store/saved";

// Screen 06 — Gespeichert.
// Liste der gemerkten Orte (gefüllt über den "Merken"-Toggle im Detail).

export default function Gespeichert() {
  const router = useRouter();
  const { savedIds } = useSaved();

  // Reihenfolge der gemerkten Spots beibehalten.
  const saved = savedIds
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => Boolean(s));

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <View className="rounded-pill bg-accent px-3 py-1.5">
          <Text className="font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
            {saved.length} ORTE
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          GESPEICHERT
        </Text>
        <Text
          className="mt-2 font-hk-extrabold text-ink"
          style={{ fontSize: 38, lineHeight: 40 }}
        >
          Deine Orte
        </Text>

        {saved.length === 0 ? (
          <Text className="mt-10 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            Noch nichts gemerkt. Tipp im Detail eines Ortes auf „Merken +" — dann
            landet er hier.
          </Text>
        ) : (
          <View className="mt-5">
            {saved.map((spot) => (
              <Pressable
                key={spot.id}
                onPress={() => router.push(`/spot/${spot.id}`)}
                className="mb-4 flex-row items-center"
              >
                <ImagePlaceholder tone={spot.tone} height={64} radius={16} style={{ width: 64 }} />
                <View className="ml-4 flex-1">
                  <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-3">
                    {CATEGORY_LABEL[spot.category]} · {spot.neighborhood.toUpperCase()}
                  </Text>
                  <Text className="mt-0.5 font-hk-extrabold text-[18px] text-ink">
                    {spot.name}
                  </Text>
                  <Text className="mt-0.5 font-hk-medium-italic text-[13px] text-ink-2">
                    {spot.hook}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
