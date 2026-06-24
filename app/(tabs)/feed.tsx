import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { Pill } from "../../src/components/Pill";
import { SpotCard } from "../../src/components/SpotCard";
import { TopToggles } from "../../src/components/TopToggles";
import { SPOTS } from "../../src/data/spots";
import type { Category } from "../../src/data/types";
import { SCENE_CATEGORIES, SCENE_FILTERS } from "../../src/lib/scene";
import { useCity } from "../../src/store/city";
import { useScene } from "../../src/store/scene";

// Screen 02 — Discovery-Feed.
// Oben unter dem Notch: Liste/Karte-Umschalter (zentriert) + Szenen-Toggle
// (rechts). Darunter Stadt-Dropdown und die szenenabhängige Kategorie-Bar.

export default function Feed() {
  const { city } = useCity();
  const { scene } = useScene();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Beim Szenenwechsel die Kategorie-Auswahl zurücksetzen (sonst zeigt sie ggf.
  // eine Kategorie der anderen Szene -> leer).
  useEffect(() => setActiveCategory(null), [scene]);

  // Filter: Stadt -> Szene (Kategoriengruppe) -> optional gewählte Kategorie.
  const visibleSpots = useMemo(
    () =>
      SPOTS.filter((s) => s.city === city)
        .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
        .filter((s) => (activeCategory ? s.category === activeCategory : true)),
    [city, scene, activeCategory],
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Toggles unter dem Notch: Liste/Karte zentriert, Szene rechts */}
      <TopToggles active="liste" />
      {/* Stadt-Kopf darunter */}
      <CityDropdown />

      {/* Kategorie-Bar — szenenabhängig (Feiern: Bar/Club/Event, Essen: …). */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 8,
            paddingTop: 6,
            paddingBottom: 14,
          }}
        >
          {SCENE_FILTERS[scene].map((f) => (
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
