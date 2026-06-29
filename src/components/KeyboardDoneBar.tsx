import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

// Shared ID: TextInputs point to this bar via `inputAccessoryViewID`.
export const KEYBOARD_DONE_ID = "verso-kb-done";

// "Done" bar above the iOS keyboard — a button that retracts the keyboard
// (`Keyboard.dismiss`). iOS-only via `InputAccessoryView`; on Android nothing
// renders (there the system back button closes the keyboard).
// Render ONCE per screen; all text fields on the screen share the ID.
export function KeyboardDoneBar() {
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View
        className="flex-row justify-end bg-chip px-4 py-2"
        style={{ borderTopWidth: 1, borderTopColor: "rgba(26,26,26,0.1)" }}
      >
        <Pressable
          onPress={() => Keyboard.dismiss()}
          hitSlop={8}
          accessibilityLabel="Close keyboard"
        >
          <Text className="font-hk-bold text-[15px] text-ink">Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
