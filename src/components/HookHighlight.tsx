import { Text } from "react-native";

// The editorial italic hook, with a yellow background ("highlighter" look).
//
// In HTML the mockup uses `box-decoration-break: clone`, so each line gets its
// own yellow block. React Native Text cannot do that per line, so we give the
// whole hook a yellow background – visually very close.

interface HookHighlightProps {
  children: string;
  size?: number;
}

export function HookHighlight({ children, size = 17 }: HookHighlightProps) {
  return (
    <Text
      className="self-start font-hk-extrabold-italic text-ink"
      style={{
        fontSize: size,
        lineHeight: size * 1.5,
        backgroundColor: "#FFE500",
        // Padding + rounding like in the mockup (padding 3×8, radius 8)
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {children}
    </Text>
  );
}
