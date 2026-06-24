import { View } from "react-native";
import { ListMapToggle } from "./ListMapToggle";
import { SceneToggle } from "./SceneToggle";

// Kopfzeile direkt unter dem Notch (Feed + Karte):
//  - Liste/Karte-Umschalter exakt ZENTRIERT (absolut, „in der Mitte").
//  - Szenen-Toggle (Feiern/Essen) rechts.
// Das Stadt-Dropdown sitzt darunter (eigene Zeile) — so überlappt nichts,
// auch nicht bei langen Städtenamen.
export function TopToggles({ active }: { active: "liste" | "karte" }) {
  return (
    <View className="px-6 pt-2">
      <View className="justify-center" style={{ height: 42 }}>
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }}
        >
          <ListMapToggle active={active} />
        </View>
        <View className="flex-row justify-end">
          <SceneToggle />
        </View>
      </View>
    </View>
  );
}
