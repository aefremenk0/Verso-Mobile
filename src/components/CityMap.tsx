import Constants, { ExecutionEnvironment } from "expo-constants";
import { Pressable, Text, View } from "react-native";
import type { Spot } from "../data/types";
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
function Pin({ spot, active }: { spot: Spot; active: boolean }) {
  return (
    <View className="items-center justify-center">
      {active ? (
        <View
          pointerEvents="none"
          style={{ position: "absolute", bottom: 22, left: -130, right: -130, alignItems: "center" }}
        >
          <View className="rounded-pill bg-accent px-3 py-1.5" style={shadows.card}>
            <Text
              className="font-hk-extrabold text-[15px] text-accent-ink"
              numberOfLines={1}
            >
              {spot.name}
            </Text>
          </View>
        </View>
      ) : null}
      <View
        className="rounded-pill bg-night"
        style={{ width: 14, height: 14, borderWidth: 2.5, borderColor: "#F7F4EF" }}
      />
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
            <Pressable onPress={() => onSelect(spot)}>
              <Pin spot={spot} active={spot.id === selectedId} />
            </Pressable>
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

      {spots.slice(0, 5).map((spot, i) => (
        <Pressable
          key={spot.id}
          onPress={() => onSelect(spot)}
          className="absolute items-center"
          style={{
            top: FALLBACK_POS[i].top as `${number}%`,
            left: FALLBACK_POS[i].left as `${number}%`,
          }}
        >
          <Pin spot={spot} active={spot.id === selectedId} />
        </Pressable>
      ))}
    </View>
  );
}
