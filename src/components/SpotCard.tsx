import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { categoryLabel } from "../data/categories";
import type { Spot } from "../data/types";
import { useLang, useT } from "../lib/i18n";
import { spotText } from "../lib/localized";
import { PIN_COLORS } from "../lib/pinColors";
import { useSaved } from "../store/saved";
import { shadows } from "../theme";
import { ImagePlaceholder } from "./ImagePlaceholder";
import {
  QuestionBubbles,
  type QuestionBubblesHandle,
} from "./QuestionBubbles";
import { SpotActionMenu } from "./SpotActionMenu";

// A spot card in the discovery feed.
// Tapping opens the matching detail (spot and event share /spot/[id]).
// LONG-press opens a Pinterest-style circle menu (Save / Share).

// Once per session: show the long-press gesture on the first feed card
// (menu pops open briefly + hint chip). In-memory, no storage needed.
let feedHintShown = false;

export function SpotCard({
  spot,
  hintCandidate = false,
}: {
  spot: Spot;
  /** true only for the first card in the feed -> shows the gesture once. */
  hintCandidate?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const txt = spotText(spot, lang);
  const { isSaved, toggle } = useSaved();
  const burstRef = useRef<QuestionBubblesHandle>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { height } = useWindowDimensions();
  // Remember the press point (relative to the card) + screen-Y (for direction).
  const pressPos = useRef({ x: 0, y: 0 });
  const pressPageY = useRef(0);

  // Hint chip (B) + auto-demo (A) for the long-press gesture.
  const [hint, setHint] = useState(false);
  const hintOpacity = useSharedValue(0);
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  useEffect(() => {
    if (!hintCandidate || feedHintShown) return;
    feedHintShown = true;
    setMenuOpen(true); // A: briefly pop open the circle menu
    setHint(true); // B: hint chip in the top right
    hintOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(3800, withTiming(0, { duration: 500 })),
    );
    const t1 = setTimeout(() => setMenuOpen(false), 2400); // keep the menu open longer
    const t2 = setTimeout(() => setHint(false), 4700); // keep the chip visible longer
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // only on the first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Caps line: neighborhood + first two tags (e.g. "WIEDEN · NATURAL · LATE").
  const metaLine = [spot.neighborhood.split(",")[0], ...txt.tags.slice(0, 2)]
    .join("  ·  ")
    .toUpperCase();

  // Category color (top left) — same source as the map pins.
  const col = PIN_COLORS[spot.category];

  const onLongPress = (e: GestureResponderEvent) => {
    pressPos.current = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
    pressPageY.current = e.nativeEvent.pageY;
    setMenuOpen(true);
  };

  // Heart toggles: not saved -> save (+ heart burst); already saved ->
  // remove from "Your places" again (without a burst).
  const onSave = () => {
    const wasSaved = isSaved(spot.id);
    toggle(spot.id);
    setMenuOpen(false);
    if (!wasSaved) {
      // Near the top edge -> hearts fall DOWN (otherwise invisible).
      const dir = pressPageY.current < height * 0.4 ? "down" : "up";
      burstRef.current?.burst(pressPos.current.x, pressPos.current.y, dir);
    }
  };

  // Share via the native share sheet (iMessage, WhatsApp, …).
  const onShare = () => {
    setMenuOpen(false);
    Share.share({
      message: t(
        `${txt.name} — ${txt.hook}\nFound on Verso: https://verso.app`,
        `${txt.name} — ${txt.hook}\nGefunden auf Verso: https://verso.app`,
      ),
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
          {/* Category badge top left — in the category color */}
          <View
            className="absolute left-4 top-4 rounded-pill px-3 py-1"
            style={{ backgroundColor: col.oval }}
          >
            <Text
              className="font-hk-bold text-[11px] tracking-[1px]"
              style={{ color: col.inner }}
            >
              {categoryLabel(spot.category, lang)}
            </Text>
          </View>
        </ImagePlaceholder>

        <View className="px-5 pb-5 pt-4">
          <Text className="font-hk-extrabold text-title-md text-ink">{txt.name}</Text>

          <Text className="mt-1.5 font-hk-bold-italic text-hook text-ink">
            {txt.hook}
          </Text>

          <Text className="mt-3 font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
            {metaLine}
          </Text>

          <View className="mt-2 flex-row items-baseline">
            <Text className="font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
              {t("ADDRESS", "ADRESSE")}{"  "}
            </Text>
            <Text className="flex-1 font-hk-medium text-[13px] text-ink-2">
              {spot.address}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Pinterest-style circle menu (Save / Share) on long-press */}
      {menuOpen ? (
        <SpotActionMenu
          saved={isSaved(spot.id)}
          onSave={onSave}
          onShare={onShare}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}

      {/* Hint chip top right (B) — only once on the first card. */}
      {hint ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 12, right: 12, zIndex: 15 }, hintStyle]}
        >
          <View className="rounded-pill bg-night px-3 py-1.5" style={shadows.card}>
            <Text className="font-hk-semibold text-[11px] text-white">
              {t("Long-press: Save & Share", "Lange drücken: Merken & Teilen")}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Heart burst over the card (not clipped by rounded-card) */}
      <QuestionBubbles ref={burstRef} glyph="♥" textColor="#1A1A1A" />
    </View>
  );
}
