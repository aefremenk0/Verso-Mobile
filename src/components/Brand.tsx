import { Text, View } from "react-native";

// Die Wortmarke "verso": kleingeschrieben, italic, weight 800.
// Drei Varianten wie im Mockup: pur, gelbes Highlight, mit Punkt.

type Variant = "plain" | "highlight" | "dot";

interface BrandProps {
  size?: number;
  color?: string; // Textfarbe (nur bei plain/dot relevant)
  variant?: Variant;
}

export function Brand({ size = 30, color = "#1A1A1A", variant = "plain" }: BrandProps) {
  const text = (
    <Text
      style={{ fontSize: size, lineHeight: size * 1.1, color }}
      className="font-hk-extrabold-italic"
    >
      verso
    </Text>
  );

  if (variant === "highlight") {
    return (
      <View className="self-start rounded-button bg-accent px-3 py-1">
        <Text
          style={{ fontSize: size, lineHeight: size * 1.1, color: "#1A1A1A" }}
          className="font-hk-extrabold-italic"
        >
          verso
        </Text>
      </View>
    );
  }

  if (variant === "dot") {
    return (
      <View className="flex-row items-end">
        {text}
        <View
          className="mb-1 ml-1 rounded-pill bg-accent"
          style={{ width: size * 0.18, height: size * 0.18 }}
        />
      </View>
    );
  }

  return text;
}
