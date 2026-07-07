import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from "../src/components/KeyboardDoneBar";
import { PasswordHints } from "../src/components/PasswordHints";
import { friendlyAuthError } from "../src/lib/errors";
import { isStrongPassword } from "../src/lib/password";
import { useT, useLang } from "../src/lib/i18n";
import { useAuth } from "../src/store/auth";

// Set-a-new-password screen. Reached after tapping the reset link in the email:
// the deep link establishes a short-lived recovery session (see auth.tsx), then
// PASSWORD_RECOVERY routes here. We just need the new password (no current one).

export default function ResetPassword() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { updatePassword, session } = useAuth();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    if (busy) return;
    if (!isStrongPassword(next)) {
      setMsg({
        ok: false,
        text: t(
          "Password: min. 8 characters, with an upper- and lowercase letter and a digit.",
          "Passwort: mind. 8 Zeichen, mit Groß- und Kleinbuchstabe und einer Ziffer.",
        ),
      });
      return;
    }
    if (next !== confirm) {
      setMsg({
        ok: false,
        text: t("The passwords don't match.", "Die Passwörter stimmen nicht überein."),
      });
      return;
    }
    setBusy(true);
    const { error } = await updatePassword(next);
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: friendlyAuthError(error, lang) });
      return;
    }
    setMsg({
      ok: true,
      text: t("Password updated. You're all set.", "Passwort aktualisiert. Alles bereit."),
    });
    // Signed in via the recovery session -> go to the feed; otherwise to welcome.
    setTimeout(() => router.replace(session ? "/(tabs)/feed" : "/"), 700);
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      <View className="flex-1 px-6 pt-8">
        <Text
          className="font-hk-extrabold text-title-lg text-ink"
          style={{ lineHeight: 40, includeFontPadding: false }}
        >
          {t("New password", "Neues Passwort")}
        </Text>
        <Text className="mt-2 font-hk-medium text-[14px] leading-[21px] text-ink-2">
          {t(
            "Pick a new password for your Verso account.",
            "Wähle ein neues Passwort für dein Verso-Konto.",
          )}
        </Text>

        <TextInput
          value={next}
          onChangeText={setNext}
          placeholder={t("New password", "Neues Passwort")}
          placeholderTextColor="#8A857C"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
          className="mt-6 rounded-button border border-line/20 bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
        />
        <PasswordHints password={next} />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t("Repeat password", "Passwort wiederholen")}
          placeholderTextColor="#8A857C"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
          onSubmitEditing={submit}
          returnKeyType="done"
          className="mt-2.5 rounded-button border border-line/20 bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
        />

        {msg ? (
          <Text
            className="mt-3 font-hk-medium text-[13px] leading-[18px]"
            style={{ color: msg.ok ? "#2E7D32" : "#C0392B" }}
          >
            {msg.text}
          </Text>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={busy}
          className="mt-6 items-center rounded-[16px] bg-accent py-4"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-hk-extrabold text-[16px] text-accent-ink">
            {busy ? t("Saving …", "Speichern …") : t("Save password", "Passwort speichern")}
          </Text>
        </Pressable>
      </View>
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
