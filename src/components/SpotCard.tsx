import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";
import { CATEGORY_LABEL } from "../data/categories";
import type { Spot } from "../data/types";
import { useSaved } from "../store/saved";
import { shadows } from "../theme";
import { ImagePlaceholder } from "./ImagePlaceholder";
import {
  QuestionBubbles,
  type QuestionBubblesHandle,
} from "./QuestionBubbles";
import { SpotActionMenu } from "./SpotActionMenu";

// Eine Spot-Karte im Discovery-Feed.
// Tippen öffnet das passende Detail (Spot oder Event teilen sich /spot/[id]).
// LANGE drücken öffnet ein Pinterest-artiges Kreis-Menü (Merken / Teilen).

export function SpotCard({ spot }: { spot: Spot }) {
  const router = useRouter();
  const { isSaved, toggle } = useSaved();
  const burstRef = useRef<QuestionBubblesHandle>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Druckstelle merken, damit der Herz-Burst von dort startet.
  const pressPos = useRef({ x: 0, y: 0 });

  // Caps-Zeile: Bezirk + erste zwei Tags (z. B. "WIEDEN · NATURAL · SPÄT").
  const metaLine = [spot.neighborhood.split(",")[0], ...spot.tags.slice(0, 2)]
    .join("  ·  ")
    .toUpperCase();

  const onLongPress = (e: GestureResponderEvent) => {
    pressPos.current = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
    setMenuOpen(true);
  };

  // Merken (merkt immer, ent-merkt nie) + Herz-Burst an der Druckstelle.
  const onSave = () => {
    if (!isSaved(spot.id)) toggle(spot.id);
    setMenuOpen(false);
    burstRef.current?.burst(pressPos.current.x, pressPos.current.y);
  };

  // Teilen über das systemeigene Share-Sheet (iMessage, WhatsApp, …).
  const onShare = () => {
    setMenuOpen(false);
    Share.share({
      message: `${spot.name} — ${spot.hook}\nGefunden auf Verso: https://verso.app`,
    }).catch(() => {});
  };

  return (
    <View className="mb-5">
      <Pressable
        onPress={() => router.push(`/spot/${spot.id}`)}
        onLongPress={onLongPress}
        delayLongPress={300}
        className="overflow-hidden rounded-card bg-surface"
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

      {/* Pinterest-artiges Kreis-Menü (Merken / Teilen) bei Long-Press */}
      {menuOpen ? (
        <SpotActionMenu
          saved={isSaved(spot.id)}
          onSave={onSave}
          onShare={onShare}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}

      {/* Herz-Burst über der Karte (nicht vom rounded-card abgeschnitten) */}
      <QuestionBubbles ref={burstRef} glyph="♥" textColor="#1A1A1A" />
    </View>
  );
}
