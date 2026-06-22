import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { CityMap } from "../../src/components/CityMap";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { CATEGORY_LABEL, priceLabel } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import { useCity } from "../../src/store/city";
import { shadows } from "../../src/theme";

// Screen 04 — Kartenansicht.
//
// Hintergrund = <CityMap/>: echte Mapbox-Karte im Dev Build (mit Token),
// sonst stilisierte Karte (Expo Go). Darüber liegen Stadt-Dropdown,
// Filter-Leiste und die schwebende Spot-Karte.

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

      {/* Karte (Mapbox im Dev Build, sonst stilisiert) */}
      <View className="mt-3 flex-1 overflow-hidden">
        <CityMap spots={spots} />
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
