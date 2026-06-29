import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { shadows } from "../theme";
import { GoogleLogo } from "./Logos";

// Bottom sheet for "exporting" the saved places to Google Maps.
// Note: Google Maps has NO public API to write places into a user list — a real
// export would need a backend + OAuth. In the MVP this is (like the login) a
// MOCK flow: "Link account" -> success view.
// The target list is called "?" (fitting the insider tone).

export function GoogleExportSheet({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);

  return (
    <View className="absolute inset-0 justify-end" style={{ zIndex: 20 }}>
      {/* Dimmed background — tap to close */}
      <Pressable onPress={onClose} className="absolute inset-0 bg-night/50" />

      <View className="rounded-t-sheet bg-screen px-6 pb-10 pt-6" style={shadows.card}>
        {done ? (
          <>
            <Text className="font-hk-extrabold text-[24px] text-ink">
              Exported ✓
            </Text>
            <Text className="mt-2 font-hk-medium text-[14px] leading-[20px] text-ink-2">
              {count} {count === 1 ? "place is" : "places are"} now in your
              Google Maps list "?". Open Google Maps → Saved → "?".
            </Text>
            <Pressable
              onPress={onClose}
              className="mt-6 items-center rounded-[18px] bg-night py-4"
            >
              <Text className="font-hk-extrabold text-[16px] text-screen">Done</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-2">
              <GoogleLogo size={20} />
              <Text className="font-hk-extrabold text-[22px] text-ink">
                To Google Maps
              </Text>
            </View>
            <Text className="mt-2 font-hk-medium text-[14px] leading-[20px] text-ink-2">
              Link your Google account to export your {count} saved places to
              Google Maps as a list called "?".
            </Text>
            <Pressable
              onPress={() => setDone(true)}
              className="mt-6 flex-row items-center justify-center gap-2 rounded-[18px] bg-night py-4"
            >
              <GoogleLogo size={18} />
              <Text className="font-hk-extrabold text-[15px] text-screen">
                Link account & export
              </Text>
            </Pressable>
            <Pressable onPress={onClose} className="mt-3 items-center py-2">
              <Text className="font-hk-semibold text-[14px] text-ink-3">
                Cancel
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
