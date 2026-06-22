import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useGeheimtipp } from "../store/geheimtipp";

// Runder "Du"-Avatar oben rechts im Feed.
// Solange der Geheimtipp der Woche nicht abgeholt ist, sitzt ein gelbes
// "?"-Badge darüber, das beim Erscheinen kurz aufpoppt (Reanimated-Spring).
//  - Avatar antippen  -> Profil
//  - Badge antippen    -> Geheimtipp-Lade-Screen

export function DuAvatar() {
  const router = useRouter();
  const { abgeholt } = useGeheimtipp();
  const scale = useSharedValue(0);

  useEffect(() => {
    // Auftritt mit leichtem Überschwung; verschwindet, sobald abgeholt.
    scale.value = abgeholt
      ? withSpring(0, { damping: 14, stiffness: 160 })
      : withDelay(350, withSpring(1, { damping: 7, stiffness: 150 }));
  }, [abgeholt, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <View className="relative">
      <Pressable
        onPress={() => router.push("/(tabs)/profil")}
        className="h-[38px] w-[38px] items-center justify-center rounded-pill"
        style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
      >
        <Text className="font-hk-semibold text-[11px] text-ink">Du</Text>
      </Pressable>

      {/* "?"-Badge */}
      <Animated.View
        style={[
          { position: "absolute", top: -6, right: -6 },
          badgeStyle,
        ]}
        pointerEvents={abgeholt ? "none" : "auto"}
      >
        <Pressable
          onPress={() => router.push("/geheimtipp")}
          className="h-[20px] w-[20px] items-center justify-center rounded-pill bg-accent"
          style={{
            borderWidth: 2,
            borderColor: "#F7F4EF",
          }}
        >
          <Text className="font-hk-extrabold text-[11px] text-accent-ink">?</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
