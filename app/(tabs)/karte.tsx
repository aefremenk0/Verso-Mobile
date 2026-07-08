import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
import type { Category, Spot } from "../../src/data/types";
import {
  DEFAULT_FILTER,
  matchesFilter,
  type MapFilter,
} from "../../src/lib/mapFilter";
import { matchesQuery } from "../../src/lib/search";
import { useLang, useT } from "../../src/lib/i18n";
import { spotText } from "../../src/lib/localized";
import { SCENE_CATEGORIES, type Scene } from "../../src/lib/scene";
import { useCatalog } from "../../src/store/catalog";
import { useCity } from "../../src/store/city";
import { useScene } from "../../src/store/scene";
import { shadows } from "../../src/theme";

// Screen 04 — Map view.
// Map (Apple/Google Maps via react-native-maps in the dev build, otherwise
// stylized). Pins are tappable -> only then does the small spot card appear.
// FILTER opens the filter sheet whose selection filters pins AND the count.

// Floating spot card that springs up when a pin is selected. Rendered with a
// `key={spot.id}` so switching pins remounts it -> it re-pops each time.
function MapSpotCard({
  spot,
  lang,
  bottom,
  onOpen,
  onClose,
}: {
  spot: Spot;
  lang: ReturnType<typeof useLang>;
  bottom: number;
  onOpen: () => void;
  onClose: () => void;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    // Pop in: rise + scale up + fade (spring).
    p.value = withSpring(1, { damping: 15, stiffness: 200, mass: 0.7 });
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [
      { translateY: (1 - p.value) * 26 },
      { scale: 0.92 + p.value * 0.08 },
    ],
  }));
  const txt = spotText(spot, lang);

  return (
    <Animated.View
      style={[{ position: "absolute", left: 16, right: 16, bottom }, style]}
    >
      <Pressable
        onPress={onOpen}
        className="flex-row items-center gap-3.5 rounded-card bg-surface p-3.5"
        style={shadows.card}
      >
        <ImagePlaceholder tone={spot.tone} height={66} radius={18} style={{ width: 66 }} uri={spot.imageUrl} />
        <View className="flex-1">
          <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-ink-3">
            {categoryLabel(spot.category, lang)} · {spot.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(spot.priceLevel)}
          </Text>
          <Text className="mt-0.5 font-hk-extrabold text-[22px] text-ink">{txt.name}</Text>
          <Text className="mt-0.5 font-hk-medium-italic text-[12px] text-ink-2" numberOfLines={1}>
            {txt.hook}
          </Text>
        </View>
        {/* Close (clear selection) */}
        <Pressable
          onPress={onClose}
          hitSlop={10}
          className="h-7 w-7 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[13px] text-ink-2">✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function Karte() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { spots: SPOTS } = useCatalog();
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
  }, [focus, SPOTS]);

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
  const q = query.trim();
  const spots = useMemo(
    () =>
      SPOTS.filter((s) => s.city === city)
        .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
        .filter((s) => (activeCategory ? s.category === activeCategory : true))
        // Accent- & typo-tolerant search over name / neighborhood / tags.
        .filter((s) => matchesQuery([s.name, s.neighborhood, ...s.tags], q))
        .filter((s) => matchesFilter(s, filter)),
    [SPOTS, city, scene, activeCategory, q, filter],
  );

  // Only show the selected spot if it's still in the filtered result.
  const card = selected && spots.some((s) => s.id === selected.id) ? selected : null;

  // Tap a pin: select it — tap the same one again: hide it. On select, gently
  // recenter the real map on that pin (native animateToRegion) for feedback.
  const onSelectSpot = (s: Spot) =>
    setSelected((prev) => {
      const next = prev?.id === s.id ? null : s;
      if (next) setCenterOn({ latitude: s.lat, longitude: s.lng, key: Date.now() });
      return next;
    });

  // Bottom nav field height. The map area ends exactly at the nav's top edge
  // (marginBottom), so the Apple logo (pinned to the map frame bottom) sits
  // right above the nav. The category bar height is measured -> mapPadding.top.
  const navH = insets.bottom + 62;
  const [catBarH, setCatBarH] = useState(52);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* White field: city header + search/filter sit on solid background,
          above the map (not floating over it). */}
      <View className="border-b border-line/5">
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

      {/* Spot card: appears once a pin has been tapped. Pops up (spring) and
          re-pops when switching pins (keyed by id). Sits above the bottom nav. */}
      {card ? (
        <MapSpotCard
          key={card.id}
          spot={card}
          lang={lang}
          bottom={navH + 12}
          onOpen={() => router.push(`/spot/${card.id}`)}
          onClose={() => setSelected(null)}
        />
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
