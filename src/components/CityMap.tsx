import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { isEventCategory } from "../data/categories";
import type { Spot } from "../data/types";
import { useLang, useT } from "../lib/i18n";
import { spotText } from "../lib/localized";
import { PIN_COLORS } from "../lib/pinColors";
import { useReduceMotion } from "../lib/useReduceMotion";
import { shadows } from "../theme";

// Background map for the Map screen.
//
// - In the **Dev Build** the real native map from **react-native-maps** is
//   rendered: **Apple Maps on iOS** (PROVIDER_DEFAULT, no token needed), Google
//   Maps on Android. Markers sit at the spots' coordinates, tinted per category.
//   Full-bleed tiles; `mapPadding` keeps the native controls clear of our
//   floating chrome (location button below the pills, Apple logo above the nav).
// - In **Expo Go** (where native modules are missing) a stylized fallback map
//   is shown automatically, so nothing crashes. The playful custom pin labels
//   + double-tap easter egg live on this fallback.

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Load react-native-maps only outside Expo Go (native view crashes in Expo Go).
let RNMaps: any = null;
if (!isExpoGo) {
  try {
    RNMaps = require("react-native-maps");
  } catch {
    RNMaps = null;
  }
}

// Center from the city's spots (centroid); fallback: Munich.
function cityCenter(spots: Spot[]): { latitude: number; longitude: number } {
  if (spots.length === 0) return { latitude: 48.1372, longitude: 11.5755 };
  const lng = spots.reduce((a, s) => a + s.lng, 0) / spots.length;
  const lat = spots.reduce((a, s) => a + s.lat, 0) / spots.length;
  return { latitude: lat, longitude: lng };
}

// Pin content: dot + (when active) yellow label.
// The label sits ABSOLUTELY above the dot, so the dot does not shift when
// selecting (previously the label pushed the dot down in the layout).
//
// The label "pops" open on selection: a Reanimated value (pop) springs from
// 0 -> 1 (scale + a slight rise + fade). It stays mounted at all times (no
// `active ?`), so it also springs back cleanly on deselect; when inactive it
// is invisible via opacity 0 + pointerEvents.
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
  const lang = useLang();
  const name = spotText(spot, lang).name;
  // Initial value matching the state, so the first pin does not animate by accident.
  const pop = useSharedValue(active ? 1 : 0);
  // Easter egg: double-tapping the map shows/hides ALL labels (toggle).
  const flash = useSharedValue(0);

  useEffect(() => {
    pop.value = active
      ? withSpring(1, { damping: 11, stiffness: 190, mass: 0.6 }) // springy pop
      : withTiming(0, { duration: 120 }); // quick, calm fade-out
  }, [active, pop]);

  // popAll on -> all labels pop open and STAY; popAll off -> gone again.
  useEffect(() => {
    flash.value = popAll
      ? withSpring(1, { damping: 12, stiffness: 190, mass: 0.6 })
      : withTiming(0, { duration: 200 });
  }, [popAll, flash]);

  // Visibility = the stronger of selection (pop) and double-tap (flash).
  const labelStyle = useAnimatedStyle(() => {
    const v = Math.max(pop.value, flash.value);
    return {
      opacity: v,
      transform: [{ translateY: (1 - v) * 8 }, { scale: 0.6 + v * 0.4 }],
    };
  });

  // Colors come centrally from PIN_COLORS (per category: oval/inner/dot).
  // Event-like categories keep the special shape (rectangle with a date).
  const isEvent = isEventCategory(spot.category);
  const c = PIN_COLORS[spot.category];
  // Cream-colored outline for visibility on the map.
  const dotBorder = "#F7F4EF";

  // Pulsing outline around the dot (like the hidden-gem "?") — in the pin color.
  const pulse = useSharedValue(0);
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0; // calm: no growing ring, just a subtle halo
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.out(Easing.ease) }),
      -1, // infinite
      false, // always from the start (ring grows & fades, jumps back)
    );
  }, [pulse, reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.5,
    transform: [{ scale: 1 + pulse.value * 1.8 }],
  }));

  // The label is only tappable when visible (selected or via double-tap).
  // `box-none` -> only the label box itself catches taps, the wide transparent
  // area lets taps through (background/other pins).
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
        {/* Tapping the name closes the place again (toggle, like the dot).
            Colors (oval background + inner color) come from PIN_COLORS. */}
        <Pressable onPress={onPress}>
          {isEvent ? (
            // Event: rounded RECTANGLE (name + date fit better).
            <View
              className="items-center rounded-button px-3.5 py-2"
              style={[{ backgroundColor: c.oval }, shadows.card]}
            >
              <Text
                className="font-hk-extrabold text-[15px]"
                style={{ color: c.inner }}
                numberOfLines={1}
              >
                {name}
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
            // Place: pill ("oval").
            <View
              className="rounded-pill px-3 py-1.5"
              style={[{ backgroundColor: c.oval }, shadows.card]}
            >
              <Text
                className="font-hk-extrabold text-[15px]"
                style={{ color: c.inner }}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Dot + pulsing outline (in the pin color); tap selects / deselects. */}
      <Pressable onPress={onPress} hitSlop={10}>
        <View style={{ width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>
          {/* pulsing ring behind the dot */}
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                width: 14,
                height: 14,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: c.dot,
              },
              pulseStyle,
            ]}
          />
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
        </View>
      </Pressable>
    </View>
  );
}

