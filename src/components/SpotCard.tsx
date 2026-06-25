import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CATEGORY_LABEL } from "../data/categories";
import type { Spot } from "../data/types";
import { PIN_COLORS } from "../lib/pinColors";
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

// Einmal pro Session: auf der ersten Feed-Karte die Long-Press-Geste zeigen
// (Menü ploppt kurz auf + Hinweis-Chip). In-memory, kein Speicher nötig.
let feedHintShown = false;

export function SpotCard({
  spot,
  hintCandidate = false,
}: {
  spot: Spot;
  /** true nur für die erste Karte im Feed -> zeigt einmalig die Geste. */
  hintCandidate?: boolean;
}) {
  const router = useRouter();
  const { isSaved, toggle } = useSaved();
  const burstRef = useRef<QuestionBubblesHandle>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Druckstelle merken, damit der Herz-Burst von dort startet.
  const pressPos = useRef({ x: 0, y: 0 });

  // Hinweis-Chip (B) + Auto-Demo (A) für die Long-Press-Geste.
  const [hint, setHint] = useState(false);
  const hintOpacity = useSharedValue(0);
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  useEffect(() => {
    if (!hintCandidate || feedHintShown) return;
    feedHintShown = true;
    setMenuOpen(true); // A: Kreis-Menü kurz aufploppen lassen
    setHint(true); // B: Hinweis-Chip oben rechts
    hintOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(3000, withTiming(0, { duration: 500 })),
    );
    const t1 = setTimeout(() => setMenuOpen(false), 1600);
    const t2 = setTimeout(() => setHint(false), 3900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // nur beim ersten Mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Caps-Zeile: Bezirk + erste zwei Tags (z. B. "WIEDEN · NATURAL · SPÄT").
  const metaLine = [spot.neighborhood.split(",")[0], ...spot.tags.slice(0, 2)]
    .join("  ·  ")
    .toUpperCase();

  // Kategorie-Farbe (oben links) — dieselbe Quelle wie Karten-Pins.
  const col = PIN_COLORS[spot.category];

  const onLongPress = (e: GestureResponderEvent) => {
    pressPos.current = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
    setMenuOpen(true);
  };

  // Herz toggelt: nicht gemerkt -> merken (+ Herz-Burst); schon gemerkt ->
  // wieder aus „Deine Orte" entfernen (ohne Burst).
  const onSave = () => {
    const wasSaved = isSaved(spot.id);
    toggle(spot.id);
    setMenuOpen(false);
    if (!wasSaved) burstRef.current?.burst(pressPos.current.x, pressPos.current.y);
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
          {/* Kategorie-Badge oben links — in der Kategorie-Farbe */}
          <View
            className="absolute left-4 top-4 rounded-pill px-3 py-1"
            style={{ backgroundColor: col.oval }}
          >
            <Text
              className="font-hk-bold text-[11px] tracking-[1px]"
              style={{ color: col.inner }}
            >
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

      {/* Hinweis-Chip oben rechts (B) — nur einmalig auf der ersten Karte. */}
      {hint ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 12, right: 12, zIndex: 15 }, hintStyle]}
        >
          <View className="rounded-pill bg-night px-3 py-1.5" style={shadows.card}>
            <Text className="font-hk-semibold text-[11px] text-screen">
              Lange drücken: Merken & Teilen
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Herz-Burst über der Karte (nicht vom rounded-card abgeschnitten) */}
      <QuestionBubbles ref={burstRef} glyph="♥" textColor="#1A1A1A" />
    </View>
  );
}
