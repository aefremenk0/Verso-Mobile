import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../src/components/Brand";
import { useCity } from "../src/store/city";

// Screen 01 — Welcome.
// Dunkles Hero, Wortmarke, Claim, gelbes Insider-Band, Stadt-Auswahl.

export default function Welcome() {
  const router = useRouter();
  const { city, setCity, cities } = useCity();

  return (
    <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-4 font-hk-medium-italic text-[13px] text-white/40">
          // dein erster abend in einer fremden stadt
        </Text>

        <View className="mt-16">
          <Brand size={64} color="#FFFFFF" />
          <Text className="mt-4 font-hk-semibold text-[18px] leading-[24px] text-white/80">
            Echte Orte. Echte Menschen. Die Stadt, wie sie dir sonst niemand
            zeigt.
          </Text>
        </View>

        {/* Gelbes Insider-Band */}
        <View className="mt-8 rounded-card bg-accent px-5 py-4">
          <Text className="font-hk-extrabold text-[18px] text-accent-ink">
            Hi Insider.
          </Text>
          <Text className="mt-1 font-hk-medium text-[14px] leading-[19px] text-accent-ink/80">
            Keine Listen für alle — nur Orte, die wir dir selbst zeigen würden.
          </Text>
        </View>

        {/* Stadt-Auswahl */}
        <Text className="mt-8 font-hk-bold text-[11px] tracking-[1.5px] text-white/40">
          WO FANGEN WIR AN?
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {cities.map((c) => {
            const active = c === city;
            return (
              <Pressable
                key={c}
                onPress={() => setCity(c)}
                className={`rounded-pill px-4 py-2.5 ${
                  active ? "bg-accent" : "border border-white/20"
                }`}
              >
                <Text
                  className={`font-hk-semibold text-[14px] ${
                    active ? "text-accent-ink" : "text-white"
                  }`}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        {/* CTA */}
        <Pressable
          onPress={() => router.push("/register")}
          className="mt-10 flex-row items-center justify-between rounded-button bg-black px-6 py-4"
          style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Text className="font-hk-bold text-[16px] text-white">Los geht's</Text>
          <View className="h-8 w-8 items-center justify-center rounded-pill bg-white/10">
            <Text className="font-hk-bold text-[16px] text-white">→</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
