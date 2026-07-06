import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardDoneBar,
  KEYBOARD_DONE_ID,
} from "../src/components/KeyboardDoneBar";
import { useT, useLang } from "../src/lib/i18n";
import { friendlyAuthError } from "../src/lib/errors";
import { useAuth } from "../src/store/auth";

// Screen 07d — Change password. Updates the signed-in user's password via
// Supabase; "Forgot password?" sends a reset email.

// Password input field, optionally with a "show" toggle.
function PwField({
  label,
  value,
  onChangeText,
  showToggle,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const t = useT();
  return (
    <View>
      <Text className="mb-1.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
        {label}
      </Text>
      <View
        className="flex-row items-center justify-between rounded-[14px] border border-line/20 bg-surface px-4"
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="••••••••"
          placeholderTextColor="#8A857C"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
          className="flex-1 py-3.5 font-hk-medium text-[16px] text-ink"
        />
        {showToggle ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Text className="font-hk-semibold text-[11px] tracking-[0.5px] text-ink-3">
              {visible ? t("HIDE", "VERBERGEN") : t("SHOW", "ZEIGEN")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function PasswortAendern() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { user, updatePassword, resetPassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onUpdate = async () => {
    if (busy) return;
    setMsg(null);
    if (next.length < 8) {
      setMsg({
        ok: false,
        text: t(
          "Password needs at least 8 characters.",
          "Das Passwort braucht mindestens 8 Zeichen.",
        ),
      });
      return;
    }
    if (next !== confirm) {
      setMsg({
        ok: false,
        text: t("Passwords don't match.", "Passwörter stimmen nicht überein."),
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
      text: t("Password updated.", "Passwort aktualisiert."),
    });
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const onForgot = async () => {
    if (busy) return;
    setMsg(null);
    if (!user?.email) {
      setMsg({
        ok: false,
        text: t("No email on this account.", "Keine E-Mail für dieses Konto."),
      });
      return;
    }
    setBusy(true);
    const { error } = await resetPassword(user.email);
    setBusy(false);
    setMsg(
      error
        ? { ok: false, text: friendlyAuthError(error, lang) }
        : {
            ok: true,
            text: t(
              "Reset link sent to your email.",
              "Reset-Link an deine E-Mail gesendet.",
            ),
          },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[28px] text-ink">{t("Change password", "Passwort ändern")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3.5">
          <PwField
            label={t("CURRENT PASSWORD", "AKTUELLES PASSWORT")}
            value={current}
            onChangeText={setCurrent}
            showToggle
          />
          <PwField
            label={t("NEW PASSWORD", "NEUES PASSWORT")}
            value={next}
            onChangeText={setNext}
          />
          <PwField
            label={t("CONFIRM NEW PASSWORD", "NEUES PASSWORT BESTÄTIGEN")}
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <Text className="mt-3.5 font-hk-medium text-[12px] leading-[18px] text-ink-2">
          {t(
            "At least 8 characters, including a number and a special character.",
            "Mindestens 8 Zeichen, davon eine Zahl und ein Sonderzeichen.",
          )}
        </Text>
        <Pressable onPress={onForgot} disabled={busy} className="mt-4 self-start">
          <Text className="font-hk-semibold text-[12px] text-ink underline">
            {t("Forgot password?", "Passwort vergessen?")}
          </Text>
        </Pressable>

        {msg ? (
          <Text
            className="mt-3 font-hk-medium text-[13px] leading-[18px]"
            style={{ color: msg.ok ? "#1E9E54" : "#C0392B" }}
          >
            {msg.text}
          </Text>
        ) : null}

        {/* Update (at the bottom) */}
        <View className="flex-1" />
        <Pressable
          onPress={onUpdate}
          disabled={busy}
          className="mt-8 items-center rounded-[16px] bg-accent py-4"
          style={{ opacity: busy ? 0.7 : 1 }}
        >
          <Text className="font-hk-extrabold text-[17px] text-accent-ink">
            {busy
              ? t("Please wait …", "Bitte warten …")
              : t("Update password", "Passwort aktualisieren")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* "Done" bar above the keyboard (iOS) for the password fields */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