// Fixed pin positions (percent) for the stylized fallback map.
const FALLBACK_POS = [
  { top: "40%", left: "40%" },
  { top: "20%", left: "62%" },
  { top: "60%", left: "20%" },
  { top: "30%", left: "26%" },
  { top: "55%", left: "72%" },
] as const;

interface CityMapProps {
  spots: Spot[];
  /** Currently selected spot (shows the yellow label on the pin). */
  selectedId?: string;
  /** Called when a pin is tapped -> the screen opens the spot card. */
  onSelect: (spot: Spot) => void;
  /** Double-tap resets the view -> also clear the single selection. */
  onClearSelection?: () => void;
  /**
   * Insets for the REAL native map only (expo-maps). Apple/Google pin their
   * controls (location button top, Apple logo bottom) to the map view's frame,
   * and there's no padding API — so we shrink the frame: `topInset` pushes the
   * location button below the floating category bar; `bottomInset` lifts the
   * Apple logo above the floating bottom nav (required by Apple). Ignored by the
   * Expo Go fallback map.
   */
  topInset?: number;
  bottomInset?: number;
  /** When set (from a "focus" navigation), the real map animates to this point
   *  (the `key` makes repeated focuses on the same spot re-trigger). */
  centerOn?: { latitude: number; longitude: number; key: number } | null;
}

// Once per session: on the first open of the map, show the double-tap gesture
// (all pins pop open briefly + hint chip). In-memory, no storage needed.
let demoShown = false;

export function CityMap({
  spots,
  selectedId,
  onSelect,
  onClearSelection,
  topInset = 0,
  bottomInset = 0,
  centerOn = null,
}: CityMapProps) {
  const t = useT();
  // Ref to the real map so a "focus" navigation can animate to a spot.
  const mapRef = useRef<any>(null);
  useEffect(() => {
    if (centerOn && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        {
          latitude: centerOn.latitude,
          longitude: centerOn.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    }
  }, [centerOn]);
  // Easter egg: double-tap on the empty map area -> TOGGLE: all pins pop open;
  // another double-tap hides them again. Both also reset the single selection,
  // so no selected pin/card stays "stuck".
  const [popAll, setPopAll] = useState(false);
  const lastTap = useRef(0);
  const handleBackgroundTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setPopAll((v) => !v); // double-tap -> toggle
      onClearSelection?.(); // always reset the selection too
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  // First-visit demo (A) + hint chip (B) — only on the fallback map (where the
  // double-tap applies), once per session.
  const [hint, setHint] = useState(false);
  const hintOpacity = useSharedValue(0);
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  useEffect(() => {
    if (RNMaps || demoShown) return;
    if (spots.length === 0) return; // nothing to show
    demoShown = true;

    setPopAll(true); // A: briefly pop open all labels
    setHint(true); // B: show the hint chip
    hintOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(3000, withTiming(0, { duration: 500 })),
    );

    const t1 = setTimeout(() => setPopAll(false), 1600); // hide the demo again
    const t2 = setTimeout(() => setHint(false), 3900); // remove the chip
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // only evaluate on the first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real native map: Apple Maps (iOS) / Google Maps (Android), Dev Build ──
  if (RNMaps) {
    const MapView = RNMaps.default;
    const Marker = RNMaps.Marker;
    const center = cityCenter(spots);
    // Full-bleed tiles; `mapPadding` insets ONLY the native controls: the
    // location button drops below the floating category pills (top) and the
    // Apple logo lifts above the bottom nav (bottom) — Apple requires it visible.
    return (
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={RNMaps.PROVIDER_DEFAULT}
        initialRegion={{ ...center, latitudeDelta: 0.055, longitudeDelta: 0.055 }}
        mapPadding={{ top: topInset, right: 0, bottom: bottomInset, left: 0 }}
        showsUserLocation
        showsMyLocationButton
        // Marker tap -> select via the map-level event (reliable on New Arch);
        // NO `title` on the markers, so no native callout ("ugly text") appears.
        onMarkerPress={(e: { nativeEvent: { id?: string } }) => {
          const s = spots.find((x) => x.id === e.nativeEvent.id);
          if (s) onSelect(s);
        }}
        onPress={() => onClearSelection?.()}
      >
        {spots.map((s) => (
          <Marker
            key={s.id}
            identifier={s.id}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            pinColor={PIN_COLORS[s.category].dot}
          />
        ))}
      </MapView>
    );
  }

  // ── Stylized fallback map (Expo Go / no token) ──
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
      <Text className="absolute font-hk-medium text-[10px] text-[#9C978E]" style={{ top: 300, left: "62%" }}>
        Rechte Wienzeile
      </Text>

      {/* Tap area for the double-tap (sits BEHIND the pins, which are rendered
          afterward -> pin taps still go through). */}
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

      {/* Hint chip (B): explains the double-tap gesture, fades out. Deliberately
          sits below the floating category bar (~top 6–56), so it does not
          overlap the category ovals. */}
      {hint ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 66, right: 12 }, hintStyle]}
        >
          <View className="rounded-pill bg-night px-3 py-2" style={shadows.card}>
            <Text className="font-hk-semibold text-[11px] text-screen">
              {t("Double-tap to show all places", "Doppeltippen zeigt alle Orte")}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
