import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
            >
              <Text className="font-hk-extrabold text-title-md text-ink">{city}</Text>
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
