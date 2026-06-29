import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedChip } from "../../src/components/AnimatedChip";
import { Button } from "../../src/components/Button";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { MiniMap } from "../../src/components/MiniMap";
import { Pill } from "../../src/components/Pill";
import {
  QuestionBubbles,
  type QuestionBubblesHandle,
} from "../../src/components/QuestionBubbles";
import {
  CATEGORY_LABEL,
  isEventCategory,
  priceLabel,
} from "../../src/data/categories";
import { getSpotById } from "../../src/data/spots";
import { notifySuccess, tapLight } from "../../src/lib/haptics";
import { openAppleMaps, openExternal, openGoogleMaps } from "../../src/lib/maps";
import { distanceLabel, getOpenState } from "../../src/lib/spotMeta";
import { useSaved } from "../../src/store/saved";

// Screen 03 — Spot detail (and event detail).
// Events are spots with category "event" and additionally show When/Meeting point
// plus "Book ticket". Both share this route.

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSaved, toggle } = useSaved();

  const spot = getSpotById(id);

  if (!spot) {
    return (
      <View className="flex-1 items-center justify-center bg-screen px-8">
        <Text className="font-hk-semibold text-[16px] text-ink-2">
          This place doesn't exist (yet).
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-hk-bold text-[15px] text-ink underline">Back</Text>
        </Pressable>
      </View>
    );
  }

  const isEvent = isEventCategory(spot.category);
  const saved = isSaved(spot.id);
  const metaLine = `${CATEGORY_LABEL[spot.category]} · ${spot.neighborhood.toUpperCase()}`;
  // Detail depth: open status (null for events) + distance to the center.
  const openState = getOpenState(spot);
  const distanz = distanceLabel(spot);

  // Share place/event via the native share sheet (iMessage, WhatsApp, …).
  const onShare = () => {
    Share.share({
      message: `${spot.name} — ${spot.hook}\nFound on Verso: https://verso.app`,
    }).catch(() => {});
  };

  // Save: toggles; when adding, hearts fall DOWN (button sits at the top).
  const burstRef = useRef<QuestionBubblesHandle>(null);
  const merkenRef = useRef<View>(null);
  const onMerken = () => {
    const wasSaved = saved;
    toggle(spot.id);
    // Haptics: success when adding, light tap when removing.
    if (!wasSaved) {
      notifySuccess();
      merkenRef.current?.measureInWindow((x, y, w, h) => {
        burstRef.current?.burst(x + w / 2, y + h, "down");
      });
    } else {
      tapLight();
    }
  };

  return (
    <View className="flex-1 bg-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Hero (larger, so no empty area is left at the bottom) */}
        <ImagePlaceholder tone={spot.tone} height={400} radius={0}>
          {/* Back + Save (with safe-area spacing at the top) */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-5"
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center rounded-pill bg-surface"
            >
              <Text className="font-hk-bold text-[18px] text-ink">←</Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              {/* Share (share sheet) */}
              <Pressable
                onPress={onShare}
                accessibilityLabel="Share place"
                className="h-10 w-10 items-center justify-center rounded-pill bg-surface"
              >
                <Text className="font-hk-bold text-[16px] text-ink">↗</Text>
              </Pressable>
              <View ref={merkenRef} collapsable={false}>
                <AnimatedChip
                  active={saved}
                  onPress={onMerken}
                  activeBg="#FFE500"
                  inactiveBg="#FFFFFF"
                  activeBorder="#FFE500"
                  inactiveBorder="rgba(26,26,26,0.18)"
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text className="font-hk-bold text-[13px] text-ink">
                    {saved ? "Saved ✓" : "Save +"}
                  </Text>
                </AnimatedChip>
              </View>
            </View>
          </View>
        </ImagePlaceholder>

        {/* Content sheet, pulled slightly over the hero.
            flex-1 + spacer push the CTAs to the bottom -> no more empty
            white area. */}
        <View
          className="-mt-6 flex-1 rounded-t-sheet bg-screen px-6 pt-7"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
            {metaLine}
          </Text>
          <Text
            className="mt-3 font-hk-extrabold text-ink"
            style={{ fontSize: 46, lineHeight: 48 }}
          >
            {spot.name}
          </Text>

          {/* Hook: italic + underlined (no yellow block) */}
          <Text
            className="mt-4 font-hk-extrabold-italic text-[20px] leading-[28px] text-ink"
            style={{ textDecorationLine: "underline" }}
          >
            {spot.hook}
          </Text>

          {/* Status line: "Open now?" (not for events) + distance */}
          {openState || distanz ? (
            <View className="mt-4 flex-row flex-wrap items-center gap-2">
              {openState ? (
                <View className="flex-row items-center rounded-pill bg-surface px-3 py-1.5">
                  <View
                    className="mr-2 h-2 w-2 rounded-pill"
                    style={{ backgroundColor: openState.openNow ? "#1E9E54" : "#C0392B" }}
                  />
                  <Text className="font-hk-bold text-[12px] text-ink">
                    {openState.openNow ? "Open now" : "Closed"}
                  </Text>
                  <Text className="ml-1.5 font-hk-medium text-[12px] text-ink-3">
                    · {openState.label}
                  </Text>
                </View>
              ) : null}
              {distanz ? (
                <View className="flex-row items-center rounded-pill bg-surface px-3 py-1.5">
                  <View className="mr-2 h-2 w-2 rounded-pill bg-ink-3" />
                  <Text className="font-hk-medium text-[12px] text-ink-2">
                    {distanz}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Event block: When / Meeting point */}
          {isEvent ? (
            <View className="mt-5 rounded-card bg-surface p-4">
              <View className="flex-row">
                <Text className="w-20 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
                  WHEN
                </Text>
                <Text className="flex-1 font-hk-semibold text-[14px] text-ink">
                  {spot.dateLabel}
                </Text>
              </View>
              <View className="mt-3 flex-row">
                <Text className="w-20 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
                  MEET
                </Text>
                <Text className="flex-1 font-hk-semibold text-[14px] text-ink">
                  {spot.meetingPoint}
                </Text>
              </View>
            </View>
          ) : null}

          <Text className="mt-5 font-hk-medium text-[15px] leading-[22px] text-ink-2">
            {spot.description}
          </Text>

          {/* Tags + price */}
          <View className="mt-5 flex-row flex-wrap items-center gap-2">
            {spot.tags.map((t) => (
              <Pill key={t} label={t} small />
            ))}
            <Pill label={priceLabel(spot.priceLevel)} small />
          </View>

          {/* Address — label and value aligned to the baseline */}
          <View className="mt-5 flex-row items-baseline">
            <Text className="mr-2 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
              ADDRESS
            </Text>
            <Text className="flex-1 font-hk-medium text-[14px] text-ink-2">
              {spot.address}
            </Text>
          </View>

          {/* Mini map (stylized, Expo-Go-safe) — tapping opens Google Maps */}
          <View className="mt-3">
            <MiniMap
              spot={spot}
              onPress={() => openGoogleMaps(`${spot.name} ${spot.address}`)}
            />
          </View>

          {/* Spacer: pushes the CTAs to the bottom of the screen */}
          <View className="min-h-[24px] flex-1" />

          {/* Main CTA: events -> ticket, otherwise always OpenTable reservation */}
          <View>
            {isEvent ? (
              <Button
                label="Book ticket"
                variant="accent"
                subtitle="via oeticket"
                trailing="arrow"
                onPress={() => spot.ticketUrl && openExternal(spot.ticketUrl)}
              />
            ) : (
              <Button
                label="Reserve a table"
                variant="accent"
                subtitle="via opentable"
                trailing="arrow"
                onPress={() =>
                  openExternal(spot.reserveUrl ?? "https://www.opentable.de/")
                }
              />
            )}
          </View>

          {/* Map deep links */}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Apple Maps"
                variant="light"
                trailing="external"
                onPress={() => openAppleMaps(`${spot.name} ${spot.address}`)}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Google Maps"
                variant="light"
                trailing="external"
                onPress={() => openGoogleMaps(`${spot.name} ${spot.address}`)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Heart burst when saving (above everything, lets taps through) */}
      <QuestionBubbles ref={burstRef} glyph="♥" textColor="#1A1A1A" />
    </View>
  );
}
