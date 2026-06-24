import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { CATEGORY_LABEL } from "../src/data/categories";
import { SPOTS } from "../src/data/spots";
import type { Spot } from "../src/data/types";
import { useSaved } from "../src/store/saved";

// Screen 06 — Gespeichert.
// Liste der gemerkten Orte (gefüllt über den "Merken"-Toggle im Detail).
// Wie in der Mail-App: Karte nach LINKS wischen -> löschen, nach RECHTS -> teilen.

// Eine wischbare Zeile.
function SavedRow({ spot }: { spot: Spot }) {
  const router = useRouter();
  const { toggle } = useSaved();
  const ref = useRef<Swipeable>(null);

  const onShare = () => {
    Share.share({
      message: `${spot.name} — ${spot.hook}\nGefunden auf Verso: https://verso.app`,
    }).catch(() => {});
  };

  // Hinter der Zeile sichtbare Aktionen beim Wischen.
  const renderLeft = () => (
    <View className="my-1 mr-2 w-28 items-center justify-center rounded-card bg-accent">
      <Text className="text-[20px] text-accent-ink">↗</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
        TEILEN
      </Text>
    </View>
  );
  const renderRight = () => (
    <View className="my-1 ml-2 w-28 items-center justify-center rounded-card bg-[#E2402F]">
      <Text className="text-[18px] text-white">✕</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-white">
        LÖSCHEN
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
      onSwipeableOpen={(direction) => {
        // direction "right" = nach links gewischt -> Löschen-Aktion (rechts).
        // direction "left"  = nach rechts gewischt -> Teilen-Aktion (links).
        if (direction === "right") {
          toggle(spot.id); // entfernt aus den gemerkten Orten
        } else {
          onShare();
          ref.current?.close();
        }
      }}
      containerStyle={{ marginBottom: 8 }}
    >
      <Pressable
        onPress={() => router.push(`/spot/${spot.id}`)}
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

  // Reihenfolge der gemerkten Spots beibehalten.
  const saved = savedIds
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => Boolean(s));

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <View className="rounded-pill bg-accent px-3 py-1.5">
          <Text className="font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
            {saved.length} ORTE
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          GESPEICHERT
        </Text>
        <Text
          className="mt-2 font-hk-extrabold text-ink"
          style={{ fontSize: 38, lineHeight: 40 }}
        >
          Deine Orte
        </Text>

        {saved.length === 0 ? (
          <Text className="mt-10 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            Noch nichts gemerkt. Tipp im Detail eines Ortes auf „Merken +" — dann
            landet er hier.
          </Text>
        ) : (
          <>
            {/* Wisch-Hinweis */}
            <Text className="mt-3 font-hk-medium text-[12px] text-ink-3">
              Wische eine Karte: → teilen, ← löschen.
            </Text>
            <View className="mt-4">
              {saved.map((spot) => (
                <SavedRow key={spot.id} spot={spot} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
