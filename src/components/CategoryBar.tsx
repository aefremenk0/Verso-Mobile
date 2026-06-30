import { ScrollView } from "react-native";
import type { Category } from "../data/types";
import { useLang } from "../lib/i18n";
import { PIN_COLORS } from "../lib/pinColors";
import { sceneFilters } from "../lib/scene";
import { useScene } from "../store/scene";
import { Pill } from "./Pill";

// Scene-dependent category bar (pills: All · Bar · Club · …).
// **Transparent background** — meant as a floating overlay bar through which the
// content behind it (feed cards / map) stays visible. Only the pills (ovals)
// are visible; the bar itself is transparent.
export function CategoryBar({
  active,
  onSelect,
}: {
  active: Category | null;
  onSelect: (c: Category | null) => void;
}) {
  const { scene } = useScene();
  const lang = useLang();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingVertical: 8 }}
    >
      {sceneFilters(scene, lang).map((f) => {
        const col = f.key ? PIN_COLORS[f.key] : null;
        return (
          <Pill
            key={f.label}
            label={f.label}
            active={active === f.key}
            onPress={() => onSelect(f.key)}
            activeColor={col?.oval}
            activeTextColor={col?.inner}
          />
        );
      })}
    </ScrollView>
  );
}
