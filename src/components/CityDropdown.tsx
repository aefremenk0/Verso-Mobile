import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCity } from "../store/city";
import { Pill } from "./Pill";

// Einheitlicher Stadt-Kopf mit Dropdown — identisch auf Feed, Viertel und Karte.
// Zeigt "Wien ▾" und klappt eine horizontale Reihe wählbarer Städte aus.
// Über `right` kann rechts ein Element gesetzt werden (z. B. Avatar, Toggle).

export function CityDropdown({ right }: { right?: ReactNode }) {
  const { city, setCity, cities } = useCity();
  const [open, setOpen] = useState(false);

  return (
    <View>
      {/* Feste Zeilenhöhe -> "Wien" sitzt auf jeder Seite gleich, egal ob
          rechts ein Element (Avatar/Toggle) steht oder nicht. */}
      <View className="px-6 pt-2">
        <View
          className="flex-row items-center justify-between"
          style={{ height: 42 }}
        >
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
