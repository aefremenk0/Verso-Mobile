import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryBar } from "../../src/components/CategoryBar";
import { CityDropdown } from "../../src/components/CityDropdown";
import { CityMap } from "../../src/components/CityMap";
import { FilterButton } from "../../src/components/FilterButton";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { KeyboardDoneBar } from "../../src/components/KeyboardDoneBar";
import { MapFilterSheet } from "../../src/components/MapFilterSheet";
import { SceneToggle } from "../../src/components/SceneToggle";
import { SearchField } from "../../src/components/SearchField";
import { CATEGORY_LABEL, priceLabel } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import type { Category, Spot } from "../../src/data/types";
import {
  DEFAULT_FILTER,
  matchesFilter,
  type MapFilter,
} from "../../src/lib/mapFilter";
import { SCENE_CATEGORIES } from "../../src/lib/scene";
import { useCity } from "../../src/store/city";
import { useScene } from "../../src/store/scene";
import { shadows } from "../../src/theme";

// Screen 04 — Kartenansicht.
// Karte (Mapbox im Dev Build, sonst stilisiert). Pins sind antippbar -> erst
// dann erscheint die kleine Spot-Karte. FILTER öffnet das Filter-Sheet, dessen
// Auswahl Pins UND Anzahl sofort filtert.

export default function Karte() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { city } = useCity();
  const { scene } = useScene();

  const [selected, setSelected] = useState<Spot | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");

  // Budget/Bewertung/Ambiente gesetzt? (Art macht die Kategorie-Leiste)
  const filterActive =
    filter.minPrice > 0 ||
    filter.maxPrice < 100 ||
    filter.minRating > 0 ||
    filter.ambiente.length > 0;

  // Beim Szenenwechsel den Art-Filter UND die Kategorie-Auswahl leeren — sonst
  // würden szenenfremde Arten alle Orte wegfiltern.
  useEffect(() => {
    setFilter((f) => (f.art.length ? { ...f, art: [] } : f));
    setActiveCategory(null);
  }, [scene]);

  // Stadt -> Szene (Kategoriengruppe) -> Kategorie-Leiste -> Suche -> Filter-Sheet.
  const q = query.trim().toLowerCase();
  const spots = useMemo(
    () =>
      SPOTS.filter((s) => s.city === city)
        .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
        .filter((s) => (activeCategory ? s.category === activeCategory : true))
        .filter((s) =>
          q
            ? s.name.toLowerCase().includes(q) ||
              s.neighborhood.toLowerCase().includes(q) ||
              s.tags.some((t) => t.toLowerCase().includes(q))
            : true,
        )
        .filter((s) => matchesFilter(s, filter)),
    [city, scene, activeCategory, q, filter],
  );

  // Ausgewählter Spot nur zeigen, wenn er noch im gefilterten Ergebnis ist.
  const card = selected && spots.some((s) => s.id === selected.id) ? selected : null;

  // Pin antippen: auswählen — erneut denselben antippen: wieder verdecken.
  const onSelectSpot = (s: Spot) =>
    setSelected((prev) => (prev?.id === s.id ? null : s));

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Kopfzeile: Stadt links, Szene rechts */}
      <CityDropdown right={<SceneToggle />} />

      {/* Suchfeld + Filter-Button (wie im Feed) */}
      <View className="mt-3 flex-row items-center gap-2 px-6">
        <View className="flex-1">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Ort, Viertel oder Tag suchen …"
          />
        </View>
        <FilterButton active={filterActive} onPress={() => setFilterOpen(true)} />
      </View>

      {/* Karte + schwebende, transparente Kategorie-Leiste darüber (man sieht
          die Karte durch die Leiste hindurch). */}
      <View className="mt-3 flex-1 overflow-hidden">
        <CityMap
          spots={spots}
          selectedId={card?.id}
          onSelect={onSelectSpot}
          onClearSelection={() => setSelected(null)}
        />
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, top: 6 }}
        >
          <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
        </View>
      </View>

      {/* Spot-Karte: erscheint erst, wenn ein Pin angetippt wurde.
          Sitzt über der schwebenden Nav (Safe-Area + Nav-Höhe). */}
      {card ? (
        <Pressable
          onPress={() => router.push(`/spot/${card.id}`)}
          className="absolute left-4 right-4 flex-row items-center gap-3.5 rounded-card bg-surface p-3.5"
          style={[{ bottom: insets.bottom + 92 }, shadows.card]}
        >
          <ImagePlaceholder tone={card.tone} height={66} radius={18} style={{ width: 66 }} />
          <View className="flex-1">
            <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-ink-3">
              {CATEGORY_LABEL[card.category]} · {card.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(card.priceLevel)}
            </Text>
            <Text className="mt-0.5 font-hk-extrabold text-[22px] text-ink">{card.name}</Text>
            <Text className="mt-0.5 font-hk-medium-italic text-[12px] text-ink-2" numberOfLines={1}>
              {card.hook}
            </Text>
          </View>
          {/* Schließen (Auswahl aufheben) */}
          <Pressable
            onPress={() => setSelected(null)}
            hitSlop={10}
            className="h-7 w-7 items-center justify-center rounded-pill bg-chip"
          >
            <Text className="font-hk-bold text-[13px] text-ink-2">✕</Text>
          </Pressable>
        </Pressable>
      ) : null}

      {/* Filter-Sheet */}
      {filterOpen ? (
        <MapFilterSheet
          filter={filter}
          setFilter={setFilter}
          count={spots.length}
          onClose={() => setFilterOpen(false)}
          showArt={false}
        />
      ) : null}

      {/* „Fertig"-Leiste über der Tastatur (iOS) für das Suchfeld */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
