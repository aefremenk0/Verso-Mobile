import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { ImagePlaceholder } from "../../src/components/ImagePlaceholder";
import { Pill } from "../../src/components/Pill";
import { CATEGORY_LABEL, priceLabel } from "../../src/data/categories";
import { getSpotById } from "../../src/data/spots";
import { openAppleMaps, openExternal, openGoogleMaps } from "../../src/lib/maps";
import { useSaved } from "../../src/store/saved";

// Screen 03 — Spot-Detail (und Event-Detail).
// Events sind Spots mit category "event" und zeigen zusätzlich Wann/Treffpunkt
// sowie "Ticket buchen". Beide teilen sich diese Route.

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
          Diesen Ort gibt es (noch) nicht.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-hk-bold text-[15px] text-ink underline">Zurück</Text>
        </Pressable>
      </View>
    );
  }

  const isEvent = spot.category === "event";
  const saved = isSaved(spot.id);
  const metaLine = `${CATEGORY_LABEL[spot.category]} · ${spot.neighborhood.toUpperCase()}`;

  // Ort/Event teilen über das systemeigene Share-Sheet (iMessage, WhatsApp, …).
  const onShare = () => {
    Share.share({
      message: `${spot.name} — ${spot.hook}\nGefunden auf Verso: https://verso.app`,
    }).catch(() => {});
  };

  return (
    <View className="flex-1 bg-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Hero (größer, damit unten kein leeres Feld bleibt) */}
        <ImagePlaceholder tone={spot.tone} height={400} radius={0}>
          {/* Zurück + Merken (mit Safe-Area-Abstand oben) */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-5"
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-pill bg-surface"
            >
              <Text className="font-hk-bold text-[18px] text-ink">←</Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              {/* Teilen (Share-Sheet) */}
              <Pressable
                onPress={onShare}
                className="h-10 w-10 items-center justify-center rounded-pill bg-surface"
              >
                <Text className="font-hk-bold text-[16px] text-ink">↗</Text>
              </Pressable>
              <Pressable
                onPress={() => toggle(spot.id)}
                className="rounded-pill bg-accent px-4 py-2.5"
              >
                <Text className="font-hk-bold text-[13px] text-accent-ink">
                  {saved ? "Gemerkt ✓" : "Merken +"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ImagePlaceholder>

        {/* Inhalts-Sheet, leicht über das Hero gezogen.
            flex-1 + Spacer schieben die CTAs ans untere Ende -> kein leeres
            weißes Feld mehr. */}
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

          {/* Hook: kursiv + unterstrichen (kein gelber Block) */}
          <Text
            className="mt-4 font-hk-extrabold-italic text-[20px] leading-[28px] text-ink"
            style={{ textDecorationLine: "underline" }}
          >
            {spot.hook}
          </Text>

          {/* Event-Block: Wann / Treffpunkt */}
          {isEvent ? (
            <View className="mt-5 rounded-card bg-surface p-4">
              <View className="flex-row">
                <Text className="w-20 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
                  WANN
                </Text>
                <Text className="flex-1 font-hk-semibold text-[14px] text-ink">
                  {spot.dateLabel}
                </Text>
              </View>
              <View className="mt-3 flex-row">
                <Text className="w-20 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
                  TREFF
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

          {/* Tags + Preis */}
          <View className="mt-5 flex-row flex-wrap items-center gap-2">
            {spot.tags.map((t) => (
              <Pill key={t} label={t} small />
            ))}
            <Pill label={priceLabel(spot.priceLevel)} small />
          </View>

          {/* Adresse — Label und Wert an der Grundlinie ausgerichtet */}
          <View className="mt-5 flex-row items-baseline">
            <Text className="mr-2 font-hk-bold text-[11px] tracking-[1px] text-ink-3">
              ADRESSE
            </Text>
            <Text className="flex-1 font-hk-medium text-[14px] text-ink-2">
              {spot.address}
            </Text>
          </View>

          {/* Spacer: schiebt die CTAs ans untere Ende des Screens */}
          <View className="min-h-[24px] flex-1" />

          {/* Haupt-CTA: Events -> Ticket, sonst immer OpenTable-Reservierung */}
          <View>
            {isEvent ? (
              <Button
                label="Ticket buchen"
                variant="accent"
                subtitle="über oeticket"
                trailing="arrow"
                onPress={() => spot.ticketUrl && openExternal(spot.ticketUrl)}
              />
            ) : (
              <Button
                label="Tisch reservieren"
                variant="accent"
                subtitle="über opentable"
                trailing="arrow"
                onPress={() =>
                  openExternal(spot.reserveUrl ?? "https://www.opentable.de/")
                }
              />
            )}
          </View>

          {/* Karten-Deep-Links */}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Apple Karten"
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
    </View>
  );
}
