import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StripeTexture } from "../src/components/StripeTexture";
import {
  QuestionBubbles,
  type QuestionBubblesHandle,
} from "../src/components/QuestionBubbles";
import { type City } from "../src/data/cities";
import { useCity } from "../src/store/city";

// Feste Anordnung der Städte auf dem Welcome-Screen (3 Zeilen, wie gewünscht).
const WELCOME_ROWS: City[][] = [
  ["München", "Zürich", "Wien"],
  ["Berlin", "Frankfurt", "Hamburg"],
  ["Düsseldorf"],
];

// Screen 01 — Welcome.
// Immersives dunkles Hero (läuft unter die Statusleiste), gelbes Insider-Band,
// Stadt-Auswahl, dunkler "Los geht's"-Button. Werte aus Verso_Mobile_v2.dc.html.

export default function Welcome() {
  const router = useRouter();
  const { city, setCity } = useCity();
  const insets = useSafeAreaInsets();
  const bubblesRef = useRef<QuestionBubblesHandle>(null);

  return (
    <View className="flex-1 bg-screen">
      {/* ── Dunkles Hero (full-bleed, unter die Statusleiste) ── */}
      <View
        className="overflow-hidden bg-night-2"
        style={{ flex: 1.4, paddingTop: insets.top }}
      >
        {/* diagonale Streifen-Textur */}
        <StripeTexture />
        <Text className="mt-12 px-[30px] font-hk-semibold text-[10px] tracking-[2.2px] text-screen/60">
          // dein erster abend in einer fremden stadt
        </Text>

        <View className="mt-auto px-[30px] pb-8">
          {/* Easter Egg: auf „verso" tippen -> gelbe „?"-Bubbles steigen von
              der Tipp-Stelle auf (nur hier, vor der Registrierung). */}
          <Pressable
            onPressIn={(e) =>
              bubblesRef.current?.burst(
                e.nativeEvent.pageX,
                e.nativeEvent.pageY,
              )
            }
            className="self-start"
          >
            <Text className="font-hk-extrabold-italic text-[92px] leading-[83px] text-screen">
              verso
            </Text>
          </Pressable>
          <Text className="mt-3.5 max-w-[280px] font-hk-medium text-[14px] leading-[21px] text-screen/90">
            Echte Orte. Echte Menschen. Die Stadt, wie sie dir sonst niemand
            zeigt.
          </Text>
        </View>
      </View>

      {/* ── Gelbes Insider-Band (flächig) ── */}
      <View className="bg-accent px-[30px] py-[18px]">
        <Text className="font-hk-extrabold text-[22px] leading-[22px] text-accent-ink">
          Hi Insider.
        </Text>
        <Text className="mt-1.5 font-hk-medium text-[12.5px] leading-[18px] text-accent-ink/85">
          Keine Listen für alle — nur Orte, die wir dir selbst zeigen würden.
        </Text>
      </View>

      {/* ── Stadt-Auswahl + CTA ── */}
      <View
        className="px-[30px] pt-6"
        style={{ flex: 1, paddingBottom: insets.bottom + 8 }}
      >
        <Text className="font-hk-semibold text-[10px] tracking-[2.2px] text-ink-3">
          WO FANGEN WIR AN?
        </Text>
        <View className="mt-4 gap-2">
          {WELCOME_ROWS.map((row, ri) => (
            <View key={ri} className="flex-row flex-wrap gap-2">
              {row.map((c) => {
                const active = c === city;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCity(c)}
                    className="items-center justify-center rounded-pill px-4"
                    style={{
                      height: 42,
                      backgroundColor: active ? "#FFE500" : "transparent",
                      borderWidth: 1,
                      borderColor: active ? "#FFE500" : "rgba(26,26,26,0.18)",
                    }}
                  >
                    <Text
                      className="font-hk-extrabold text-[19px] text-ink"
                      style={{
                        // exakte vertikale Zentrierung – auch auf Android
                        lineHeight: 22,
                        textAlign: "center",
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      }}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/register")}
          className="mb-2 mt-auto flex-row items-center justify-between rounded-[18px] bg-night px-5 py-[18px]"
        >
          <Text className="font-hk-extrabold text-[18px] text-screen">
            Los geht's
          </Text>
          <Text className="text-[18px] text-screen">→</Text>
        </Pressable>
      </View>

      {/* Bubble-Overlay (über allem, lässt Tipps durch) */}
      <QuestionBubbles ref={bubblesRef} />
    </View>
  );
}
