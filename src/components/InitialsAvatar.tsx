import { Text, View } from "react-native";
import { MOCK_USER } from "../data/user";

// Initialen aus dem Namen, z. B. "Lena Hofer" -> "LH".
export const INITIALS = MOCK_USER.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

interface InitialsAvatarProps {
  size?: number; // Durchmesser des Kreises
  textSize?: number; // Schriftgröße der Initialen
  focused?: boolean; // in der Nav: aktiver Reiter -> Text auf Gelb
}

// Runder Avatar mit den Initialen des Nutzers.
// Eine Quelle für zwei Stellen: Feed-Kopf (groß) und Bottom-Nav (klein).
export function InitialsAvatar({
  size = 38,
  textSize = 13,
  focused = false,
}: InitialsAvatarProps) {
  return (
    <View
      className="items-center justify-center rounded-pill"
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: focused ? "rgba(26,26,26,0.35)" : "rgba(26,26,26,0.18)",
      }}
    >
      <Text
        className={`font-hk-extrabold ${focused ? "text-accent-ink" : "text-ink"}`}
        style={{ fontSize: textSize }}
      >
        {INITIALS}
      </Text>
    </View>
  );
}
