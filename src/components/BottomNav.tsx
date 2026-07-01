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
import { useT } from "../lib/i18n";
import { useGeheimtipp } from "../store/geheimtipp";
import { shadows } from "../theme";
import { GeheimtippButton } from "./GeheimtippButton";
import { InitialsAvatar } from "./InitialsAvatar";

// Floating bottom navigation (white, rounded bar).
//
// Five equally wide cells: Feed · Areas · Map · profile icon · "?".
// The yellow active pill (50% cell width) slides smoothly under the active
// tab (Reanimated). The "?" cell (hidden gem) never gets the pill.
// The "profil" tab shows the initials icon instead of a text label.

const TABS = ["feed", "viertel", "karte", "profil"] as const;

const PADDING = 7;
const HPAD = 16; // horizontal side padding of the full-width field
const BAR_HEIGHT = 62;
const PILL_HEIGHT = 44;

interface BottomNavProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function BottomNav({ state, navigation }: BottomNavProps) {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  // Localized tab labels (feed stays "Feed" in both languages).
  const LABELS: Record<string, string> = {
    feed: "Feed",
    viertel: t("Areas", "Viertel"),
    karte: t("Map", "Karte"),
  };
  const { abgeholt } = useGeheimtipp();
  const [barWidth, setBarWidth] = useState(0);

  const tx = useSharedValue(0);
  const firstPlace = useSharedValue(true);

  // After it has been collected the "?" cell disappears -> only 4 tabs left,
  // which redistribute evenly across the width.
  const showTipp = !abgeholt;
  const cells = showTipp ? 5 : 4;

  const inner = Math.max(0, barWidth - HPAD * 2);
  const cellW = inner / cells;
  const pillW = cellW * 0.75; // 75% of the cell width

  const activeName = state.routes[state.index]?.name ?? "feed";
  const activeIndex = Math.max(0, TABS.indexOf(activeName as (typeof TABS)[number]));

  useEffect(() => {
    if (cellW <= 0) return;
    // Target position: middle of the active cell, pill centered.
    const target = activeIndex * cellW + (cellW - pillW) / 2;
    if (firstPlace.value) {
      // On the first measurement, place without animation (no pop-in).
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
      {/* Full-width bottom field (flush to the edges, hairline top border), with
          the home-indicator safe area below the row. */}
      <View
        className="border-t border-black/10 bg-surface"
        style={[
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
          shadows.nav,
        ]}
      >
        <View
          onLayout={onLayout}
          className="flex-row items-center"
          style={{ height: BAR_HEIGHT, paddingHorizontal: HPAD }}
        >
          {/* Sliding yellow active pill (behind the labels) */}
          {cellW > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  left: HPAD,
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

          {/* Four tabs — "profil" as the initials icon, otherwise a text label. */}
          {TABS.map((name) => {
          const focused = activeName === name;
          return (
            <Pressable
              key={name}
              onPress={() => navigation.navigate(name)}
              className="flex-1 items-center justify-center"
            >
              {name === "profil" ? (
                <InitialsAvatar size={26} textSize={11} focused={focused} />
              ) : (
                <Text
                  className={`font-hk-semibold text-[10px] tracking-[1px] ${
                    focused ? "text-accent-ink" : "text-ink-3"
                  }`}
                >
                  {LABELS[name].toUpperCase()}
                </Text>
              )}
            </Pressable>
          );
        })}

          {/* "?" cell: only while this week's tip has not been collected */}
          {showTipp ? (
            <View className="flex-1 items-center justify-center">
              <GeheimtippButton onPress={() => router.push("/geheimtipp")} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
