import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useT } from "../lib/i18n";
import { MAX_CHROME_SCALE } from "../lib/fontScale";
import { KEYBOARD_DONE_ID } from "./KeyboardDoneBar";

// Slim search field in the Verso style (pill, soft shape). Reusable —
// currently in the feed, later usable in Saved/Areas too.
// SVG magnifier instead of an emoji, to fit the editorial tone.

function SearchGlyph({ size = 18, color = "#8A857C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={10.5} cy={10.5} r={6.5} stroke={color} strokeWidth={2} fill="none" />
      <Line
        x1={15.5}
        y1={15.5}
        x2={21}
        y2={21}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  const t = useT();
  const ph = placeholder ?? t("Search …", "Suchen …");
  return (
    <View
      className="flex-row items-center rounded-pill bg-chip px-4"
      style={{ height: 44 }}
    >
      <SearchGlyph />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={ph}
        placeholderTextColor="#8A857C"
        maxFontSizeMultiplier={MAX_CHROME_SCALE}
        className="ml-2.5 flex-1 font-hk-medium text-[15px] text-ink"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={t("Search places", "Orte durchsuchen")}
        inputAccessoryViewID={KEYBOARD_DONE_ID}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel={t("Clear search", "Suche löschen")}
          className="ml-2 h-6 w-6 items-center justify-center rounded-pill bg-line/[0.12]"
        >
          <Text maxFontSizeMultiplier={MAX_CHROME_SCALE} className="font-hk-bold text-[12px] text-ink">
            ✕
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
