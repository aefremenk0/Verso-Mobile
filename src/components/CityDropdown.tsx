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

// Stadtname mit „Roll + Fade"-Wechsel: beim Stadtwechsel rollt der alte Name
// nach oben weg (fadet aus), der neue rollt von unten herein (fadet ein) —
// wie eine ruhige Anzeigetafel. Beide Namen liegen kurz übereinander (der
// abgehende absolut darüber, damit die Layout-Breite dem NEUEN Namen folgt).
const ROLL = 20; // Roll-Distanz in px (Schrift ist 30px) — dezent, nicht hart.

function CityName({ city }: { city: string }) {
  // `display` = aktuell sichtbarer (hereinkommender) Name, `outgoing` = der
  // gerade hinausrollende alte Name (null, wenn nichts animiert).
  const [display, setDisplay] = useState(city);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const progress = useSharedValue(1); // 1 = Ruhezustand (kein Roll)

  useEffect(() => {
    if (city === display) return;
    setOutgoing(display); // alter Name rollt raus
    setDisplay(city); // neuer Name rollt rein
    progress.value = 0;
    progress.value = withTiming(1, { duration: 340 }, (finished) => {
      if (finished) runOnJS(setOutgoing)(null); // nach dem Roll aufräumen
    });
    // nur auf Stadtwechsel reagieren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Hereinkommend: von +ROLL nach 0, Opacity 0 -> 1.
  const incomingStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * ROLL }],
  }));
  // Abgehend: von 0 nach -ROLL, Opacity 1 -> 0.
  const outgoingStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: progress.value * -ROLL }],
  }));

  // Stadtname immer in voller Größe (text-title-md), nie verkleinert.
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

// Eine Stadt-Pille im Dropdown, die gestaffelt per Spring hereinploppt.
// „kommt bald"-Städte (alle außer der Pilotstadt) werden gedimmt + diagonal
// durchgestrichen dargestellt und sind nicht antippbar.
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
      <View
        pointerEvents={comingSoon ? "none" : "auto"}
        accessibilityLabel={comingSoon ? `${label} — kommt bald` : label}
        style={comingSoon ? { opacity: 0.45 } : undefined}
      >
        <Pill label={label} active={active} onPress={comingSoon ? () => {} : onPress} />
      </View>
      {comingSoon ? <DiagonalStrike /> : null}
    </Animated.View>
  );
}

// Einheitlicher Stadt-Kopf mit Dropdown — identisch auf Feed, Viertel und Karte.
// Zeigt "Wien ▾" links (immer in voller Größe) und klappt eine horizontale Reihe
// wählbarer Städte aus. `right` sitzt rechts (z. B. Szenen-Toggle).

export function CityDropdown({ right }: { right?: ReactNode }) {
  const { city, setCity, cities } = useCity();
  const [open, setOpen] = useState(false);

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
      {/* Feste Zeilenhöhe -> "Wien" sitzt auf jeder Seite gleich. */}
      <View className="px-6 pt-2">
        <View className="justify-center" style={{ height: 42 }}>
          {/* Stadt links (volle Größe) + rechtes Element */}
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setOpen((v) => !v)}
              className="flex-row items-center"
            >
              {/* Stadtname mit Roll+Fade-Wechsel, immer in voller Größe. */}
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
