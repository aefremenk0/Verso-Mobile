import Svg, { Path } from "react-native-svg";

// Breiter Rechtspfeil (Breite:Höhe ~2:1) — bewusst flacher/breiter als der
// schmale „→"-Glyph. Für Listen-Zeilen (Viertel) und Profil.
export function Arrow({
  width = 22,
  color = "#1A1A1A",
  strokeWidth = 2.4,
}: {
  width?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const height = width * 0.5; // 2:1
  return (
    <Svg width={width} height={height} viewBox="0 0 24 12" fill="none">
      <Path
        d="M2 6 H21 M15 1.5 L21.5 6 L15 10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
