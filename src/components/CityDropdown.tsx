import { useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useCity } from "../store/city";
import { Pill } from "./Pill";

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
              style={cityMaxWidth ? { maxWidth: cityMaxWidth } : undefined}
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
              <Text className="ml-1 font-hk-bold text-[18px] text-ink-3">▾</Text>
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
          {cities.map((c) => (
            <Pill
              key={c}
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
