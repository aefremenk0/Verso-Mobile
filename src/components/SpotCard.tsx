import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { CATEGORY_LABEL } from "../data/categories";
import type { Spot } from "../data/types";
import { shadows } from "../theme";
import { ImagePlaceholder } from "./ImagePlaceholder";

// Eine Spot-Karte im Discovery-Feed.
// Tippen öffnet das passende Detail (Spot oder Event teilen sich /spot/[id]).

export function SpotCard({ spot }: { spot: Spot }) {
  const router = useRouter();

  // Caps-Zeile: Bezirk + erste zwei Tags (z. B. "WIEDEN · NATURAL · SPÄT").
  const metaLine = [spot.neighborhood.split(",")[0], ...spot.tags.slice(0, 2)]
    .join("  ·  ")
    .toUpperCase();

  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      className="mb-5 overflow-hidden rounded-card bg-surface"
      style={shadows.card}
    >
      <ImagePlaceholder tone={spot.tone} height={150} radius={0} note={spot.imageNote}>
        {/* Kategorie-Badge oben links */}
        <View className="absolute left-4 top-4 rounded-pill bg-accent px-3 py-1">
          <Text className="font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
            {CATEGORY_LABEL[spot.category]}
          </Text>
        </View>
      </ImagePlaceholder>

      <View className="px-5 pb-5 pt-4">
        <Text className="font-hk-extrabold text-title-md text-ink">{spot.name}</Text>

        <Text className="mt-1.5 font-hk-bold-italic text-hook text-ink">
          {spot.hook}
        </Text>

        <Text className="mt-3 font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
          {metaLine}
        </Text>

        <View className="mt-2 flex-row">
          <Text className="font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
            ADRESSE{"  "}
          </Text>
          <Text className="flex-1 font-hk-medium text-[13px] text-ink-2">
            {spot.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
