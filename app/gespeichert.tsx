import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleExportSheet } from "../src/components/GoogleExportSheet";
import { CityDropdown } from "../src/components/CityDropdown";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { GoogleLogo } from "../src/components/Logos";
import { Pill } from "../src/components/Pill";
import { SceneToggle } from "../src/components/SceneToggle";
import { CATEGORY_LABEL, sortByCategory } from "../src/data/categories";
import { SPOTS } from "../src/data/spots";
import type { Category, Spot } from "../src/data/types";
import { PIN_COLORS } from "../src/lib/pinColors";
import { SCENE_CATEGORIES, SCENE_FILTERS } from "../src/lib/scene";
import { useCity } from "../src/store/city";
import { useSaved } from "../src/store/saved";
import { useScene } from "../src/store/scene";
import { shadows } from "../src/theme";

// Screen 06 — Saved.
// List of saved places (filled via the "Save" toggle in the detail view).
// Like in the Mail app: swipe a card LEFT -> delete, RIGHT -> share.

// A swipeable row.
function SavedRow({ spot }: { spot: Spot }) {
  const router = useRouter();
  const { toggle } = useSaved();
  const ref = useRef<Swipeable>(null);
  // Tracks whether the row is open (e.g. after sharing). Then a tap only
  // closes the row instead of navigating to the detail page.
  const openRef = useRef(false);

  const onShare = () => {
    Share.share({
      message: `${spot.name} — ${spot.hook}\nFound on Verso: https://verso.app`,
    }).catch(() => {});
  };

  // Actions revealed behind the row when swiping.
  const renderLeft = () => (
    <View className="my-1 mr-2 w-28 items-center justify-center rounded-card bg-accent">
      <Text className="text-[20px] text-accent-ink">↗</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
        SHARE
      </Text>
    </View>
  );
  const renderRight = () => (
    <View className="my-1 ml-2 w-28 items-center justify-center rounded-card bg-[#E2402F]">
      <Text className="text-[18px] text-white">✕</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-white">
        DELETE
      </Text>
    </View>
  );

  return (
    <Swipeable
      ref={ref}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
      onSwipeableWillOpen={() => {
        openRef.current = true;
      }}
      onSwipeableClose={() => {
        openRef.current = false;
      }}
      onSwipeableOpen={(direction) => {
        // direction "right" = swiped left -> delete action (right side).
        // direction "left"  = swiped right -> share action (left side).
        if (direction === "right") {
          toggle(spot.id); // removes from the saved places
        } else {
          onShare();
          // The row stays open -> the next tap only closes it (no jump to the
          // detail page). Only afterwards does a tap navigate normally again.
        }
      }}
      containerStyle={{ marginBottom: 8 }}
    >
      <Pressable
        onPress={() => {
          if (openRef.current) {
            ref.current?.close();
            return;
          }
          router.push(`/spot/${spot.id}`);
        }}
        className="flex-row items-center bg-screen py-2"
      >
        <ImagePlaceholder tone={spot.tone} height={64} radius={16} style={{ width: 64 }} />
        <View className="ml-4 flex-1">
          <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-3">
            {CATEGORY_LABEL[spot.category]} · {spot.neighborhood.toUpperCase()}
          </Text>
          <Text className="mt-0.5 font-hk-extrabold text-[18px] text-ink">
            {spot.name}
          </Text>
          <Text className="mt-0.5 font-hk-medium-italic text-[13px] text-ink-2">
            {spot.hook}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function Gespeichert() {
  const router = useRouter();
  const { savedIds } = useSaved();
  const { scene } = useScene();
  const { city } = useCity();
  const [exportOpen, setExportOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Reset the category selection when the scene changes.
  useEffect(() => setActiveCategory(null), [scene]);

  // Keep the order of the saved spots.
  const saved = savedIds
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => Boolean(s));

  // Filter by city (dropdown) -> scene -> hotbar category, group by type.
  const shown = sortByCategory(
    saved
      .filter((s) => s.city === city)
      .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
      .filter((s) => (activeCategory ? s.category === activeCategory : true)),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: back on the left, scene toggle on the right */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
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
              {shown.length} PLACES
            </Text>
          </View>
        }
      />

      {saved.length === 0 ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text className="mt-10 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            Nothing saved yet. Tap "Save +" on a place's detail view — then it
            lands here.
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
            paddingTop: 12,
            paddingBottom: 96, // room for the export button at the bottom right
          }}
          ListHeaderComponent={
            <View>
              {/* Category hotbar (selecting the spots), colors per category */}
              <View className="-mx-6 mt-4">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
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

              {/* Swipe hint */}
              <Text className="mt-3 font-hk-medium text-[12px] text-ink-3">
                Swipe a card: → share, ← delete.
              </Text>
              <View style={{ height: 16 }} />
            </View>
          }
          ListEmptyComponent={
            <Text className="mt-2 font-hk-medium-italic text-[15px] text-ink-3">
              Nothing saved here right now — switch city, scene or category.
            </Text>
          }
        />
      )}

      {/* Export to Google Maps — bottom right (only if there are places) */}
      {saved.length > 0 ? (
        <Pressable
          onPress={() => setExportOpen(true)}
          className="absolute flex-row items-center gap-2 rounded-pill bg-night px-4 py-3"
          style={[{ bottom: 26, right: 20, zIndex: 10 }, shadows.card]}
        >
          <GoogleLogo size={18} />
          <Text className="font-hk-bold text-[13px] text-screen">
            Export to Google Maps
          </Text>
        </Pressable>
      ) : null}

      {exportOpen ? (
        <GoogleExportSheet
          count={saved.length}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
