import { Image } from "expo-image";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { PlaceholderTone } from "../data/types";
import { StripeTexture } from "./StripeTexture";

// Dark image placeholder with a diagonal stripe overlay.
//
// In the HTML mockup this is a `repeating-linear-gradient`. React Native has
// no direct equivalent, so we recreate the texture from several thin, rotated
// bars – subtle, exactly like in the design.

const TONE_BG: Record<PlaceholderTone, string> = {
  brown: "#2A211C",
  green: "#1F2A1F",
  charcoal: "#231F1A",
};

interface ImagePlaceholderProps {
  tone?: PlaceholderTone;
  /** Height of the area. */
  height?: number;
  /** Corner radius (card 24 / sheet 30 / hero 0). */
  radius?: number;
  /** Optional machine-style note bottom-left ("// candlelight, six stools"). */
  note?: string;
  /** Real photo URL. When set, the photo (cover) replaces the placeholder. */
  uri?: string;
  /** Overlays (badge, buttons) are placed over the image as children. */
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function ImagePlaceholder({
  tone = "charcoal",
  height = 180,
  radius = 24,
  note,
  uri,
  children,
  style,
}: ImagePlaceholderProps) {
  return (
    <View
      style={[{ height, borderRadius: radius, backgroundColor: TONE_BG[tone] }, style]}
      className="overflow-hidden"
    >
      {uri ? (
        // Real photo (tone stays as the loading background). expo-image caches.
        <Image
          source={uri}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
      ) : (
        // Diagonal stripe texture (decorative, slightly lightened).
        <StripeTexture />
      )}

      {/* The "//" note only makes sense on the placeholder, not over a real photo. */}
      {note && !uri ? (
        <Text className="absolute bottom-3 left-4 font-hk-medium-italic text-[12px] text-white/45">
          {note}
        </Text>
      ) : null}

      {children}
    </View>
  );
}
