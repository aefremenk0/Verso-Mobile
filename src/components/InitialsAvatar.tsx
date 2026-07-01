import { Text, View } from "react-native";
import { initialsFromName } from "../lib/initials";
import { useProfile } from "../store/profile";

interface InitialsAvatarProps {
  size?: number; // diameter of the circle
  textSize?: number; // font size of the initials
  focused?: boolean; // in the nav: active tab -> text on yellow
}

// Round avatar with the signed-in user's initials (from their profile name).
// One source for two spots: feed header (large) and bottom nav (small).
export function InitialsAvatar({
  size = 38,
  textSize = 13,
  focused = false,
}: InitialsAvatarProps) {
  const { name } = useProfile();
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
        {initialsFromName(name)}
      </Text>
    </View>
  );
}
