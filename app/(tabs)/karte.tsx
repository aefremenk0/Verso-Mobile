import { useLocalSearchParams, useRouter } from "expo-router";
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
import { categoryLabel, priceLabel } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import type { Category, Spot } from "../../src/data/types";
import {
  DEFAULT_FILTER,
  matchesFilter,
  type MapFilter,
} from "../../src/lib/mapFilter";
import { useLang, useT } from "../../src/lib/i18n";
import { spotText } from "../../src/lib/localized";
import { SCENE_CATEGORIES, type Scene } from "../../src/lib/scene";
import { useCity } from "../../src/store/city";
import { useScene } from "../../src/store/scene";
import { shadows } from "../../src/theme";

// Screen 04 — Map view.
// Map (Apple/Google Maps via expo-maps in the dev build, otherwise stylized).
// Pins are tappable -> only
// then does the small spot card appear. FILTER opens the filter sheet whose
// selection filters pins AND the count immediately.

export default function Karte() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { city } = useCity();
  const { scene, setScene } = useScene();
  // "focus" param: set when the user taps "On map" on a spot's detail page ->
  // open this tab centered on that spot with its card open.
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  const [selected, setSelected] = useState<Spot | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  // Coordinate the real map should animate to (from a "focus" navigation).
  const [centerOn, setCenterOn] = useState<{
    latitude: number;
    longitude: number;
    key: number;
  } | null>(null);

  // React to a "focus" spot: switch to its scene, select it, center the map.
  useEffect(() => {
    if (!focus) return;
    const sp = SPOTS.find((s) => s.id === focus);
    if (!sp) return;
    const sc = (Object.keys(SCENE_CATEGORIES) as Scene[]).find((s) =>
      SCENE_CATEGORIES[s].includes(sp.category),
    );
    if (sc && sc !== scene) setScene(sc);
    setActiveCategory(null); // don't let the hotbar filter it out
    setSelected(sp);
    setCenterOn({ latitude: sp.lat, longitude: sp.lng, key: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // Budget/rating/ambience set? (the category bar handles "type")
  const filterActive =
    filter.minPrice > 0 ||
    filter.maxPrice < 100 ||
    filter.minRating > 0 ||
    filter.ambiente.length > 0;

  // On scene change clear the type filter AND the category selection — otherwise
  // types from the other scene would filter out every place.
  useEffect(() => {
    setFilter((f) => (f.art.length ? { ...f, art: [] } : f));
    setActiveCategory(null);
  }, [scene]);

  // City -> scene (category group) -> category bar -> search -> filter sheet.
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

  // Only show the selected spot if it's still in the filtered result.
  const card = selected && spots.some((s) => s.id === selected.id) ? selected : null;

  // Tap a pin: select it — tap the same one again: hide it.
  const onSelectSpot = (s: Spot) =>
    setSelected((prev) => (prev?.id === s.id ? null : s));

  // Bottom nav field height. The map area ends exactly at the nav's top edge
  // (marginBottom), so the Apple logo (pinned to the map frame bottom) sits
  // right above the nav. The category bar height is measured -> mapPadding.top.
  const navH = insets.bottom + 62;
  const [catBarH, setCatBarH] = useState(52);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* White field: city header + search/filter sit on solid background,
          above the map (not floating over it). */}
      <View className="border-b border-black/5">
        <CityDropdown right={<SceneToggle />} />
        <View className="mt-3 flex-row items-center gap-2 px-6 pb-3">
          <View className="flex-1">
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={t("Search place, area or tag …", "Ort, Viertel oder Tag suchen …")}
            />
          </View>
          <FilterButton active={filterActive} onPress={() => setFilterOpen(true)} />
        </View>
      </View>

      {/* Map area — ends at the bottom nav's top edge (marginBottom). Only the
          category pills float over the map; the Apple logo + location button are
          kept clear via mapPadding (top = pills height, bottom = small gap). */}
      <View
        className="flex-1 overflow-hidden"
        style={{ marginBottom: navH }}
      >
        <CityMap
          spots={spots}
          selectedId={card?.id}
          onSelect={onSelectSpot}
          onClearSelection={() => setSelected(null)}
          topInset={catBarH + 6}
          bottomInset={8}
          centerOn={centerOn}
        />
        <View
          onLayout={(e) => setCatBarH(e.nativeEvent.layout.height)}
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, top: 6 }}
        >
          <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
        </View>
      </View>

      {/* Spot card: appears only once a pin has been tapped. Sits just above
          the bottom nav field. */}
      {card ? (
        <Pressable
          onPress={() => router.push(`/spot/${card.id}`)}
          className="absolute left-4 right-4 flex-row items-center gap-3.5 rounded-card bg-surface p-3.5"
          style={[{ bottom: navH + 12 }, shadows.card]}
        >
          <ImagePlaceholder tone={card.tone} height={66} radius={18} style={{ width: 66 }} />
          <View className="flex-1">
            <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-ink-3">
              {categoryLabel(card.category, lang)} · {card.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(card.priceLevel)}
            </Text>
            <Text className="mt-0.5 font-hk-extrabold text-[22px] text-ink">{spotText(card, lang).name}</Text>
            <Text className="mt-0.5 font-hk-medium-italic text-[12px] text-ink-2" numberOfLines={1}>
              {spotText(card, lang).hook}
            </Text>
          </View>
          {/* Close (clear selection) */}
          <Pressable
            onPress={() => setSelected(null)}
            hitSlop={10}
            className="h-7 w-7 items-center justify-center rounded-pill bg-chip"
          >
            <Text className="font-hk-bold text-[13px] text-ink-2">✕</Text>
          </Pressable>
        </Pressable>
      ) : null}

      {/* "+" — submit a place for review. Hidden while a spot card is open
          (so it doesn't overlap it). */}
      {!card ? (
        <Pressable
          onPress={() => router.push("/ort-vorschlagen")}
          accessibilityLabel={t("Submit a place", "Ort vorschlagen")}
          className="absolute h-14 w-14 items-center justify-center rounded-pill bg-accent"
          style={[{ bottom: navH + 12, right: 16 }, shadows.card]}
        >
          <Text
            className="font-hk-bold text-accent-ink"
            style={{ fontSize: 30, lineHeight: 34, marginTop: -2 }}
          >
            +
          </Text>
        </Pressable>
      ) : null}

      {/* Filter sheet */}
      {filterOpen ? (
        <MapFilterSheet
          filter={filter}
          setFilter={setFilter}
          count={spots.length}
          onClose={() => setFilterOpen(false)}
          showArt={false}
        />
      ) : null}

      {/* "Done" bar above the keyboard (iOS) for the search field */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
