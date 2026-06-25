import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AMBIENTE_OPTIONS,
  ART_OPTIONS,
  DEFAULT_FILTER,
  RATING_OPTIONS,
  type MapFilter,
} from "../lib/mapFilter";
import { PIN_COLORS } from "../lib/pinColors";
import { shadows } from "../theme";
import { AnimatedChip } from "./AnimatedChip";
import { RangeSlider } from "./RangeSlider";

// Filter-Sheet für die Karte (nach Mockup 04b). Kontrolliert: der Filter kommt
// von außen (karte.tsx), Änderungen wirken sofort auf Pins + Anzahl.

export function MapFilterSheet({
  filter,
  setFilter,
  count,
  onClose,
}: {
  filter: MapFilter;
  setFilter: (f: MapFilter) => void;
  count: number;
  onClose: () => void;
}) {
  // Hilfsfunktionen zum Umschalten der Mehrfachauswahl.
  const toggleArt = (cat: MapFilter["art"][number]) =>
    setFilter({
      ...filter,
      art: filter.art.includes(cat)
        ? filter.art.filter((x) => x !== cat)
        : [...filter.art, cat],
    });
  const toggleAmb = (name: MapFilter["ambiente"][number]) =>
    setFilter({
      ...filter,
      ambiente: filter.ambiente.includes(name)
        ? filter.ambiente.filter((x) => x !== name)
        : [...filter.ambiente, name],
    });

  const budgetLabel = `${filter.minPrice} € – ${
    filter.maxPrice >= 100 ? "100+" : filter.maxPrice
  } €`;

  return (
    <View className="absolute inset-0" style={{ zIndex: 100 }}>
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(20,17,14,0.42)" }}
        onPress={onClose}
      />

      <SafeAreaView
        edges={["top"]}
        className="absolute left-0 right-0 top-0 overflow-hidden rounded-b-[32px] bg-screen"
        style={shadows.nav}
      >
        <View className="flex-row items-center justify-between px-7 pb-1 pt-3">
          <Text className="font-hk-extrabold text-title-md text-ink">Filter</Text>
          <Pressable onPress={() => setFilter(DEFAULT_FILTER)}>
            <Text className="font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
              ZURÜCKSETZEN
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ART */}
          <Text className="mb-2.5 mt-3 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            ART
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ART_OPTIONS.map((a) => {
              const on = filter.art.includes(a.cat);
              const col = PIN_COLORS[a.cat];
              return (
                <AnimatedChip
                  key={a.cat}
                  active={on}
                  onPress={() => toggleArt(a.cat)}
                  activeBg={col.oval}
                  inactiveBg="#FFFFFF"
                  activeBorder={col.oval}
                  inactiveBorder="rgba(0,0,0,0.2)"
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    className="font-hk-semibold text-[12px]"
                    style={{ color: on ? col.inner : "#6E6A63" }}
                  >
                    {a.label}
                  </Text>
                </AnimatedChip>
              );
            })}
          </View>

          {/* BUDGET */}
          <View className="mb-1.5 mt-5 flex-row items-baseline justify-between">
            <Text className="font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
              BUDGET
            </Text>
            <Text className="font-hk-extrabold text-[13px] text-ink">{budgetLabel}</Text>
          </View>
          <RangeSlider
            lo={filter.minPrice}
            hi={filter.maxPrice}
            onChange={(lo, hi) =>
              setFilter({ ...filter, minPrice: lo, maxPrice: hi })
            }
          />
          <View className="mt-2 flex-row justify-between">
            <Text className="font-hk-semibold text-[11px] text-ink-3">0 €</Text>
            <Text className="font-hk-semibold text-[11px] text-ink-3">100+ €</Text>
          </View>

          {/* BEWERTUNG */}
          <Text className="mb-2.5 mt-5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            BEWERTUNG
          </Text>
          <View className="flex-row gap-2">
            {RATING_OPTIONS.map((b) => {
              const on = b.value === filter.minRating;
              return (
                <AnimatedChip
                  key={b.label}
                  active={on}
                  onPress={() => setFilter({ ...filter, minRating: b.value })}
                  activeBg="#FFE500"
                  inactiveBg="#FFFFFF"
                  activeBorder="#FFE500"
                  inactiveBorder="rgba(0,0,0,0.2)"
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    className="font-hk-semibold text-[13px]"
                    style={{ color: on ? "#1A1A1A" : "#6E6A63" }}
                  >
                    {b.label}
                  </Text>
                </AnimatedChip>
              );
            })}
          </View>

          {/* AMBIENTE */}
          <Text className="mb-2.5 mt-5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            AMBIENTE
          </Text>
          <View className="gap-2">
            {AMBIENTE_OPTIONS.map((a) => {
              const on = filter.ambiente.includes(a.name);
              return (
                <AnimatedChip
                  key={a.name}
                  active={on}
                  onPress={() => toggleAmb(a.name)}
                  activeBg="#FFE500"
                  inactiveBg="#FFFFFF"
                  activeBorder="#FFE500"
                  inactiveBorder="rgba(0,0,0,0.1)"
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text className="font-hk-extrabold text-[15px] text-ink">
                    {a.label}
                    <Text
                      className={`font-hk-medium text-[12.5px] ${
                        on ? "text-accent-ink/70" : "text-ink-2"
                      }`}
                    >
                      {"  — "}
                      {a.desc}
                    </Text>
                  </Text>
                </AnimatedChip>
              );
            })}
          </View>
        </ScrollView>

        {/* Orte zeigen */}
        <View className="px-6 pb-3 pt-3">
          <Pressable
            onPress={onClose}
            className="flex-row items-center justify-center gap-2 rounded-[18px] bg-night py-4"
          >
            <Text className="font-hk-extrabold text-[17px] text-screen">
              {count} {count === 1 ? "Ort" : "Orte"} zeigen
            </Text>
            <Text className="text-[16px] text-screen">→</Text>
          </Pressable>
        </View>
        <View className="mb-2.5 h-[5px] w-[46px] self-center rounded-pill bg-black/15" />
      </SafeAreaView>
    </View>
  );
}
