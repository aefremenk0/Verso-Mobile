import { Text, View } from "react-native";

// The "verso" wordmark: lowercase, italic, weight 800.
// Three variants like in the mockup: plain, yellow highlight, with a dot.

type Variant = "plain" | "highlight" | "dot";

interface BrandProps {
  size?: number;
  color?: string; // text color (only relevant for plain/dot)
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
