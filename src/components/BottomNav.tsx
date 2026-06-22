import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shadows } from "../theme";

// Schwebende Bottom-Navigation (weiße, abgerundete Leiste).
//
// Fünf gleich breite Zellen: Feed · Viertel · Karte · Du · "?".
// Der gelbe Aktiv-Pill (50% Zellenbreite) gleitet smooth unter den aktiven
// Reiter (Reanimated). Die "?"-Zelle (Geheimtipp) bekommt nie den Pill.

const TABS = ["feed", "viertel", "karte", "profil"] as const;
const LABELS: Record<string, string> = {
  feed: "Feed",
  viertel: "Viertel",
  karte: "Karte",
  profil: "Du",
};

const PADDING = 7;
const BAR_HEIGHT = 62;
const PILL_HEIGHT = 44;
const CELLS = 5; // 4 Reiter + "?"

interface BottomNavProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function BottomNav({ state, navigation }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const tx = useSharedValue(0);
  const firstPlace = useSharedValue(true);

  const inner = Math.max(0, barWidth - PADDING * 2);
  const cellW = inner / CELLS;
  const pillW = cellW * 0.5; // 50% der Zellenbreite

  const activeName = state.routes[state.index]?.name ?? "feed";
  const activeIndex = Math.max(0, TABS.indexOf(activeName as (typeof TABS)[number]));

  useEffect(() => {
    if (cellW <= 0) return;
    // Zielposition: Mitte der aktiven Zelle, Pill zentriert.
    const target = activeIndex * cellW + (cellW - pillW) / 2;
    if (firstPlace.value) {
      // Beim ersten Messen ohne Animation platzieren (kein Aufpoppen).
      tx.value = target;
      firstPlace.value = false;
    } else {
      tx.value = withTiming(target, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeIndex, cellW, pillW, tx, firstPlace]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      pointerEvents="box-none"
    >
      <View
        onLayout={onLayout}
        className="mx-4 flex-row items-center rounded-card border border-black/10 bg-surface"
        style={[
          {
            height: BAR_HEIGHT,
            padding: PADDING,
            marginBottom: insets.bottom > 0 ? insets.bottom : 14,
          },
          shadows.nav,
        ]}
      >
        {/* Gleitender gelber Aktiv-Pill (hinter den Labels) */}
        {cellW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: PADDING,
                top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
                width: pillW,
                height: PILL_HEIGHT,
                borderRadius: 17,
                backgroundColor: "#FFE500",
              },
              pillStyle,
            ]}
          />
        ) : null}

        {/* Vier Reiter */}
        {TABS.map((name) => {
          const focused = activeName === name;
          return (
            <Pressable
              key={name}
              onPress={() => navigation.navigate(name)}
              className="flex-1 items-center justify-center"
            >
              <Text
                className={`font-hk-semibold text-[10px] tracking-[1px] ${
                  focused ? "text-accent-ink" : "text-ink-3"
                }`}
              >
                {LABELS[name].toUpperCase()}
              </Text>
            </Pressable>
          );
        })}

        {/* "?"-Zelle: Geheimtipp-Schnellzugriff (gleiche Breite wie die Reiter) */}
        <Pressable
          onPress={() => router.push("/geheimtipp")}
          className="flex-1 items-center justify-center"
        >
          <View
            className="h-[40px] w-[40px] items-center justify-center rounded-pill"
            style={{ borderWidth: 1.6, borderColor: "#FFE500" }}
          >
            <View className="h-[26px] w-[26px] items-center justify-center rounded-pill bg-night">
              <Text className="font-hk-extrabold text-[14px] text-accent">?</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
