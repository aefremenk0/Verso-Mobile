import { Pressable, Text, View } from "react-native";

// Wiederverwendbarer Button in den drei Mockup-Varianten.
//  - "accent": gelb (Haupt-CTA, z. B. "Konto erstellen", "Tisch reservieren")
//  - "dark":   dunkel (z. B. "Los geht's", "18 Orte zeigen")
//  - "light":  weiß mit Rahmen (z. B. "Weiter mit Google")

type Variant = "accent" | "dark" | "light";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Kleines Caps-Subtitle rechts/unten, z. B. "ÜBER OPENTABLE". */
  subtitle?: string;
  /** Pfeil-Icon rechts ("→") oder externes ("↗"). */
  trailing?: "arrow" | "external" | null;
  /** Optionales Lead-Symbol (z. B. Apple/Google) links. */
  leading?: string;
}

const STYLE: Record<Variant, { box: string; text: string }> = {
  accent: { box: "bg-accent", text: "text-accent-ink" },
  dark: { box: "bg-night", text: "text-white" },
  light: { box: "bg-surface border border-black/10", text: "text-ink" },
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
            // Platzhalter, damit der Label-Block bei führendem Icon zentriert bleibt
            leading && <View style={{ width: 22 }} />
          )}
        </View>
      )}
    </Pressable>
  );
}
