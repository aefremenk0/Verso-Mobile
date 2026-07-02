import { Image } from "expo-image";
import { Text, View } from "react-native";
import { initialsFromName } from "../lib/initials";
import { useProfile } from "../store/profile";

interface InitialsAvatarProps {
  size?: number; // diameter of the circle
  textSize?: number; // font size of the initials
  focused?: boolean; // in the nav: active tab -> text on yellow
}

// Round avatar: the user's uploaded photo if set, otherwise their initials.
// One source for two spots: feed header (large) and bottom nav (small).
export function InitialsAvatar({
  size = 38,
  textSize = 13,
  focused = false,
}: InitialsAvatarProps) {
  const { name, avatarUrl } = useProfile();
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-pill"
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: focused ? "rgba(26,26,26,0.35)" : "rgba(26,26,26,0.18)",
      }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <Text
          className={`font-hk-extrabold ${focused ? "text-accent-ink" : "text-ink"}`}
          style={{ fontSize: textSize }}
        >
          {initialsFromName(name)}
        </Text>
      )}
    </View>
  );
}
