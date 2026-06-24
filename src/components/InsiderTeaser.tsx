import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { shadows } from "../theme";

// „Verso Insider" — ein noch verborgenes Feature, das in einer kommenden
// App-Version kommt. Bewusst dunkel + mystisch (statt klickbarem Gelb):
// verschleierter „Kreis" mit sanft pulsierendem Schimmer und Sternchen
// signalisiert „bald" — die Box führt absichtlich nirgendwohin.
export function InsiderTeaser() {
  // Langsames Ein-/Ausatmen des Schimmers -> wirkt lebendig, geheimnisvoll.
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1, // endlos
      true, // hin und zurück
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + glow.value * 0.28,
    transform: [{ scale: 0.85 + glow.value * 0.3 }],
  }));

  return (
    <View
      className="mt-4 overflow-hidden rounded-card bg-night p-5"
      style={shadows.card}
    >
      {/* Dezente, schwebende Sternchen im Hintergrund (mystische Textur). */}
      <Text className="absolute right-7 top-6 text-[10px] text-accent/30">✦</Text>
      <Text className="absolute bottom-6 right-20 text-[8px] text-white/15">✧</Text>
      <Text className="absolute bottom-5 left-10 text-[7px] text-accent/20">✦</Text>

      <View className="flex-row items-center justify-between">
        <Text className="font-hk-bold text-[10px] tracking-[2px] text-accent">
          DEMNÄCHST · NEUE VERSION
        </Text>

        {/* Pulsierender Schimmer hinter einem Sternchen — statt Pfeil, damit
            klar ist: führt (noch) nirgendwohin. */}
        <View className="h-9 w-9 items-center justify-center">
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#FFE500",
              },
              glowStyle,
            ]}
          />
          <View className="h-9 w-9 items-center justify-center rounded-pill border border-white/15 bg-night">
            <Text className="text-[15px] text-accent">✦</Text>
          </View>
        </View>
      </View>

      <Text className="mt-3 font-hk-extrabold-italic text-[20px] text-white">
        Verso Insider
      </Text>
      <Text className="mt-1 font-hk-medium-italic text-[13px] leading-[18px] text-white/55">
        Ein Kreis, der noch im Verborgenen liegt. Wir lüften den Vorhang in einer
        kommenden Version.
      </Text>
    </View>
  );
}
