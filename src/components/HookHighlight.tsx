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
        lineHeight: size * 1.35,
        backgroundColor: "#FFE500",
        // kleine Innenabstände, damit das Gelb den Text "umarmt"
        paddingHorizontal: 4,
        paddingVertical: 1,
      }}
    >
      {children}
    </Text>
  );
}
