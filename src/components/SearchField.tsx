import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
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
  placeholder = "Search …",
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View
      className="flex-row items-center rounded-pill bg-chip px-4"
      style={{ height: 44 }}
    >
      <SearchGlyph />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A857C"
        className="ml-2.5 flex-1 font-hk-medium text-[15px] text-ink"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search places"
        inputAccessoryViewID={KEYBOARD_DONE_ID}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel="Clear search"
          className="ml-2 h-6 w-6 items-center justify-center rounded-pill"
          style={{ backgroundColor: "rgba(26,26,26,0.12)" }}
        >
          <Text className="font-hk-bold text-[12px] text-ink">✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
