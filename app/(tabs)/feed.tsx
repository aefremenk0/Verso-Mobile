import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryBar } from "../../src/components/CategoryBar";
import { CityDropdown } from "../../src/components/CityDropdown";
import { FilterButton } from "../../src/components/FilterButton";
import { KeyboardDoneBar } from "../../src/components/KeyboardDoneBar";
import { MapFilterSheet } from "../../src/components/MapFilterSheet";
import { SceneToggle } from "../../src/components/SceneToggle";
import { SearchField } from "../../src/components/SearchField";
import { SpotCard } from "../../src/components/SpotCard";
import { SpotListSkeleton } from "../../src/components/SpotCardSkeleton";
import { SurpriseButton } from "../../src/components/SurpriseButton";
import { sortByCategory } from "../../src/data/categories";
import type { Category } from "../../src/data/types";
import { tapMedium } from "../../src/lib/haptics";
import { useT } from "../../src/lib/i18n";
import { DEFAULT_FILTER, matchesFilter, type MapFilter } from "../../src/lib/mapFilter";
import { matchesQuery } from "../../src/lib/search";
import { SCENE_CATEGORIES } from "../../src/lib/scene";
import { useCatalog } from "../../src/store/catalog";
import { useCity } from "../../src/store/city";
import { useInsider } from "../../src/store/insider";
import { useInterests } from "../../src/store/interests";
import { useScene } from "../../src/store/scene";
import { RecentRail } from "../../src/components/RecentRail";

// Screen 02 — Discovery feed.
// Below the notch: list/map switch (centered) + scene toggle (right). Below that
// the city dropdown and the scene-dependent category bar.

