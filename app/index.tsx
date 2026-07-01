import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StripeTexture } from "../src/components/StripeTexture";
import { AnimatedChip } from "../src/components/AnimatedChip";
import { DiagonalStrike } from "../src/components/DiagonalStrike";
import {
  QuestionBubbles,
  type QuestionBubblesHandle,
} from "../src/components/QuestionBubbles";
import { isComingSoon, type City } from "../src/data/cities";
import { useAuth } from "../src/store/auth";
import { useCity } from "../src/store/city";
import { useT, useLang } from "../src/lib/i18n";
import { useScaleSize } from "../src/lib/responsive";
import { cityLabel } from "../src/lib/lang";

// Fixed arrangement of the cities on the Welcome screen (3 rows, as desired).
const WELCOME_ROWS: City[][] = [
  ["München", "Zürich", "Wien"],
  ["Berlin", "Frankfurt", "Hamburg"],
  ["Düsseldorf"],
];

// Screen 01 — Welcome.
// Immersive dark hero (runs under the status bar), yellow insider band,
// city selection, dark "Let's go" button. Values from Verso_Mobile_v2.dc.html.

export default function Welcome() {
  const router = useRouter();
  const { city, setCity } = useCity();
  const { session, loading } = useAuth();
  const insets = useSafeAreaInsets();

  // Already signed in (persisted session)? Skip the Welcome screen entirely and
  // go straight to the feed. This runs beneath the launch loader overlay, so the
  // brown Welcome stage never flashes for returning users.
  useEffect(() => {
    if (!loading && session) router.replace("/(tabs)/feed");
  }, [loading, session, router]);
  const t = useT();
  const lang = useLang();
  const scale = useScaleSize();
  const bubblesRef = useRef<QuestionBubblesHandle>(null);

  return (
    <View className="flex-1 bg-screen">
      {/* ── Dark hero (full-bleed, under the status bar) ── */}
      <View
        className="overflow-hidden bg-night-2"
        style={{ flex: 1.4, paddingTop: insets.top }}
      >
        {/* diagonal stripe texture */}
        <StripeTexture />
        <Text className="mt-12 px-[30px] font-hk-semibold text-[10px] tracking-[2.2px] text-screen/60">
          {t(
            "// your first night in a city you don't know",
            "// dein erster abend in einer fremden stadt",
          )}
        </Text>

        <View className="mt-auto px-[30px] pb-8">
          {/* Easter egg: tap "verso" -> yellow "?" bubbles rise from the tap
              spot (only here, before sign-up). */}
          <Pressable
            onPressIn={(e) =>
              bubblesRef.current?.burst(
                e.nativeEvent.pageX,
                e.nativeEvent.pageY,
              )
            }
            className="self-start"
          >
            <Text
              className="font-hk-extrabold-italic text-screen"
              style={{ fontSize: scale(92), lineHeight: scale(83) }}
            >
              verso
            </Text>
          </Pressable>
          <Text className="mt-3.5 max-w-[280px] font-hk-medium text-[14px] leading-[21px] text-screen/90">
            {t(
              "Real places. Real people. The city like no one else shows you.",
              "Echte Orte. Echte Menschen. Die Stadt, wie sie dir sonst niemand zeigt.",
            )}
          </Text>
        </View>
      </View>

      {/* ── Yellow insider band (full-width) ── */}
      <View className="bg-accent px-[30px] py-[18px]">
        <Text className="font-hk-extrabold text-[22px] leading-[22px] text-accent-ink">
          Hi Insider.
        </Text>
        <Text className="mt-1.5 font-hk-medium text-[12.5px] leading-[18px] text-accent-ink/85">
          {t(
            "No lists for everyone — only places we'd show you ourselves.",
            "Keine Listen für alle — nur Orte, die wir dir selbst zeigen würden.",
          )}
        </Text>
      </View>

      {/* ── City selection + CTA ── */}
      <View
        className="px-[30px] pt-6"
        style={{ flex: 1, paddingBottom: insets.bottom + 8 }}
      >
        <Text className="font-hk-semibold text-[10px] tracking-[2.2px] text-ink-3">
          {t("WHERE DO WE START?", "WO FANGEN WIR AN?")}
        </Text>
        <View className="mt-4 gap-2">
          {WELCOME_ROWS.map((row, ri) => (
            <View key={ri} className="flex-row flex-wrap gap-2">
              {row.map((c) => {
                const active = c === city;
                const soon = isComingSoon(c);
                return (
                  // "coming soon" cities: dimmed, struck through, not selectable.
                  <View
                    key={c}
                    pointerEvents={soon ? "none" : "auto"}
                    accessibilityLabel={
                      soon
                        ? `${cityLabel(c, lang)} — ${t("coming soon", "kommt bald")}`
                        : cityLabel(c, lang)
                    }
                    style={soon ? { opacity: 0.5 } : undefined}
                  >
                    <AnimatedChip
                      active={active}
                      onPress={soon ? () => {} : () => setCity(c)}
                      activeBg="#FFE500"
                      inactiveBg="rgba(255,229,0,0)"
                      activeBorder="#FFE500"
                      inactiveBorder="rgba(26,26,26,0.18)"
                      style={{
                        height: 42,
                        paddingHorizontal: 16,
                        borderRadius: 999,
                        borderWidth: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        className="font-hk-extrabold text-[19px] text-ink"
                        style={{
                          // exact vertical centering – also on Android
                          lineHeight: 22,
                          textAlign: "center",
                          textAlignVertical: "center",
                          includeFontPadding: false,
                        }}
                      >
                        {cityLabel(c, lang)}
                      </Text>
                    </AnimatedChip>
                    {soon ? <DiagonalStrike /> : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* If already signed in (persisted session), skip straight to the feed;
            otherwise go to sign up / sign in. */}
        <Pressable
          onPress={() =>
            session ? router.replace("/(tabs)/feed") : router.push("/register")
          }
          className="mb-2 mt-auto flex-row items-center justify-between rounded-[18px] bg-night px-5 py-[18px]"
        >
          <Text className="font-hk-extrabold text-[18px] text-screen">
            {session ? t("Continue", "Weiter") : t("Let's go", "Los geht's")}
          </Text>
          <Text className="text-[18px] text-screen">→</Text>
        </Pressable>
      </View>

      {/* Bubble overlay (above everything, lets taps through) */}
      <QuestionBubbles ref={bubblesRef} />
    </View>
  );
}
