import { Text } from "react-native";

// Der editoriale italic-Hook, gelb hinterlegt ("Marker"-Optik).
//
// Im HTML nutzt das Mockup `box-decoration-break: clone`, damit jede Zeile
// ihren eigenen gelben Block bekommt. React-Native-Text kann das nicht
// per Zeile, also hinterlegen wir den ganzen Hook gelb – optisch sehr nah dran.

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
        // Innenabstände + Rundung wie im Mockup (padding 3×8, radius 8)
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
