import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCity } from "../../src/store/city";

// Screen — Karte (Phase 1: Platzhalter).
//
// Die echte Karte nutzt `react-native-maps` und läuft NICHT in Expo Go,
// sondern erst über einen Dev Build (Phase 2). Hier steht ein sauberer
// Platzhalter, der genau das erklärt.

export default function Karte() {
  const router = useRouter();
  const { city } = useCity();

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Kopf mit Liste/Karte-Umschalter (Karte aktiv) */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Text className="font-hk-extrabold text-title-md text-ink">{city}</Text>
        <View className="flex-row rounded-pill bg-chip p-1">
          <Pressable
            onPress={() => router.push("/(tabs)/feed")}
            className="rounded-pill px-4 py-2"
          >
            <Text className="font-hk-semibold text-[13px] text-ink-2">Liste</Text>
          </Pressable>
          <View className="rounded-pill bg-accent px-4 py-2">
            <Text className="font-hk-semibold text-[13px] text-accent-ink">Karte</Text>
          </View>
        </View>
      </View>

      {/* Platzhalter-Fläche in Karten-Optik */}
      <View className="flex-1 px-6 pb-28 pt-4">
        <View className="flex-1 items-center justify-center rounded-card bg-map-land px-8">
          <View className="h-14 w-14 items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-extrabold text-[22px] text-accent-ink">◎</Text>
          </View>
          <Text className="mt-5 text-center font-hk-extrabold text-title-sm text-ink">
            Die Karte kommt bald.
          </Text>
          <Text className="mt-2 text-center font-hk-medium text-[14px] leading-[20px] text-ink-2">
            Pins mit gelben Labels, Filter nach Art, Budget und Ambiente — das
            braucht eine echte Karten-Engine und kommt im nächsten Schritt über
            einen Dev Build.
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/feed")}
            className="mt-6 rounded-button bg-night px-6 py-3"
          >
            <Text className="font-hk-bold text-[14px] text-white">
              Solange im Feed stöbern
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
