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
import { categoryLabel, priceLabel } from "../src/data/categories";
import { notifySuccess } from "../src/lib/haptics";
import { useT, useLang } from "../src/lib/i18n";
import { spotText } from "../src/lib/localized";
import { useCatalog } from "../src/store/catalog";
import { useGeheimtipp } from "../src/store/geheimtipp";

// Screen 08 — Hidden gem of the week.
// Phase 1: dark loading screen (spinning ring around the "?", sweeping bar).
// Phase 2: yellow reveal (image "throbs" = tappable) -> marks the gem as
// collected, so the "?" badge in the feed disappears.
//
// All animations run via react-native-reanimated (NOT CSS @keyframes).

const LOAD_MS = 2600; // how long the loading screen runs

export default function Geheimtipp() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { getSpotById } = useCatalog();
  const { markAbgeholt, spotId } = useGeheimtipp();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  // Gem for the currently selected city (comes from the city-aware store).
  const spot = getSpotById(spotId);
  const spotLoc = spot ? spotText(spot, lang) : null;

  // ── Shared Values (run on the UI thread) ──
  const spin = useSharedValue(0); // ring rotation 0..360
  const sweep = useSharedValue(0); // loading bar 0..1 (left -> right)
  const throb = useSharedValue(0); // image pulse 0..1

  useEffect(() => {
    // verso-spin: 360° endless, linear, ~9s
    spin.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
    );
    // verso-load: bar sweeps endlessly, ~1.3s
    sweep.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      -1,
    );
    // verso-throb: image throbs endlessly, ~1.5s
    throb.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
    );

    // After loading, reveal automatically + mark the gem as collected.
    const t = setTimeout(() => {
      setPhase("reveal");
      markAbgeholt();
      notifySuccess(); // haptic "reveal" moment
    }, LOAD_MS);
    return () => clearTimeout(t);
  }, [spin, sweep, throb, markAbgeholt]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  // Bar (45% wide) sweeps from left (-45%) to right (100%).
  const TRACK = 170;
  const BAR = TRACK * 0.45;
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAR + sweep.value * (TRACK + BAR) }],
  }));

  // Throb: dark ring behind the image grows outward and fades out.
  const throbStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - throb.value),
    transform: [{ scale: 1 + throb.value * 0.08 }],
  }));

  const openSpot = () => {
    router.back();
    if (spot) router.push(`/spot/${spot.id}`);
  };

  // ───────────── Loading screen (dark, fullscreen) ─────────────
  if (phase === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
        <View className="flex-row justify-end px-6 pt-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t("Close", "Schließen")}
            className="h-[42px] w-[42px] items-center justify-center rounded-pill"
            style={{ borderWidth: 1, borderColor: "rgba(247,244,239,0.25)" }}
          >
            <Text className="font-hk-extrabold text-[16px] text-screen">✕</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          {/* "?" with a spinning, wavy outline (squiggle like in the nav) */}
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
            {t("HIDDEN GEM OF THE WEEK", "GEHEIMTIPP DER WOCHE")}
          </Text>
          <Text className="mt-3 text-center font-hk-extrabold-italic text-[22px] leading-[29px] text-screen">
            {t(
              `Digging through${"\n"}the back room …`,
              `Wir kramen kurz${"\n"}im Hinterzimmer …`,
            )}
          </Text>

          {/* Sweeping loading bar */}
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
          {t("FOR EVERYONE · ONCE A WEEK", "FÜR ALLE · EINMAL WÖCHENTLICH")}
        </Text>
      </SafeAreaView>
    );
  }

  // ───────────── Reveal screen (yellow) ─────────────
  return (
    <SafeAreaView className="flex-1 bg-accent" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-6 pt-3">
        <View className="rounded-pill bg-night px-3.5 py-2">
          <Text className="font-hk-semibold text-[10px] tracking-[1.5px] text-accent">
            {t("✓ REVEALED", "✓ AUFGEDECKT")}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Close", "Schließen")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.25)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-accent-ink">✕</Text>
        </Pressable>
      </View>

      {/* Café vertically centered in the card */}
      <View className="flex-1 justify-center px-6">
        <Text className="font-hk-semibold text-[10px] tracking-[2px] text-accent-ink/55">
          {t("HIDDEN GEM OF THE WEEK", "GEHEIMTIPP DER WOCHE")}
        </Text>

        {spot && spotLoc ? (
          <>
            <Text className="mt-3 font-hk-extrabold text-[40px] leading-[44px] text-accent-ink">
              {spotLoc.name}
            </Text>

            {/* Tappable image with a "throb" pulse behind it */}
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
                      {categoryLabel(spot.category, lang)} · {spot.neighborhood.split(",")[0].toUpperCase()} · {priceLabel(spot.priceLevel)}
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
              {spotLoc.hook}
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
            {t("Continue to your profile", "Weiter zu deinem Profil")}
          </Text>
          <View className="h-[34px] w-[34px] items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
