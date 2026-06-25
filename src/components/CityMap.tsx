import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Spot } from "../data/types";
import { PIN_COLORS } from "../lib/pinColors";
import { shadows } from "../theme";

// Hintergrund-Karte für den Karte-Screen.
//
// - Im **Dev Build** (mit Mapbox-Token) wird die echte **@rnmapbox/maps**-Karte
//   gerendert, mit Markern an den echten Koordinaten der Spots.
// - In **Expo Go** (wo native Module fehlen) wird automatisch eine stilisierte
//   Karte als Fallback gezeigt, damit nichts abstürzt.
//
// Der echte Token kommt aus der Umgebungsvariable EXPO_PUBLIC_MAPBOX_TOKEN
// (öffentlicher pk.*-Token). Fehlt er oder läuft die App in Expo Go, greift
// der Fallback.

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

// Mapbox nur außerhalb von Expo Go und nur mit Token laden (sonst Crash).
let Mapbox: any = null;
if (!isExpoGo && MAPBOX_TOKEN) {
  try {
    Mapbox = require("@rnmapbox/maps").default;
    Mapbox.setAccessToken(MAPBOX_TOKEN);
  } catch {
    Mapbox = null;
  }
}

// Mittelpunkt aus den Spots der Stadt (Schwerpunkt); Fallback: Wien.
function cityCenter(spots: Spot[]): [number, number] {
  if (spots.length === 0) return [16.3738, 48.2082];
  const lng = spots.reduce((a, s) => a + s.lng, 0) / spots.length;
  const lat = spots.reduce((a, s) => a + s.lat, 0) / spots.length;
  return [lng, lat];
}

