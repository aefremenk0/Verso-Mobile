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
  // Dark mode: an inactive chip's fixed cream (#EDE9E1) reads as a white oval on
  // the black page. Make inactive chips yellow with black text instead, so they
  // stay visible and on-brand. Light mode is unchanged.
  const inactiveBg = isDark ? "#FFE500" : "#EDE9E1";
  const handlePress = () => {
    tapSelection(); // subtle "tick" on every chip selection
    onPress();
  };
  // Text color: custom-active uses its own; else on any yellow/cream chip the
  // text must be dark (text-ink-2 would flip to light in dark mode).
  const inactiveTextColor = isDark ? "#1A1A1A" : undefined; // undefined -> text-ink-2
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
        style={
          customActive && active
            ? { color: activeTextColor ?? "#FFFFFF" }
            : !active && inactiveTextColor
              ? { color: inactiveTextColor }
              : undefined
        }
      >
        {label}
      </Text>
    </AnimatedChip>
  );
}
