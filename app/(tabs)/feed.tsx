import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { DuAvatar } from "../../src/components/DuAvatar";
import { Pill } from "../../src/components/Pill";
import { SpotCard } from "../../src/components/SpotCard";
import { CATEGORY_FILTERS } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import type { Category } from "../../src/data/types";
import { useCity } from "../../src/store/city";

// Screen 02 — Discovery-Feed.
// Stadt-Dropdown oben, Kategorie-Pills mit funktionierendem Filter, Spot-Karten.

export default function Feed() {
  const { city } = useCity();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Filter: erst nach Stadt, dann (optional) nach Kategorie.
  const visibleSpots = useMemo(
    () =>
      SPOTS.filter((s) => s.city === city).filter((s) =>
        activeCategory ? s.category === activeCategory : true,
      ),
    [city, activeCategory],
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Kopf: einheitliches Stadt-Dropdown + "Du"-Avatar */}
      <CityDropdown right={<DuAvatar />} />

      {/* Kategorie-Bar — in der Höhe gestreckt: die Pills sitzen oben,
          darunter bleibt Weiß INNERHALB der Bar (paddingBottom). */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 8,
            paddingTop: 6,
            paddingBottom: 34,
          }}
        >
          {CATEGORY_FILTERS.map((f) => (
            <Pill
              key={f.label}
              label={f.label}
              active={activeCategory === f.key}
              onPress={() => setActiveCategory(f.key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 110, // Platz für die schwebende Nav
        }}
        showsVerticalScrollIndicator={false}
      >
        {visibleSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}

        {visibleSpots.length === 0 ? (
          <Text className="mt-10 text-center font-hk-medium-italic text-[15px] text-ink-3">
            Hier kramen wir noch. Schau bald wieder rein.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
