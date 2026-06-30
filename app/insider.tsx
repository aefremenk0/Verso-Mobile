import { useRouter } from "expo-router";
import { useEffect } from "react";
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
import { useT } from "../src/lib/i18n";
import { useInsider } from "../src/store/insider";

// Modal "Verso Insider" notice — same pop-up style as the hidden gem
// loading screen (dark, a spinning squiggle around the symbol). Says the feature
// isn't available yet and leads back to the profile.
//
// Opened by the "???" badge in the profile header (`MysticBadge`).

export default function Insider() {
  const router = useRouter();
  const t = useT();
  const { isInsider, setInsider } = useInsider();
  const spin = useSharedValue(0); // spinning squiggle 0..360

  useEffect(() => {
    // Endless rotation like the hidden gem loading ring (~9s, linear).
    spin.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
    );
  }, [spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
      {/* Close (back to the profile) */}
      <View className="flex-row justify-end px-6 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(247,244,239,0.25)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-screen">✕</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        {/* "???" with a spinning, wavy outline (squiggle like in the nav) */}
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
          <Text className="font-hk-extrabold text-[38px] text-accent">???</Text>
        </View>

        <Text className="mt-9 font-hk-semibold text-[11px] tracking-[2px] text-screen/55">
          VERSO INSIDER
        </Text>
        <Text className="mt-3 text-center font-hk-extrabold-italic text-[22px] leading-[29px] text-screen">
          {t("Still under wraps …", "Noch im Verborgenen …")}
        </Text>
        <Text className="mt-4 max-w-[300px] text-center font-hk-medium text-[14px] leading-[20px] text-screen/60">
          {t(
            "Sport and Live Events are Insider features — the scenes top right with the 🔒. Turn on the preview to try them out.",
            "Sport und Live Events sind Insider-Features — die Szenen oben rechts mit dem 🔒. Aktiviere die Vorschau, um sie auszuprobieren.",
          )}
        </Text>
        <Text className="mt-3 text-center font-hk-medium text-[11px] text-screen/35">
          {t(
            "Preview is a mock — no real purchase in the MVP.",
            "Vorschau ist ein Mock — kein echter Kauf im MVP.",
          )}
        </Text>
      </View>

      {/* Primary: toggle the (mock) Insider preview */}
      <View className="px-6 pb-8">
        {!isInsider ? (
          <Pressable
            onPress={() => {
              setInsider(true);
              router.back();
            }}
            className="flex-row items-center justify-between rounded-[18px] bg-accent px-5 py-4"
          >
            <Text className="font-hk-extrabold text-[17px] text-accent-ink">
              {t("Turn on Insider preview", "Insider-Vorschau aktivieren")}
            </Text>
            <View className="h-[34px] w-[34px] items-center justify-center rounded-pill bg-night">
              <Text className="font-hk-bold text-[16px] text-accent">→</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center justify-between rounded-[18px] bg-accent px-5 py-4"
          >
            <Text className="font-hk-extrabold text-[17px] text-accent-ink">
              {t("Insider preview is on ✓", "Insider-Vorschau ist an ✓")}
            </Text>
            <View className="h-[34px] w-[34px] items-center justify-center rounded-pill bg-night">
              <Text className="font-hk-bold text-[16px] text-accent">→</Text>
            </View>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            if (isInsider) setInsider(false);
            else router.back();
          }}
          className="mt-3 items-center py-1"
        >
          <Text className="font-hk-semibold text-[12px] text-screen/50">
            {isInsider
              ? t("Turn off preview", "Vorschau beenden")
              : t("Back to profile", "Zurück zum Profil")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
