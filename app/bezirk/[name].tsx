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

// Bezirks-Detail: alle Spots eines Stadtteils der aktuellen Stadt.
// Wird aus der Stadt-Übersicht (Viertel) geöffnet. Hat oben rechts den
// Szenen-Toggle und darunter dieselbe Kategorie-Hotbar wie der Feed.

export default function Bezirk() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { city } = useCity();
  const { scene } = useScene();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Beim Szenenwechsel die Kategorie-Auswahl zurücksetzen.
  useEffect(() => setActiveCategory(null), [scene]);

  const blurb = NEIGHBORHOODS.find(
    (n) => n.city === city && n.name === name,
  )?.blurb;

  // Spot-Bezirk steht z. B. als "Wieden, 4. Bezirk" -> Anfang vergleichen.
  // Dann nach Szene (Kategoriengruppe) und gewählter Kategorie filtern.
  const spots = sortByCategory(
    SPOTS.filter((s) => s.city === city && s.neighborhood.startsWith(name ?? ""))
      .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
      .filter((s) => (activeCategory ? s.category === activeCategory : true)),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: zurück links, Szenen-Toggle rechts */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Zurück"
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

      {/* Kategorie-Hotbar (szenenabhängig) — wie im Feed */}
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
            Hier kramen wir noch. Bald gibt's auch in {name} etwas zu entdecken.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
