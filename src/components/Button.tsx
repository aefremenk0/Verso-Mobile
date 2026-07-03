import { Pressable, Text, View } from "react-native";

// Reusable button in the three mockup variants.
//  - "accent": yellow (primary CTA, e.g. "Create account", "Reserve a table")
//  - "dark":   dark (e.g. "Let's go", "Show 18 places")
//  - "light":  white with a border (e.g. "Continue with Google")

type Variant = "accent" | "dark" | "light";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Small caps subtitle bottom/right, e.g. "VIA OPENTABLE". */
  subtitle?: string;
  /** Trailing arrow icon ("→") or external ("↗"). */
  trailing?: "arrow" | "external" | null;
  /** Optional leading symbol (e.g. Apple/Google) on the left. */
  leading?: string;
}

const STYLE: Record<Variant, { box: string; text: string }> = {
  accent: { box: "bg-accent", text: "text-accent-ink" },
  dark: { box: "bg-night", text: "text-white" },
  light: { box: "bg-surface border border-line/10", text: "text-ink" },
};

export function Button({
  label,
  onPress,
  variant = "accent",
  subtitle,
  trailing = null,
  leading,
}: ButtonProps) {
  const s = STYLE[variant];
  const trailingGlyph =
    trailing === "arrow" ? "→" : trailing === "external" ? "↗" : null;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center rounded-button px-5 py-4 ${s.box}`}
          style={{ opacity: pressed ? 0.85 : 1 }}
        >
          {leading ? (
            <Text className={`mr-2 font-hk-bold text-[16px] ${s.text}`}>{leading}</Text>
          ) : null}

          <View className="flex-1 items-center">
            <Text className={`font-hk-bold text-[16px] ${s.text}`}>{label}</Text>
            {subtitle ? (
              <Text
                className={`mt-0.5 font-hk-semibold text-[10px] tracking-[1px] ${s.text} opacity-60`}
              >
                {subtitle.toUpperCase()}
              </Text>
            ) : null}
          </View>

          {trailingGlyph ? (
            <Text className={`ml-2 font-hk-bold text-[18px] ${s.text}`}>
              {trailingGlyph}
            </Text>
          ) : (
            // Placeholder so the label block stays centered when there is a leading icon
            leading && <View style={{ width: 22 }} />
          )}
        </View>
      )}
    </Pressable>
  );
}
