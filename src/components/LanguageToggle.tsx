import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { tapSelection } from "../lib/haptics";
import type { Lang } from "../lib/lang";
import { useT } from "../lib/i18n";
import { useLanguage } from "../store/language";

// Emoji language toggle (EN 🇬🇧 / DE 🇩🇪) for the Settings "Language" row.
// Slide + pop: a yellow selector springs to the chosen side and the picked flag
// briefly pops (scale bounce) — same feel as SceneToggle / the bottom-nav pill.

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "de", flag: "🇩🇪", label: "DE" },
];

const WIDTH = 132; // fixed control width -> symmetric halves
const PAD = 4; // matches p-1
const INNER = WIDTH - PAD * 2;
const HALF = INNER / 2;

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const t = useT();

  // Selector position (0 = EN/left, HALF = DE/right).
  const x = useSharedValue(lang === "de" ? HALF : 0);
  // One pop value per flag.
  const popEn = useSharedValue(1);
  const popDe = useSharedValue(1);

  useEffect(() => {
    x.value = withSpring(lang === "de" ? HALF : 0, {
      damping: 15,
      stiffness: 220,
      mass: 0.7,
    });
  }, [lang, x]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const popEnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popEn.value }],
  }));
  const popDeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popDe.value }],
  }));

  const switchTo = (code: Lang) => {
    if (code === lang) return;
    tapSelection(); // subtle "tick" only on a real change
    setLang(code);
    const pv = code === "de" ? popDe : popEn;
    // Pop: quick scale up, then spring back.
    pv.value = withSequence(
      withTiming(1.2, { duration: 120 }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    );
  };

  return (
    <View
      className="rounded-pill bg-chip"
      style={{ width: WIDTH, padding: PAD }}
    >
      {/* Sliding yellow selector behind the active half. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: PAD,
            bottom: PAD,
            left: PAD,
            width: HALF,
            borderRadius: 999,
            backgroundColor: "#FFE500",
          },
          sliderStyle,
        ]}
      />
      <View className="flex-row">
        {LANGS.map((l) => {
          const active = l.code === lang;
          const popStyle = l.code === "de" ? popDeStyle : popEnStyle;
          return (
            <Pressable
              key={l.code}
              onPress={() => switchTo(l.code)}
              accessibilityLabel={
                l.code === "de"
                  ? t("Switch to German", "Auf Deutsch wechseln")
                  : t("Switch to English", "Auf Englisch wechseln")
              }
              accessibilityState={{ selected: active }}
              style={{
                width: HALF,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                paddingVertical: 7,
              }}
            >
              <Animated.Text style={[{ fontSize: 16 }, popStyle]}>
                {l.flag}
              </Animated.Text>
              {/* Active label sits on the yellow selector -> always black
                  (text-ink would flip to white on yellow in dark mode). */}
              <Text
                className={`font-hk-extrabold text-[13px] ${active ? "" : "text-ink-3"}`}
                style={active ? { color: "#1A1A1A" } : undefined}
              >
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