// Pin-Inhalt: Punkt + (wenn aktiv) gelbes Label.
// Das Label liegt ABSOLUT über dem Punkt, damit der Punkt beim Auswählen
// nicht verrutscht (vorher schob das Label im Layout den Punkt nach unten).
//
// Das Label „ploppt" beim Auswählen auf: ein Reanimated-Wert (pop) fährt per
// Spring von 0 -> 1 (Scale + leichtes Hochsteigen + Fade). Es bleibt immer
// gemountet (kein `active ?`), damit es auch beim Abwählen sauber zurückfedert;
// inaktiv ist es per Opacity 0 + pointerEvents unsichtbar.
function Pin({
  spot,
  active,
  popAll,
  onPress,
}: {
  spot: Spot;
  active: boolean;
  popAll: boolean;
  onPress: () => void;
}) {
  // Startwert passend zum Zustand, damit der erste Pin nicht ungewollt animiert.
  const pop = useSharedValue(active ? 1 : 0);
  // Easter Egg: Doppeltipp auf die Karte zeigt/versteckt ALLE Labels (Toggle).
  const flash = useSharedValue(0);

  useEffect(() => {
    pop.value = active
      ? withSpring(1, { damping: 11, stiffness: 190, mass: 0.6 }) // federnder Pop
      : withTiming(0, { duration: 120 }); // schnelles, ruhiges Ausblenden
  }, [active, pop]);

  // popAll an -> alle Labels ploppen auf und BLEIBEN; popAll aus -> wieder weg.
  useEffect(() => {
    flash.value = popAll
      ? withSpring(1, { damping: 12, stiffness: 190, mass: 0.6 })
      : withTiming(0, { duration: 200 });
  }, [popAll, flash]);

  // Sichtbarkeit = stärkerer Wert aus Auswahl (pop) und Doppeltipp (flash).
  const labelStyle = useAnimatedStyle(() => {
    const v = Math.max(pop.value, flash.value);
    return {
      opacity: v,
      transform: [{ translateY: (1 - v) * 8 }, { scale: 0.6 + v * 0.4 }],
    };
  });

  // Farben kommen zentral aus PIN_COLORS (je Kategorie: Oval/Inner/Dot).
  // Events behalten ihre Sonderform (Rechteck mit Datum), Orte sind Pillen.
  const isEvent = spot.category === "event";
  const c = PIN_COLORS[spot.category];
  // Heller Punkt (Gelb) braucht eine dunkle Kontur, sonst eine cremefarbene.
  const dotBorder = spot.category === "event" ? "#1A1A1A" : "#F7F4EF";

  // Label ist nur antippbar, wenn es sichtbar ist (ausgewählt oder per
  // Doppeltipp). `box-none` -> nur die Label-Box selbst fängt Tipps, die breite
  // transparente Fläche lässt Tipps durch (Hintergrund/andere Pins).
  const labelTouchable = active || popAll;

  return (
    <View className="items-center justify-center">
      <Animated.View
        pointerEvents={labelTouchable ? "box-none" : "none"}
        style={[
          { position: "absolute", bottom: 22, left: -130, right: -130, alignItems: "center" },
          labelStyle,
        ]}
      >
        {/* Tippen auf den Namen schließt den Ort wieder (Toggle wie der Punkt).
            Farben (Oval-Hintergrund + Innenfarbe) kommen aus PIN_COLORS. */}
        <Pressable onPress={onPress}>
          {isEvent ? (
            // Event: abgerundetes RECHTECK (Name + Datum passen besser rein).
            <View
              className="items-center rounded-button px-3.5 py-2"
              style={[{ backgroundColor: c.oval }, shadows.card]}
            >
              <Text
                className="font-hk-extrabold text-[15px]"
                style={{ color: c.inner }}
                numberOfLines={1}
              >
                {spot.name}
              </Text>
              {spot.dateLabel ? (
                <Text
                  className="mt-0.5 font-hk-semibold text-[11px]"
                  style={{ color: c.inner }}
                  numberOfLines={1}
                >
                  {spot.dateLabel}
                </Text>
              ) : null}
            </View>
          ) : (
            // Ort: Pille ("Oval").
            <View
              className="rounded-pill px-3 py-1.5"
              style={[{ backgroundColor: c.oval }, shadows.card]}
            >
              <Text
                className="font-hk-extrabold text-[15px]"
                style={{ color: c.inner }}
                numberOfLines={1}
              >
                {spot.name}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Punkt — Farbe aus PIN_COLORS; antippen wählt aus / hebt auf. */}
      <Pressable onPress={onPress} hitSlop={10}>
        <View
          className="rounded-pill"
          style={{
            width: 14,
            height: 14,
            backgroundColor: c.dot,
            borderWidth: 2.5,
            borderColor: dotBorder,
          }}
        />
      </Pressable>
    </View>
  );
}

// Feste Pin-Positionen (Prozent) für die stilisierte Fallback-Karte.
const FALLBACK_POS = [
  { top: "40%", left: "40%" },
  { top: "20%", left: "62%" },
  { top: "60%", left: "20%" },
  { top: "30%", left: "26%" },
  { top: "55%", left: "72%" },
] as const;

interface CityMapProps {
  spots: Spot[];
  /** Aktuell ausgewählter Spot (zeigt das gelbe Label am Pin). */
  selectedId?: string;
  /** Wird beim Antippen eines Pins aufgerufen -> Karte öffnet die Spot-Karte. */
  onSelect: (spot: Spot) => void;
}

export function CityMap({ spots, selectedId, onSelect }: CityMapProps) {
  // Easter Egg: Doppeltipp auf leere Kartenfläche -> TOGGLE: alle Pins ploppen
  // auf; nochmaliger Doppeltipp blendet sie wieder aus.
  const [popAll, setPopAll] = useState(false);
  const lastTap = useRef(0);
  const handleBackgroundTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setPopAll((v) => !v); // zweiter Tipp schnell genug -> Doppeltipp -> umschalten
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  // ── Echte Mapbox-Karte (Dev Build mit Token) ──
  if (Mapbox) {
    const center = cityCenter(spots);
    return (
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL?.Light}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Mapbox.Camera
          centerCoordinate={center}
          zoomLevel={12.5}
          animationDuration={0}
        />
        {spots.map((spot) => (
          <Mapbox.MarkerView
            key={spot.id}
            id={spot.id}
            coordinate={[spot.lng, spot.lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Pin
              spot={spot}
              active={spot.id === selectedId}
              popAll={popAll}
              onPress={() => onSelect(spot)}
            />
          </Mapbox.MarkerView>
        ))}
      </Mapbox.MapView>
    );
  }

  // ── Stilisierte Fallback-Karte (Expo Go / kein Token) ──
  return (
    <View className="flex-1 overflow-hidden">
      <View className="absolute inset-0 bg-map-land" />
      <View
        className="absolute h-[86px] w-[118px] rounded-[16px] bg-map-park"
        style={{ top: 120, left: 36 }}
      />
      <View
        className="absolute h-[80px] w-[96px] rounded-[16px] bg-map-park"
        style={{ bottom: 220, right: 30 }}
      />
      <View
        className="absolute bg-map-water"
        style={{ top: -60, right: -26, width: 60, height: "150%", transform: [{ rotate: "26deg" }] }}
      />
      <View
        className="absolute bg-[#F1ECE3]"
        style={{ top: 40, left: 130, width: 50, height: "120%", transform: [{ rotate: "20deg" }] }}
      />
      <Text className="absolute font-hk-medium text-[10px] text-[#9C978E]" style={{ top: 80, left: 40 }}>
        Operngasse
      </Text>
      <Text className="absolute font-hk-medium text-[10px] text-[#9C978E]" style={{ top: 300, left: 230 }}>
        Rechte Wienzeile
      </Text>

      {/* Tap-Fläche für den Doppeltipp (liegt HINTER den Pins, die danach
          gerendert werden -> Pin-Taps gehen weiterhin durch). */}
      <Pressable
        onPress={handleBackgroundTap}
        className="absolute inset-0"
      />

      {spots.slice(0, 5).map((spot, i) => (
        <View
          key={spot.id}
          className="absolute items-center"
          style={{
            top: FALLBACK_POS[i].top as `${number}%`,
            left: FALLBACK_POS[i].left as `${number}%`,
          }}
        >
          <Pin
            spot={spot}
            active={spot.id === selectedId}
            popAll={popAll}
            onPress={() => onSelect(spot)}
          />
        </View>
      ))}
    </View>
  );
}
