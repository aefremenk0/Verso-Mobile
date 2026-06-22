import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { CATEGORY_LABEL, priceLabel } from "../src/data/categories";
import { getSpotById } from "../src/data/spots";
import { GEHEIMTIPP } from "../src/data/user";

// Screen 08 — Geheimtipp der Woche.
// Erst ein dunkler Lade-Screen ("Wir kramen kurz …"), dann der gelbe Reveal.

export default function Geheimtipp() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const progress = useRef(new Animated.Value(0)).current;

  const spot = getSpotById(GEHEIMTIPP.spotId);

  useEffect(() => {
    // Ladebalken füllen, danach aufdecken.
    Animated.timing(progress, {
      toValue: 1,
      duration: 1700,
      useNativeDriver: false,
    }).start(() => setPhase("reveal"));
  }, [progress]);

  const close = () => router.back();

  // ───────────── Lade-Screen (dunkel) ─────────────
  if (phase === "loading") {
    const width = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });
    return (
      <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
        <View className="flex-row justify-end px-6 pt-2">
          <Pressable
            onPress={close}
            className="h-9 w-9 items-center justify-center rounded-pill bg-white/10"
          >
            <Text className="font-hk-bold text-[16px] text-white">✕</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-10">
          <View className="h-24 w-24 items-center justify-center rounded-pill border-2 border-accent">
            <Text className="font-hk-extrabold text-[40px] text-accent">?</Text>
          </View>

          <Text className="mt-12 font-hk-bold text-[11px] tracking-[1.5px] text-white/40">
            GEHEIMTIPP DER WOCHE
          </Text>
          <Text className="mt-3 text-center font-hk-extrabold-italic text-[20px] leading-[26px] text-white">
            {GEHEIMTIPP.teaser}
          </Text>

          {/* Ladebalken */}
          <View className="mt-6 h-1.5 w-40 overflow-hidden rounded-pill bg-white/10">
            <Animated.View className="h-full rounded-pill bg-accent" style={{ width }} />
          </View>
        </View>

        <Text className="mb-2 text-center font-hk-bold text-[11px] tracking-[1.5px] text-white/30">
          FÜR ALLE · EINMAL WÖCHENTLICH
        </Text>
      </SafeAreaView>
    );
  }

  // ───────────── Reveal-Screen (gelb) ─────────────
  return (
    <SafeAreaView className="flex-1 bg-accent" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-6 pt-2">
        <View className="rounded-pill bg-night px-3 py-1.5">
          <Text className="font-hk-bold text-[10px] tracking-[1px] text-white">
            ✓ AUFGEDECKT
          </Text>
        </View>
        <Pressable
          onPress={close}
          className="h-9 w-9 items-center justify-center rounded-pill bg-black/10"
        >
          <Text className="font-hk-bold text-[16px] text-accent-ink">✕</Text>
        </Pressable>
      </View>

      <View className="flex-1 px-7 pt-6">
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-accent-ink/50">
          GEHEIMTIPP DER WOCHE
        </Text>

        {spot ? (
          <>
            <Text className="mt-2 font-hk-extrabold text-title-xl text-accent-ink">
              {spot.name}
            </Text>

            {/* Dunkle Bildkarte mit Badge + Adresse */}
            <View className="mt-5">
              <ImagePlaceholder tone={spot.tone} height={150} radius={20}>
                <View className="absolute left-4 top-4 rounded-pill bg-accent px-3 py-1">
                  <Text className="font-hk-bold text-[10px] tracking-[1px] text-accent-ink">
                    {CATEGORY_LABEL[spot.category]} · {spot.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(spot.priceLevel)}
                  </Text>
                </View>
                <Text className="absolute bottom-3 left-4 font-hk-medium text-[12px] text-white/70">
                  {spot.address}
                </Text>
              </ImagePlaceholder>
            </View>

            <Text className="mt-5 font-hk-extrabold-italic text-[20px] leading-[27px] text-accent-ink">
              {spot.hook}
            </Text>
          </>
        ) : null}

        <View className="flex-1" />

        <Pressable
          onPress={() => {
            router.back();
            router.push("/(tabs)/profil");
          }}
          className="mb-2 flex-row items-center justify-between rounded-button bg-night px-6 py-4"
        >
          <Text className="font-hk-bold text-[16px] text-white">
            Weiter zu deinem Profil
          </Text>
          <View className="h-8 w-8 items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