export default function Feed() {
  const router = useRouter();
  const t = useT();
  const { spots: SPOTS, status } = useCatalog();
  const { city } = useCity();
  const { scene } = useScene();
  const { isInsider } = useInsider();
  const { interests } = useInterests();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  // Budget/rating/ambience filter (same as on the map). Here the category hotbar
  // handles "type" -> hidden in the sheet (showArt={false}).
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  // On scene change reset the category selection (otherwise it might show a
  // category from the other scene -> empty).
  useEffect(() => setActiveCategory(null), [scene]);

  // Gentle fade + rise of the list whenever the scene or category changes, so
  // the places don't just pop in abruptly.
  const listAnim = useSharedValue(1);
  useEffect(() => {
    listAnim.value = 0;
    listAnim.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [scene, activeCategory, listAnim]);
  const listStyle = useAnimatedStyle(() => ({
    opacity: listAnim.value,
    transform: [{ translateY: (1 - listAnim.value) * 12 }],
  }));

  // Are budget/rating/ambience set differently from the default? (type = hotbar)
  const filterActive =
    filter.minPrice > 0 ||
    filter.maxPrice < 100 ||
    filter.minRating > 0 ||
    filter.ambiente.length > 0;

  // Filter: city -> scene (category group) -> optional selected category ->
  // optional search text (name/neighborhood/tag) -> budget/rating/ambience. Then
  // group by type (sortByCategory) so the list isn't chaotic.
  const q = query.trim();
  const visibleSpots = useMemo(
    () =>
      sortByCategory(
        SPOTS.filter((s) => s.city === city)
          .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
          .filter((s) => (activeCategory ? s.category === activeCategory : true))
          // Accent- & typo-tolerant search over name / neighborhood / tags.
          .filter((s) => matchesQuery([s.name, s.neighborhood, ...s.tags], q))
          .filter((s) => matchesFilter(s, filter)),
      ),
    [SPOTS, city, scene, activeCategory, q, filter],
  );

  // Onboarding personalization: spots whose ambience matches one of the chosen
  // vibes drift gently to the top (stable — Array.sort is stable in Hermes, so
  // the category order within the groups stays intact). Nothing is hidden;
  // without chosen vibes everything stays as it is.
  const personalizedSpots = useMemo(() => {
    if (interests.length === 0) return visibleSpots;
    const fits = (s: (typeof visibleSpots)[number]) =>
      s.ambience.some((a) => interests.includes(a));
    return [...visibleSpots].sort((a, b) => Number(fits(b)) - Number(fits(a)));
  }, [visibleSpots, interests]);

  // "Surprise me" draws from the broad city+scene pool (deliberately NOT from
  // the filtered list — otherwise it wouldn't be a surprise).
  const surprisePool = useMemo(
    () =>
      SPOTS.filter(
        (s) => s.city === city && SCENE_CATEGORIES[scene].includes(s.category),
      ),
    [SPOTS, city, scene],
  );
  const onSurprise = () => {
    if (surprisePool.length === 0) return;
    tapMedium(); // small "dice roll" impulse
    const pick = surprisePool[Math.floor(Math.random() * surprisePool.length)];
    router.push(`/spot/${pick.id}`);
  };

  // Height of the floating category bar -> used as the list's paddingTop so the
  // first content starts below it (and scrolls visibly behind it).
  const [barH, setBarH] = useState(44);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Fixed & opaque: city header + search/filter. */}
      <CityDropdown right={<SceneToggle />} />
      <View className="mt-3 flex-row items-center gap-2 px-6">
        <View className="flex-1">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t("Search place, area or tag …", "Ort, Viertel oder Tag suchen …")}
          />
        </View>
        <FilterButton active={filterActive} onPress={() => setFilterOpen(true)} />
      </View>

      {/* Offline hint: DB fetch failed -> we're showing cached places. */}
      {status === "offline" ? (
        <View className="mx-6 mt-2 flex-row items-center rounded-pill bg-chip px-3.5 py-2">
          <Text className="text-[12px]">📡</Text>
          <Text className="ml-2 font-hk-semibold text-[11px] text-ink-2">
            {t(
              "Offline — showing saved places.",
              "Offline — gespeicherte Orte werden gezeigt.",
            )}
          </Text>
        </View>
      ) : null}

      {/* List + floating category bar. The bar sits transparently ABOVE the
          list -> cards scroll visibly behind it. The list fades + rises on
          scene/category change (listStyle). */}
      <View className="mt-2 flex-1">
        <Animated.View style={[{ flex: 1 }, listStyle]}>
        <FlatList
          data={personalizedSpots}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <SpotCard spot={item} hintCandidate={index === 0} />
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: barH + 6, // room for the floating bar
            paddingBottom: 110, // room for the floating nav
          }}
          ListHeaderComponent={
            <View>
              {/* "Surprise me" — Insider-only (random place, fits the core) */}
              {isInsider && surprisePool.length > 0 ? (
                <View className="mb-4">
                  <SurpriseButton onPress={onSurprise} />
                </View>
              ) : null}

              {/* Recently viewed — only when not actively searching */}
              {!q ? <RecentRail /> : null}

              {/* Subtle hint when the feed is tuned to the vibe */}
              {interests.length > 0 && !q ? (
                <Text className="mb-3 font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
                  {t("✦ TUNED TO YOUR VIBE", "✦ AUF DEINEN VIBE ABGESTIMMT")}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            // While the first DB fetch is in flight and there's nothing yet,
            // show shimmering skeletons instead of an empty screen.
            status === "loading" && !q && !filterActive ? (
              <SpotListSkeleton />
            ) : (
              <Text className="mt-10 text-center font-hk-medium-italic text-[15px] text-ink-3">
                {q || filterActive
                  ? t(
                      "Nothing matches your search/filter. Loosen the criteria.",
                      "Nichts passt zu Suche/Filter. Lockere die Kriterien.",
                    )
                  : t(
                      "Still digging here. Check back soon.",
                      "Hier kramen wir noch. Schau bald wieder rein.",
                    )}
              </Text>
            )
          }
        />
        </Animated.View>

        {/* Floating, transparent category bar (cards scroll behind it) */}
        <View
          onLayout={(e) => setBarH(e.nativeEvent.layout.height)}
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, top: 0 }}
        >
          <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
        </View>
      </View>

      {/* Filter sheet (docked at the top). The hotbar handles "type" -> off here. */}
      {filterOpen ? (
        <MapFilterSheet
          filter={filter}
          setFilter={setFilter}
          count={visibleSpots.length}
          onClose={() => setFilterOpen(false)}
          showArt={false}
        />
      ) : null}

      {/* "Done" bar above the keyboard (iOS) for the search field */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
