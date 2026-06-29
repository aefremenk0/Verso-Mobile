import { Text, View } from "react-native";
import { MOCK_USER } from "../data/user";

// Initials from the name, e.g. "Lena Hofer" -> "LH".
export const INITIALS = MOCK_USER.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

interface InitialsAvatarProps {
  size?: number; // diameter of the circle
  textSize?: number; // font size of the initials
  focused?: boolean; // in the nav: active tab -> text on yellow
}

// Round avatar with the user's initials.
// One source for two spots: feed header (large) and bottom nav (small).
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
