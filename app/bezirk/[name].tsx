import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill } from "../../src/components/Pill";
import { SceneToggle } from "../../src/components/SceneToggle";
import { SpotCard } from "../../src/components/SpotCard";
import { sortByCategory } from "../../src/data/categories";
import { NEIGHBORHOODS } from "../../src/data/cities";
import { SPOTS } from "../../src/data/spots";
import type { Category } from "../../src/data/types";
import { PIN_COLORS } from "../../src/lib/pinColors";
import { SCENE_CATEGORIES, SCENE_FILTERS } from "../../src/lib/scene";
import { useCity } from "../../src/store/city";
import { useScene } from "../../src/store/scene";

// Neighborhood detail: all spots of a district in the current city.
// Opened from the city overview (Areas). Has the scene toggle at the top right
// and below it the same category hotbar as the feed.

export default function Bezirk() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { city } = useCity();
  const { scene } = useScene();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Reset the category selection when the scene changes.
  useEffect(() => setActiveCategory(null), [scene]);

  const blurb = NEIGHBORHOODS.find(
    (n) => n.city === city && n.name === name,
  )?.blurb;

  // The spot `neighborhood` now matches the neighborhood name EXACTLY (data rework)
  // -> exact comparison instead of fragile `startsWith` (no more prefix mismatch).
  // Then filter by scene (category group) and the selected category.
  const spots = sortByCategory(
    SPOTS.filter((s) => s.city === city && s.neighborhood === name)
      .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
      .filter((s) => (activeCategory ? s.category === activeCategory : true)),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: back on the left, scene toggle on the right */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <SceneToggle />
      </View>

      <Text className="px-6 font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
        {city.toUpperCase()}
      </Text>
      <Text
        className="px-6 font-hk-extrabold text-ink"
        style={{ fontSize: 38, lineHeight: 40, marginTop: 8 }}
      >
        {name}
      </Text>
      {blurb ? (
        <Text className="mt-2 px-6 font-hk-medium-italic text-[15px] leading-[21px] text-ink-2">
          {blurb}
        </Text>
      ) : null}

      {/* Category hotbar (scene-dependent) — like in the feed */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 6 }}
        >
          {SCENE_FILTERS[scene].map((f) => {
            const col = f.key ? PIN_COLORS[f.key] : null;
            return (
              <Pill
                key={f.label}
                label={f.label}
                active={activeCategory === f.key}
                onPress={() => setActiveCategory(f.key)}
                activeColor={col?.oval}
                activeTextColor={col?.inner}
              />
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {spots.length > 0 ? (
          spots.map((spot) => <SpotCard key={spot.id} spot={spot} />)
        ) : (
          <Text className="mt-6 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            Still digging here. Soon there'll be something to discover in {name} too.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
