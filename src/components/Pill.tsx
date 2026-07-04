import { Pressable, Text, View } from "react-native";
import { tapSelection } from "../lib/haptics";
import { MAX_CHROME_SCALE } from "../lib/fontScale";
import { useAppearance } from "../store/appearance";
import { AnimatedChip } from "./AnimatedChip";

// Pill / chip. Two uses:
//  - interactive (filter): `onPress` + `active` -> animated selection (AnimatedChip)
//  - static (tag): only `label`

interface PillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Smaller variant for tags in the detail view. */
  small?: boolean;
  /** Active background (e.g. category color) instead of the default yellow. */
  activeColor?: string;
  /** Active text color matching activeColor. */
  activeTextColor?: string;
}

export function Pill({
  label,
  active = false,
  onPress,
  small = false,
  activeColor,
  activeTextColor,
}: PillProps) {
  const { isDark } = useAppearance();
  const padding = small ? "px-3 py-1.5" : "px-4 py-2";
  const textSize = small ? "text-[13px]" : "text-[14px]";
  const customActive = active && !!activeColor;

  // Static tag (no onPress) — without animation.
  if (!onPress) {
    return (
      <View
        className={`rounded-pill ${padding} ${
          active ? (customActive ? "" : "bg-accent") : "bg-chip"
        }`}
        style={customActive ? { backgroundColor: activeColor } : undefined}
      >
        <Text
          maxFontSizeMultiplier={MAX_CHROME_SCALE}
          className={`font-hk-semibold ${textSize} ${
            active ? (customActive ? "" : "text-accent-ink") : "text-ink-2"
          }`}
          style={customActive ? { color: activeTextColor ?? "#FFFFFF" } : undefined}
        >
          {label}
        </Text>
      </View>
    );
  }

  // Interactive: pop + press + color crossfade (AnimatedChip) + selection haptic.
  const activeBg = customActive ? (activeColor as string) : "#FFE500";
  // Dark mode: the inactive cream (#EDE9E1) would read oddly; use a clean white
  // oval with black text (unselected hotbar chips). Light mode unchanged.
  const inactiveBg = isDark ? "#FFFFFF" : "#EDE9E1";
  const handlePress = () => {
    tapSelection(); // subtle "tick" on every chip selection
    onPress();
  };
  // Text color: custom-active uses its own; on any yellow/white chip the text is
  // dark (text-ink-2 would flip to light in dark mode).
  const inactiveTextColor = isDark ? "#1A1A1A" : undefined; // undefined -> text-ink-2
  // Fixed line height so a chip with a leading emoji (e.g. "🍽  Restaurant") is
  // the SAME height as the icon-less "All/Alle" chip (emoji glyphs are taller
  // than Latin text and would otherwise inflate the pill).
  const lineHeight = small ? 17 : 18;
  const colorStyle =
    customActive && active
      ? { color: activeTextColor ?? "#FFFFFF" }
      : !active && inactiveTextColor
        ? { color: inactiveTextColor }
        : null;
  return (
    <AnimatedChip
      active={active}
      onPress={handlePress}
      activeBg={activeBg}
      inactiveBg={inactiveBg}
      style={{
        borderRadius: 999,
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 6 : 8,
      }}
    >
      <Text
        maxFontSizeMultiplier={MAX_CHROME_SCALE}
        className={`font-hk-semibold ${textSize} ${
          active ? (customActive ? "" : "text-accent-ink") : inactiveTextColor ? "" : "text-ink-2"
        }`}
        style={{ lineHeight, ...(colorStyle ?? {}) }}
      >
        {label}
      </Text>
    </AnimatedChip>
  );
}
