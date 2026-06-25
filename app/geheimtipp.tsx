import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { CATEGORY_LABEL, priceLabel } from "../src/data/categories";
import { getSpotById } from "../src/data/spots";
import { notifySuccess } from "../src/lib/haptics";
import { useGeheimtipp } from "../src/store/geheimtipp";

// Screen 08 — Geheimtipp der Woche.
// Phase 1: dunkler Lade-Screen (drehender Ring ums "?", durchlaufender Balken).
// Phase 2: gelber Reveal (Bild "pocht" = antippbar) -> markiert den Tipp als
// abgeholt, sodass das "?"-Badge im Feed verschwindet.
//
// Alle Animationen laufen über react-native-reanimated (NICHT CSS @keyframes).

const LOAD_MS = 2600; // wie lange der Lade-Screen läuft

export default function Geheimtipp() {
  const router = useRouter();
  const { markAbgeholt, spotId } = useGeheimtipp();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  // Tipp der aktuell gewählten Stadt (kommt aus dem city-abhängigen Store).
  const spot = getSpotById(spotId);

  // ── Shared Values (laufen auf dem UI-Thread) ──
  const spin = useSharedValue(0); // Ring-Rotation 0..360
  const sweep = useSharedValue(0); // Lade-Balken 0..1 (links -> rechts)
  const throb = useSharedValue(0); // Bild-Puls 0..1

  useEffect(() => {
    // verso-spin: 360° endlos, linear, ~9s
    spin.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
    );
    // verso-load: Balken läuft endlos durch, ~1.3s
    sweep.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      -1,
    );
    // verso-throb: Bild pocht endlos, ~1.5s
    throb.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
    );

    // Nach dem Laden automatisch aufdecken + Tipp als abgeholt merken.
    const t = setTimeout(() => {
      setPhase("reveal");
      markAbgeholt();
      notifySuccess(); // haptischer „Reveal"-Moment
    }, LOAD_MS);
    return () => clearTimeout(t);
  }, [spin, sweep, throb, markAbgeholt]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  // Balken (45% breit) wandert von links (-45%) nach rechts (100%) durch.
  const TRACK = 170;
  const BAR = TRACK * 0.45;
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAR + sweep.value * (TRACK + BAR) }],
  }));

  // Throb: dunkler Ring hinter dem Bild wächst nach außen und fadet aus.
  const throbStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - throb.value),
    transform: [{ scale: 1 + throb.value * 0.08 }],
  }));

  const openSpot = () => {
    router.back();
    if (spot) router.push(`/spot/${spot.id}`);
  };

  // ───────────── Lade-Screen (dunkel, Vollbild) ─────────────
  if (phase === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
        <View className="flex-row justify-end px-6 pt-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Schließen"
            className="h-[42px] w-[42px] items-center justify-center rounded-pill"
            style={{ borderWidth: 1, borderColor: "rgba(247,244,239,0.25)" }}
          >
            <Text className="font-hk-extrabold text-[16px] text-screen">✕</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          {/* "?" mit drehender, krummliniger Umrandung (Squiggle wie in der Nav) */}
          <View className="h-[150px] w-[150px] items-center justify-center">
            <Animated.View
              style={[{ position: "absolute", width: 150, height: 150 }, ringStyle]}
            >
              <Svg viewBox="0 0 56 56" width={150} height={150}>
                <Path
                  d="M27 8 C40 4 52 15 49 27 C52 41 38 52 26 49 C13 52 5 38 8 26 C4 14 16 5 31 9"
                  stroke="#FFE500"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>
            <Text className="font-hk-extrabold text-[52px] text-accent">?</Text>
          </View>

          <Text className="mt-9 font-hk-semibold text-[11px] tracking-[2px] text-screen/55">
            GEHEIMTIPP DER WOCHE
          </Text>
          <Text className="mt-3 text-center font-hk-extrabold-italic text-[22px] leading-[29px] text-screen">
            Wir kramen kurz{"\n"}im Hinterzimmer …
          </Text>

          {/* Durchlaufender Lade-Balken */}
          <View
            className="mt-7 h-[5px] overflow-hidden rounded-pill"
            style={{ width: TRACK, backgroundColor: "rgba(247,244,239,0.14)" }}
          >
            <Animated.View
              className="h-full rounded-pill bg-accent"
              style={[{ width: BAR }, sweepStyle]}
            />
          </View>
        </View>

        <Text className="pb-6 text-center font-hk-semibold text-[10px] tracking-[2px] text-screen/40">
          FÜR ALLE · EINMAL WÖCHENTLICH
        </Text>
      </SafeAreaView>
    );
  }

  // ───────────── Reveal-Screen (gelb) ─────────────
  return (
    <SafeAreaView className="flex-1 bg-accent" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-6 pt-3">
        <View className="rounded-pill bg-night px-3.5 py-2">
          <Text className="font-hk-semibold text-[10px] tracking-[1.5px] text-accent">
            ✓ AUFGEDECKT
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Schließen"
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.25)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-accent-ink">✕</Text>
        </Pressable>
      </View>

      {/* Café vertikal zentriert in der Karte */}
      <View className="flex-1 justify-center px-6">
        <Text className="font-hk-semibold text-[10px] tracking-[2px] text-accent-ink/55">
          GEHEIMTIPP DER WOCHE
        </Text>

        {spot ? (
          <>
            <Text className="mt-3 font-hk-extrabold text-[40px] leading-[44px] text-accent-ink">
              {spot.name}
            </Text>

            {/* Antippbares Bild mit "Throb"-Puls dahinter */}
            <View className="mt-5">
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 236,
                    borderRadius: 24,
                    backgroundColor: "#1A1A1A",
                  },
                  throbStyle,
                ]}
              />
              <Pressable onPress={openSpot}>
                <ImagePlaceholder tone="green" height={236} radius={24}>
                  <View className="absolute left-3.5 top-3.5 rounded-pill bg-accent px-3 py-1.5">
                    <Text className="font-hk-semibold text-[9px] tracking-[1.5px] text-accent-ink">
                      {CATEGORY_LABEL[spot.category]} · {spot.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(spot.priceLevel)}
                    </Text>
                  </View>
                  <View className="absolute right-3 top-3 h-[34px] w-[34px] items-center justify-center rounded-pill bg-accent">
                    <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
                  </View>
                  <Text className="absolute bottom-3.5 left-4 font-hk-semibold text-[11px] text-white/80">
                    {spot.address}
                  </Text>
                </ImagePlaceholder>
              </Pressable>
            </View>

            <Text className="mt-4 font-hk-extrabold-italic text-[18px] leading-[24px] text-accent-ink">
              {spot.hook}
            </Text>
          </>
        ) : null}

        <Pressable
          onPress={() => {
            router.back();
            router.push("/(tabs)/profil");
          }}
          className="mt-7 flex-row items-center justify-between rounded-[18px] bg-night px-5 py-4"
        >
          <Text className="font-hk-extrabold text-[17px] text-screen">
            Weiter zu deinem Profil
          </Text>
          <View className="h-[34px] w-[34px] items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
