import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

// Gemeinsame ID: TextInputs zeigen per `inputAccessoryViewID` auf diese Leiste.
export const KEYBOARD_DONE_ID = "verso-kb-done";

// „Fertig"-Leiste über der iOS-Tastatur — ein Button, der die Tastatur wieder
// einzieht (`Keyboard.dismiss`). iOS-only via `InputAccessoryView`; auf Android
// rendert nichts (dort schließt die System-Zurück-Taste die Tastatur).
// Pro Screen EINMAL rendern; alle Textfelder des Screens teilen sich die ID.
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
          accessibilityLabel="Tastatur schließen"
        >
          <Text className="font-hk-bold text-[15px] text-ink">Fertig</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
