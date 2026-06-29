import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { isComingSoon } from "../data/cities";
import { useCity } from "../store/city";
import { DiagonalStrike } from "./DiagonalStrike";
import { Pill } from "./Pill";

// City name with a "roll + fade" change: when the city changes, the old name
// rolls up and away (fades out), the new one rolls in from below (fades in) —
// like a calm departure board. Both names briefly overlap (the outgoing one
// absolutely on top, so the layout width follows the NEW name).
const ROLL = 20; // roll distance in px (font is 30px) — subtle, not harsh.

function CityName({ city }: { city: string }) {
  // `display` = currently visible (incoming) name, `outgoing` = the old name
  // currently rolling out (null when nothing is animating).
  const [display, setDisplay] = useState(city);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const progress = useSharedValue(1); // 1 = resting state (no roll)

  useEffect(() => {
    if (city === display) return;
    setOutgoing(display); // old name rolls out
    setDisplay(city); // new name rolls in
    progress.value = 0;
    progress.value = withTiming(1, { duration: 340 }, (finished) => {
      if (finished) runOnJS(setOutgoing)(null); // clean up after the roll
    });
    // only react to city changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Incoming: from +ROLL to 0, opacity 0 -> 1.
  const incomingStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * ROLL }],
  }));
  // Outgoing: from 0 to -ROLL, opacity 1 -> 0.
  const outgoingStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: progress.value * -ROLL }],
  }));

  // City name always at full size (text-title-md), never shrunk.
  return (
    <View>
      <Animated.Text
        className="font-hk-extrabold text-title-md text-ink"
        numberOfLines={1}
        style={incomingStyle}
      >
        {display}
      </Animated.Text>
      {outgoing !== null ? (
        <Animated.Text
          className="font-hk-extrabold text-title-md text-ink"
          numberOfLines={1}
          pointerEvents="none"
          style={[{ position: "absolute", left: 0, top: 0 }, outgoingStyle]}
        >
          {outgoing}
        </Animated.Text>
      ) : null}
    </View>
  );
}

// A city pill in the dropdown that pops in staggered via spring.
// "coming soon" cities (all except the pilot city) are shown dimmed + struck
// through diagonally and are not tappable.
function DropdownCity({
  index,
  label,
  active,
  comingSoon,
  onPress,
}: {
  index: number;
  label: string;
  active: boolean;
  comingSoon: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      index * 45, // offset -> pills appear one after another
      withSpring(1, { damping: 13, stiffness: 200, mass: 0.6 }),
    );
    // only on mount (dropdown opens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.8 + p.value * 0.2 }, { translateY: (1 - p.value) * 8 }],
  }));
  return (
    <Animated.View style={style}>
      <View
        pointerEvents={comingSoon ? "none" : "auto"}
        accessibilityLabel={comingSoon ? `${label} — coming soon` : label}
        style={comingSoon ? { opacity: 0.45 } : undefined}
      >
        <Pill label={label} active={active} onPress={comingSoon ? () => {} : onPress} />
      </View>
      {comingSoon ? <DiagonalStrike /> : null}
    </Animated.View>
  );
}

// Unified city header with dropdown — identical on Feed, Areas and Map.
// Shows "München ▾" on the left (always at full size) and expands a horizontal
// row of selectable cities. `right` sits on the right (e.g. the scene toggle).

export function CityDropdown({ right }: { right?: ReactNode }) {
  const { city, setCity, cities } = useCity();
  const [open, setOpen] = useState(false);

  // Caret rotates from ▾ to ▴ (180°) when opening.
  const caret = useSharedValue(0);
  useEffect(() => {
    caret.value = withTiming(open ? 1 : 0, { duration: 220 });
  }, [open, caret]);
  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${caret.value * 180}deg` }],
  }));

  return (
    <View>
      {/* Fixed row height -> the city name sits at the same spot on every screen. */}
      <View className="px-6 pt-2">
        <View className="justify-center" style={{ height: 42 }}>
          {/* City on the left (full size) + right-hand element */}
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setOpen((v) => !v)}
              className="flex-row items-center"
            >
              {/* City name with roll+fade transition, always at full size. */}
              <CityName city={city} />
              <Animated.Text
                style={[
                  { marginLeft: 4, fontSize: 18, color: "#8A857C", fontWeight: "700" },
                  caretStyle,
                ]}
              >
                ▾
              </Animated.Text>
            </Pressable>
            {right ?? null}
          </View>
        </View>
      </View>

      {/* Expandable city menu — horizontally scrollable */}
      {open ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          className="mt-3 max-h-[44px] flex-none"
        >
          {cities.map((c, i) => (
            <DropdownCity
              key={c}
              index={i}
              label={c}
              active={c === city}
              comingSoon={isComingSoon(c)}
              onPress={() => {
                setCity(c);
                setOpen(false);
              }}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
