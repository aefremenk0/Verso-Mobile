import { useEffect, useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useCity } from "../store/city";
import { Pill } from "./Pill";

// Eine Stadt-Pille im Dropdown, die gestaffelt per Spring hereinploppt.
function DropdownCity({
  index,
  label,
  active,
  onPress,
}: {
  index: number;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      index * 45, // Versatz -> Pills erscheinen nacheinander
      withSpring(1, { damping: 13, stiffness: 200, mass: 0.6 }),
    );
    // nur beim Mounten (Dropdown öffnet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.8 + p.value * 0.2 }, { translateY: (1 - p.value) * 8 }],
  }));
  return (
    <Animated.View style={style}>
      <Pill label={label} active={active} onPress={onPress} />
    </Animated.View>
  );
}

// Einheitlicher Stadt-Kopf mit Dropdown — identisch auf Feed, Viertel und Karte.
// Zeigt "Wien ▾" links und klappt eine horizontale Reihe wählbarer Städte aus.
//  - `center` sitzt ABSOLUT zentriert in der Zeile (z. B. Liste/Karte-Toggle).
//  - `right`  sitzt rechts (z. B. Szenen-Toggle).
// So liegen Stadt, zentrierter Toggle und rechtes Element auf EINER Höhe.

export function CityDropdown({
  center,
  right,
}: {
  center?: ReactNode;
  right?: ReactNode;
}) {
  const { city, setCity, cities } = useCity();
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();

  // Wenn ein zentriertes Element (Liste/Karte) da ist, die Stadt-Breite auf die
  // linke Zone bis vor den Toggle begrenzen -> lange Namen (Düsseldorf) laufen
  // nicht mehr unter den Toggle, sondern verkleinern sich (adjustsFontSizeToFit).
  // px-6 = 48 Gesamt-Padding, ~150 geschätzte Toggle-Breite, 8 Abstand.
  const cityMaxWidth = center
    ? Math.max(70, (width - 48 - 150) / 2 - 8)
    : undefined;

  // Feinjustierung pro Stadt: durch adjustsFontSizeToFit sitzen unterschiedlich
  // lange Namen minimal anders -> per Stadt vertikal nachschieben (+ = runter).
  const CITY_NUDGE: Record<string, number> = {
    Wien: 3,
    Berlin: 3,
    Zürich: 3, // gleiche Wortlänge wie Berlin
    Düsseldorf: -2,
  };
  const nudge = CITY_NUDGE[city] ?? 0;

  // Pfeil dreht beim Öffnen von ▾ zu ▴ (180°).
  const caret = useSharedValue(0);
  useEffect(() => {
    caret.value = withTiming(open ? 1 : 0, { duration: 220 });
  }, [open, caret]);
  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${caret.value * 180}deg` }],
  }));

  return (
    <View>
      {/* Feste Zeilenhöhe -> "Wien" sitzt auf jeder Seite gleich, egal ob
          rechts/zentriert ein Element steht oder nicht. */}
      <View className="px-6 pt-2">
        <View className="justify-center" style={{ height: 42 }}>
          {/* Zentriertes Element (z. B. Liste/Karte) — horizontal UND vertikal
              mittig, damit es auf einer Linie mit „Wien"/dem rechten Element sitzt. */}
          {center ? (
            <View
              pointerEvents="box-none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {center}
            </View>
          ) : null}

          {/* Stadt links + rechtes Element */}
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setOpen((v) => !v)}
              className="flex-row items-center"
              style={{ maxWidth: cityMaxWidth, transform: [{ translateY: nudge }] }}
            >
              <Text
                className="font-hk-extrabold text-title-md text-ink"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.4}
                style={{ flexShrink: 1 }}
              >
                {city}
              </Text>
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

      {/* Aufklappbares Stadt-Menü — horizontal scrollbar */}
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
