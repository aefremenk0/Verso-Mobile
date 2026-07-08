import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../src/components/CityDropdown";
import { FilterButton } from "../src/components/FilterButton";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { KeyboardDoneBar } from "../src/components/KeyboardDoneBar";
import { MapFilterSheet } from "../src/components/MapFilterSheet";
import { Pill } from "../src/components/Pill";
import { SceneToggle } from "../src/components/SceneToggle";
import { SearchField } from "../src/components/SearchField";
import { categoryLabel, sortByCategory } from "../src/data/categories";
import type { Category, Spot } from "../src/data/types";
import { useT, useLang } from "../src/lib/i18n";
import { spotText } from "../src/lib/localized";
import { DEFAULT_FILTER, matchesFilter, type MapFilter } from "../src/lib/mapFilter";
import { matchesQuery } from "../src/lib/search";
import { PIN_COLORS } from "../src/lib/pinColors";
import { SCENE_CATEGORIES, sceneFilters } from "../src/lib/scene";
import { useCatalog } from "../src/store/catalog";
import { useCity } from "../src/store/city";
import { useSaved } from "../src/store/saved";
import { useScene } from "../src/store/scene";

// Screen 06 — Saved.
// List of saved places (filled via the "Save" toggle in the detail view).
// Swipe a card RIGHT -> share, LEFT -> delete. YouTube-style: the colored
// action box GROWS with the finger (its width tracks the drag distance).

const SWIPE_THRESHOLD = 96; // drag distance that triggers the action

