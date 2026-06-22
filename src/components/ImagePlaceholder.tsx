import { Text, View, type ViewStyle } from "react-native";
import type { PlaceholderTone } from "../data/types";
import { StripeTexture } from "./StripeTexture";

// Dunkler Bild-Platzhalter mit diagonalem Streifen-Overlay.
//
// Im HTML-Mockup ist das ein `repeating-linear-gradient`. In React Native
// gibt es das nicht direkt, also bauen wir die Textur aus mehreren dünnen,
// gedrehten Balken nach – subtil, genau wie im Design.

const TONE_BG: Record<PlaceholderTone, string> = {
  brown: "#2A211C",
  green: "#1F2A1F",
  charcoal: "#231F1A",
};

interface ImagePlaceholderProps {
  tone?: PlaceholderTone;
  /** Höhe der Fläche. */
  height?: number;
  /** Eckenradius (Karte 24 / Sheet 30 / Hero 0). */
  radius?: number;
  /** Optionale Maschinen-Notiz unten links ("// kerzenlicht, sechs hocker"). */
  note?: string;
  /** Overlays (Badge, Buttons) werden als Kinder über das Bild gelegt. */
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function ImagePlaceholder({
  tone = "charcoal",
  height = 180,
  radius = 24,
  note,
  children,
  style,
}: ImagePlaceholderProps) {
  return (
    <View
      style={[{ height, borderRadius: radius, backgroundColor: TONE_BG[tone] }, style]}
      className="overflow-hidden"
    >
      {/* Diagonale Streifen-Textur (dekorativ, leicht aufgehellt). */}
      <StripeTexture />

      {note ? (
        <Text className="absolute bottom-3 left-4 font-hk-medium-italic text-[12px] text-white/45">
          {note}
        </Text>
      ) : null}

      {children}
    </View>
  );
}
