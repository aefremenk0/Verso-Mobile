import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { CATEGORY_LABEL, priceLabel } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import { useCity } from "../../src/store/city";
import { shadows } from "../../src/theme";

// Screen 04 — Kartenansicht (stilisierte Karte, Phase 1).
//
// Die ECHTE interaktive Karte braucht `react-native-maps` (Dev Build, Phase 2).
// Hier eine designgetreue, stilisierte Karte mit Pins, die in Expo Go läuft:
// gelbe Label-Pins, schwebende Spot-Karte, Filter-Leiste (Phase-2-Optik).

// Feste Pin-Positionen (Prozent der Kartenfläche), zyklisch genutzt.
const PIN_POS = [
  { top: "40%", left: "40%" },
  { top: "20%", left: "62%" },
  { top: "60%", left: "20%" },
  { top: "30%", left: "26%" },
  { top: "55%", left: "72%" },
];

export default function Karte() {
  const router = useRouter();
  const { city } = useCity();

  const spots = SPOTS.filter((s) => s.city === city);
  const active = spots[0];

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

      {/* Filter-Leiste (Phase-2-Optik) */}
      <View className="mt-3 flex-row justify-center gap-2 px-6">
        {["Art", "Budget", "Bewertung", "Ambiente"].map((f, i) => (
          <View
            key={f}
            className={`rounded-pill px-3 py-2 ${
              i === 0 || i === 3 ? "bg-accent" : "border border-black/10 bg-surface"
            }`}
          >
            <Text
              className={`font-hk-semibold text-[12px] ${
                i === 0 || i === 3 ? "text-accent-ink" : "text-ink"
              }`}
            >
              {f}
            </Text>
          </View>
        ))}
      </View>

      {/* Stilisierte Kartenfläche */}
      <View className="mt-3 flex-1 overflow-hidden">
        <View className="absolute inset-0 bg-map-land" />
        {/* Parks */}
        <View
          className="absolute h-[86px] w-[118px] rounded-[16px] bg-map-park"
          style={{ top: 120, left: 36 }}
        />
        <View
          className="absolute h-[80px] w-[96px] rounded-[16px] bg-map-park"
          style={{ bottom: 220, right: 30 }}
        />
        {/* Wasser (diagonaler Streifen) */}
        <View
          className="absolute bg-map-water"
          style={{ top: -60, right: -26, width: 60, height: "150%", transform: [{ rotate: "26deg" }] }}
        />
        {/* Straße */}
        <View
          className="absolute bg-[#F1ECE3]"
          style={{ top: 40, left: 130, width: 50, height: "120%", transform: [{ rotate: "20deg" }] }}
        />

        {/* Straßennamen */}
        <Text className="absolute font-hk-medium text-[10px] text-[#9C978E]" style={{ top: 80, left: 40 }}>
          Operngasse
        </Text>
        <Text className="absolute font-hk-medium text-[10px] text-[#9C978E]" style={{ top: 300, left: 230 }}>
          Rechte Wienzeile
        </Text>

        {/* Pins */}
        {spots.slice(0, 5).map((spot, i) => {
          const pos = PIN_POS[i];
          const isActive = i === 0;
          const hasLabel = i <= 2;
          return (
            <Pressable
              key={spot.id}
              onPress={() => router.push(`/spot/${spot.id}`)}
              className="absolute items-center"
              style={{ top: pos.top as `${number}%`, left: pos.left as `${number}%` }}
            >
              {hasLabel ? (
                <View
                  className={`mb-1 rounded-pill px-3 py-1.5 ${
                    isActive ? "bg-accent" : "bg-night"
                  }`}
                  style={shadows.card}
                >
                  <Text
                    className={`font-hk-extrabold ${
                      isActive ? "text-[15px] text-accent-ink" : "text-[12px] text-white"
                    }`}
                  >
                    {spot.name}
                  </Text>
                </View>
              ) : null}
              <View
                className="rounded-pill bg-night"
                style={{ width: 13, height: 13, borderWidth: 2.5, borderColor: "#F7F4EF" }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Schwebende Spot-Karte */}
      {active ? (
        <Pressable
          onPress={() => router.push(`/spot/${active.id}`)}
          className="absolute left-4 right-4 flex-row items-center gap-3.5 rounded-card bg-surface p-3.5"
          style={[{ bottom: 94 }, shadows.card]}
        >
          <ImagePlaceholder tone={active.tone} height={66} radius={18} style={{ width: 66 }} />
          <View className="flex-1">
            <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-ink-3">
              {CATEGORY_LABEL[active.category]} · {active.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(active.priceLevel)}
            </Text>
            <Text className="mt-0.5 font-hk-extrabold text-[22px] text-ink">{active.name}</Text>
            <Text className="mt-0.5 font-hk-medium-italic text-[12px] text-ink-2" numberOfLines={1}>
              {active.hook}
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
          </View>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