// A swipeable row built on a Reanimated Pan gesture for full control over the
// growing action boxes (the built-in Swipeable can't stretch its actions).
function SavedRow({ spot }: { spot: Spot }) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const txt = spotText(spot, lang);
  const { toggle } = useSaved();

  const tx = useSharedValue(0); // current horizontal drag (px)
  const rowW = useSharedValue(0); // measured row width (for the delete slide-off)

  const doShare = () => {
    Share.share({
      message: t(
        `${txt.name} — ${txt.hook}\nFound on Verso: https://verso.app`,
        `${txt.name} — ${txt.hook}\nGefunden auf Verso: https://verso.app`,
      ),
    }).catch(() => {});
  };
  const doDelete = () => toggle(spot.id); // removes from the saved places
  const openDetail = () => router.push(`/spot/${spot.id}`);

  // Horizontal pan only (vertical movement fails it -> the FlatList scrolls).
  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_THRESHOLD) {
        // Far left -> delete: slide the row off, then remove it.
        tx.value = withTiming(-rowW.value, { duration: 180 }, (fin) => {
          if (fin) runOnJS(doDelete)();
        });
      } else if (e.translationX >= SWIPE_THRESHOLD) {
        // Far right -> share, then spring back.
        runOnJS(doShare)();
        tx.value = withSpring(0, { damping: 18, stiffness: 220 });
      } else {
        tx.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));
  // Share box (left) grows when swiping right; delete box (right) when left.
  const shareStyle = useAnimatedStyle(() => ({ width: Math.max(0, tx.value) }));
  const deleteStyle = useAnimatedStyle(() => ({ width: Math.max(0, -tx.value) }));

  return (
    <View
      onLayout={(e) => {
        rowW.value = e.nativeEvent.layout.width;
      }}
      style={{ marginBottom: 8, borderRadius: 16, overflow: "hidden" }}
    >
      {/* Action backgrounds that GROW with the swipe (width tracks the drag). */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            overflow: "hidden",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 22,
            backgroundColor: "#FFE500",
          },
          shareStyle,
        ]}
      >
        <Text className="text-[20px] text-accent-ink">↗</Text>
        <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
          {t("SHARE", "TEILEN")}
        </Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            overflow: "hidden",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingRight: 22,
            backgroundColor: "#E2402F",
          },
          deleteStyle,
        ]}
      >
        <Text className="text-[18px] text-white">✕</Text>
        <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-white">
          {t("DELETE", "LÖSCHEN")}
        </Text>
      </Animated.View>

      {/* Row content — slides with the finger, sits on top (bg covers actions). */}
      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>
          <Pressable
            onPress={openDetail}
            className="flex-row items-center bg-screen py-2"
          >
            <ImagePlaceholder tone={spot.tone} height={64} radius={16} style={{ width: 64 }} uri={spot.imageUrl} />
            <View className="ml-4 flex-1">
              <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-3">
                {categoryLabel(spot.category, lang)} · {spot.neighborhood.toUpperCase()}
              </Text>
              <Text className="mt-0.5 font-hk-extrabold text-[18px] text-ink">
                {txt.name}
              </Text>
              <Text className="mt-0.5 font-hk-medium-italic text-[13px] text-ink-2">
                {txt.hook}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function Gespeichert() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { spots: SPOTS } = useCatalog();
  const { savedIds } = useSaved();
  const { scene } = useScene();
  const { city } = useCity();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  // Budget/rating/ambience filter (same sheet as feed/map). The category hotbar
  // handles "type" here -> hidden in the sheet (showArt={false}).
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  // Reset the category selection when the scene changes.
  useEffect(() => setActiveCategory(null), [scene]);

  // Are budget/rating/ambience set differently from the default? (type = hotbar)
  const filterActive =
    filter.minPrice > 0 ||
    filter.maxPrice < 100 ||
    filter.minRating > 0 ||
    filter.ambiente.length > 0;

  // Keep the order of the saved spots.
  const saved = savedIds
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => Boolean(s));

  // Filter: city -> scene -> hotbar category -> search text (name/neighborhood/
  // tag) -> budget/rating/ambience. Then group by type (like the feed).
  const q = query.trim();
  const shown = sortByCategory(
    saved
      .filter((s) => s.city === city)
      .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
      .filter((s) => (activeCategory ? s.category === activeCategory : true))
      // Accent- & typo-tolerant search over name / neighborhood / tags.
      .filter((s) => matchesQuery([s.name, s.neighborhood, ...s.tags], q))
      .filter((s) => matchesFilter(s, filter)),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: back on the left, scene toggle on the right */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <SceneToggle />
      </View>

      {/* City dropdown instead of "Your places"; count badge on the right */}
      <CityDropdown
        right={
          <View className="rounded-pill bg-accent px-3 py-1.5">
            <Text className="font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
              {t(`${shown.length} PLACES`, `${shown.length} ORTE`)}
            </Text>
          </View>
        }
      />

      {/* Search + filter row (like the feed) — only when there's something saved */}
      {saved.length > 0 ? (
        <View className="mt-3 flex-row items-center gap-2 px-6">
          <View className="flex-1">
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={t(
                "Search place, area or tag …",
                "Ort, Viertel oder Tag suchen …",
              )}
            />
          </View>
          <FilterButton active={filterActive} onPress={() => setFilterOpen(true)} />
        </View>
      ) : null}

      {saved.length === 0 ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text className="mt-10 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            {t(
              `Nothing saved yet. Tap "Save +" on a place's detail view — then it lands here.`,
              `Noch nichts gemerkt. Tipp im Detail eines Ortes auf „Merken +" — dann landet er hier.`,
            )}
          </Text>
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <SavedRow spot={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 96, // room for the export button at the bottom right
          }}
          ListHeaderComponent={
            <View>
              {/* Category hotbar (selecting the spots), colors per category */}
              <View className="-mx-6 mt-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
                >
                  {sceneFilters(scene, lang).map((f) => {
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

              {/* Swipe hint */}
              <Text className="mt-3 font-hk-medium text-[12px] text-ink-3">
                {t("Swipe a card: → share, ← delete.", "Wische eine Karte: → teilen, ← löschen.")}
              </Text>
              <View style={{ height: 16 }} />
            </View>
          }
          ListEmptyComponent={
            <Text className="mt-2 font-hk-medium-italic text-[15px] text-ink-3">
              {q || filterActive
                ? t(
                    "Nothing matches your search/filter. Loosen the criteria.",
                    "Nichts passt zu Suche/Filter. Lockere die Kriterien.",
                  )
                : t(
                    "Nothing saved here right now — switch city, scene or category.",
                    "Hier ist gerade nichts gemerkt — wechsle Stadt, Szene oder Kategorie.",
                  )}
            </Text>
          }
        />
      )}

      {/* Filter sheet (docked at the top). The hotbar handles "type" -> off here. */}
      {filterOpen ? (
        <MapFilterSheet
          filter={filter}
          setFilter={setFilter}
          count={shown.length}
          onClose={() => setFilterOpen(false)}
          showArt={false}
        />
      ) : null}

      {/* "Done" bar above the keyboard (iOS) for the search field */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
