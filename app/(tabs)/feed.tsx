import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const { city, setCity, cities } = useCity();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [cityMenu, setCityMenu] = useState(false);

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
      {/* Kopf: Stadt-Dropdown + "Du" */}
      <View className="px-6 pt-2">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setCityMenu((v) => !v)}
            className="flex-row items-center"
          >
            <Text className="font-hk-extrabold text-title-md text-ink">{city}</Text>
            <Text className="ml-1 font-hk-bold text-[18px] text-ink-3">▾</Text>
          </Pressable>

          <DuAvatar />
        </View>

      </View>

      {/* Aufklappbares Stadt-Menü — horizontal scrollbar */}
      {cityMenu ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          className="mt-3 max-h-[44px] flex-none"
        >
          {cities.map((c) => (
            <Pill
              key={c}
              label={c}
              active={c === city}
              onPress={() => {
                setCity(c);
                setCityMenu(false);
              }}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* Kategorie-Filter */}
      <View className="mt-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
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
          paddingTop: 28, // klarer Abstand unter der Kategorie-Bar
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
