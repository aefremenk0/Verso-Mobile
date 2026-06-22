import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { CityMap } from "../../src/components/CityMap";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { MapFilterSheet } from "../../src/components/MapFilterSheet";
import { CATEGORY_LABEL, priceLabel } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import type { Spot } from "../../src/data/types";
import { useCity } from "../../src/store/city";
import { shadows } from "../../src/theme";

// Screen 04 — Kartenansicht.
// Karte (Mapbox im Dev Build, sonst stilisiert). Pins sind antippbar -> erst
// dann erscheint die kleine Spot-Karte. FILTER-Button öffnet das Filter-Sheet.

export default function Karte() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { city } = useCity();

  const spots = SPOTS.filter((s) => s.city === city);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Liste/Karte-Umschalter rechts neben dem Stadt-Dropdown.
  const toggle = (
    <View className="flex-row rounded-pill bg-chip p-1">
      <Pressable
        onPress={() => router.push("/(tabs)/feed")}
        className="rounded-pill px-4 py-2"
      >
        <Text className="font-hk-semibold text-[13px] text-ink-2">Liste</Text>
      </Pressable>
      <View className="rounded-pill bg-accent px-4 py-2">
        <Text className="font-hk-semibold text-[13px] text-accent-ink">Karte</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      <CityDropdown right={toggle} />

      {/* Filter-Schnellwahl + FILTER-Button */}
      <View className="mt-3 gap-2.5 px-6">
        <View className="flex-row justify-center gap-2">
          {["Art", "Budget", "Bewertung", "Ambiente"].map((f, i) => (
            <Pressable
              key={f}
              onPress={() => setFilterOpen(true)}
              className={`rounded-pill px-4 py-2.5 ${
                i === 0 || i === 3 ? "bg-accent" : "border border-black/10 bg-surface"
              }`}
            >
              <Text
                className={`font-hk-semibold text-[13px] ${
                  i === 0 || i === 3 ? "text-accent-ink" : "text-ink"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setFilterOpen(true)}
          className="flex-row items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-surface py-3"
          style={shadows.card}
        >
          <Text className="font-hk-semibold text-[12px] tracking-[1px] text-ink">
            FILTER
          </Text>
          <Text className="text-[11px] text-ink">▾</Text>
        </Pressable>
      </View>

      {/* Karte */}
      <View className="mt-3 flex-1 overflow-hidden">
        <CityMap
          spots={spots}
          selectedId={selected?.id}
          onSelect={(s) => setSelected(s)}
        />
      </View>

      {/* Spot-Karte: erscheint erst, wenn ein Pin angetippt wurde.
          Sitzt über der schwebenden Nav (Safe-Area + Nav-Höhe). */}
      {selected ? (
        <Pressable
          onPress={() => router.push(`/spot/${selected.id}`)}
          className="absolute left-4 right-4 flex-row items-center gap-3.5 rounded-card bg-surface p-3.5"
          style={[{ bottom: insets.bottom + 92 }, shadows.card]}
        >
          <ImagePlaceholder tone={selected.tone} height={66} radius={18} style={{ width: 66 }} />
          <View className="flex-1">
            <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-ink-3">
              {CATEGORY_LABEL[selected.category]} · {selected.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(selected.priceLevel)}
            </Text>
            <Text className="mt-0.5 font-hk-extrabold text-[22px] text-ink">{selected.name}</Text>
            <Text className="mt-0.5 font-hk-medium-italic text-[12px] text-ink-2" numberOfLines={1}>
              {selected.hook}
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
        <MapFilterSheet count={spots.length} onClose={() => setFilterOpen(false)} />
      ) : null}
    </SafeAreaView>
  );
}
