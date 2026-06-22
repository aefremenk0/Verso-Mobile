import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { shadows } from "../theme";

// Filter-Sheet für die Karte (nach Mockup 04b).
// Reine UI im MVP: Auswahl wird lokal gehalten, "Orte zeigen" schließt das Sheet.
// (Echtes Filtern der Pins folgt in Phase 2.)

const ART = ["Bar", "Restaurant", "Club", "Café", "Snack", "Event"];
const BEWERTUNG = ["Alle", "4,0 ★", "4,5 ★"];
const AMBIENTE = [
  { name: "Intim", desc: "gedämpft, eng, für Dates & ruhige Abende" },
  { name: "Lebhaft", desc: "voll, energetisch, laut" },
  { name: "Gemütlich", desc: "warm, entspannt, zum Verweilen" },
  { name: "Underground", desc: "roh, versteckt, ungeschliffen" },
  { name: "Elegant", desc: "schick, durchdesignt, besonderer Anlass" },
  { name: "Draußen", desc: "Garten, Terrasse, Hof" },
];

export function MapFilterSheet({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  const [art, setArt] = useState<string[]>(["Bar"]);
  const [bewertung, setBewertung] = useState("4,5 ★");
  const [ambiente, setAmbiente] = useState<string[]>(["Underground"]);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    value: string,
  ) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const reset = () => {
    setArt([]);
    setBewertung("Alle");
    setAmbiente([]);
  };

  return (
    <View className="absolute inset-0" style={{ zIndex: 100 }}>
      {/* leichter Abdunkler hinter dem Panel */}
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(20,17,14,0.42)" }}
        onPress={onClose}
      />

      {/* Panel von oben */}
      <SafeAreaView
        edges={["top"]}
        className="absolute left-0 right-0 top-0 overflow-hidden rounded-b-[32px] bg-screen"
        style={shadows.nav}
      >
        <View className="flex-row items-center justify-between px-7 pb-1 pt-3">
          <Text className="font-hk-extrabold text-title-md text-ink">Filter</Text>
          <Pressable onPress={reset}>
            <Text className="font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
              ZURÜCKSETZEN
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ART */}
          <Text className="mb-2.5 mt-3 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            ART
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ART.map((a) => {
              const on = art.includes(a);
              return (
                <Pressable
                  key={a}
                  onPress={() => toggle(art, setArt, a)}
                  className={`rounded-pill px-3.5 py-2 ${
                    on ? "bg-accent" : "border border-black/20 bg-surface"
                  }`}
                >
                  <Text
                    className={`font-hk-semibold text-[12px] ${
                      on ? "text-accent-ink" : "text-ink-2"
                    }`}
                  >
                    {a}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* BUDGET (statische Slider-Optik) */}
          <View className="mb-1.5 mt-5 flex-row items-baseline justify-between">
            <Text className="font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
              BUDGET
            </Text>
            <Text className="font-hk-extrabold text-[13px] text-ink">15 € – 70 €</Text>
          </View>
          <View className="mt-2 h-1.5 justify-center rounded-pill bg-black/10">
            <View
              className="h-1.5 rounded-pill bg-accent"
              style={{ position: "absolute", left: "15%", right: "30%" }}
            />
            <View
              className="absolute h-[22px] w-[22px] rounded-pill bg-surface"
              style={{ left: "15%", marginLeft: -11, borderWidth: 2, borderColor: "#1A1A1A" }}
            />
            <View
              className="absolute h-[22px] w-[22px] rounded-pill bg-surface"
              style={{ left: "70%", marginLeft: -11, borderWidth: 2, borderColor: "#1A1A1A" }}
            />
          </View>
          <View className="mt-2.5 flex-row justify-between">
            <Text className="font-hk-semibold text-[11px] text-ink-3">0 €</Text>
            <Text className="font-hk-semibold text-[11px] text-ink-3">100+ €</Text>
          </View>

          {/* BEWERTUNG */}
          <Text className="mb-2.5 mt-5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            BEWERTUNG
          </Text>
          <View className="flex-row gap-2">
            {BEWERTUNG.map((b) => {
              const on = b === bewertung;
              return (
                <Pressable
                  key={b}
                  onPress={() => setBewertung(b)}
                  className={`rounded-pill px-4 py-2 ${
                    on ? "bg-accent" : "border border-black/20 bg-surface"
                  }`}
                >
                  <Text
                    className={`font-hk-semibold text-[13px] ${
                      on ? "text-accent-ink" : "text-ink-2"
                    }`}
                  >
                    {b}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* AMBIENTE */}
          <Text className="mb-2.5 mt-5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
            AMBIENTE
          </Text>
          <View className="gap-2">
            {AMBIENTE.map((a) => {
              const on = ambiente.includes(a.name);
              return (
                <Pressable
                  key={a.name}
                  onPress={() => toggle(ambiente, setAmbiente, a.name)}
                  className={`rounded-[14px] px-4 py-2.5 ${
                    on ? "bg-accent" : "border border-black/10 bg-surface"
                  }`}
                >
                  <Text className="font-hk-extrabold text-[15px] text-ink">
                    {a.name}
                    <Text
                      className={`font-hk-medium text-[12.5px] ${
                        on ? "text-accent-ink/70" : "text-ink-2"
                      }`}
                    >
                      {"  — "}
                      {a.desc}
                    </Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Orte zeigen */}
        <View className="px-6 pb-3 pt-3">
          <Pressable
            onPress={onClose}
            className="flex-row items-center justify-center gap-2 rounded-[18px] bg-night py-4"
          >
            <Text className="font-hk-extrabold text-[17px] text-screen">
              {count} Orte zeigen
            </Text>
            <Text className="text-[16px] text-screen">→</Text>
          </Pressable>
        </View>
        <View className="mb-2.5 h-[5px] w-[46px] self-center rounded-pill bg-black/15" />
      </SafeAreaView>
    </View>
  );
}
