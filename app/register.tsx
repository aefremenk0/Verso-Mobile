import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedChip } from "../src/components/AnimatedChip";
import { Brand } from "../src/components/Brand";
import { Button } from "../src/components/Button";
import {
  KeyboardDoneBar,
  KEYBOARD_DONE_ID,
} from "../src/components/KeyboardDoneBar";
import { AppleLogo, GoogleLogo } from "../src/components/Logos";
import { ambienteOptions } from "../src/lib/mapFilter";
import { useAuth } from "../src/store/auth";
import { useInterests } from "../src/store/interests";
import { useT, useLang } from "../src/lib/i18n";

// Screen 01 — Sign up / Sign in.
// Email + password go through real Supabase Auth (src/store/auth). Apple/Google
// stay UI-only placeholders (guest entry). Every success leads to the feed.

export default function Register() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { interests, toggle, max } = useInterests();
  const { signUp, signIn } = useAuth();
  const t = useT();
  const lang = useLang();

  // Replace the screen with the feed so Back doesn't lead here again.
  const enter = () => router.replace("/(tabs)/feed");

  // Email + password submit: create the account or sign in via Supabase.
  const submit = async () => {
    if (busy) return;
    setError(null);
    const mail = email.trim();
    if (!mail || !password) {
      setError(t("Enter email and password.", "E-Mail und Passwort eingeben."));
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError(
        t(
          "Password needs at least 6 characters.",
          "Das Passwort braucht mindestens 6 Zeichen.",
        ),
      );
      return;
    }
    setBusy(true);
    const { error: err } =
      mode === "register" ? await signUp(mail, password) : await signIn(mail, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    enter();
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: back + wordmark */}
      <View className="flex-row items-center px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Brand size={24} />
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-8 font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          {t("ACCOUNT", "KONTO")}
        </Text>
        <Text className="mt-2 font-hk-extrabold text-title-lg text-ink">
          {t("Almost in.", "Fast drin.")}
        </Text>
        <Text className="mt-3 font-hk-medium text-[15px] leading-[21px] text-ink-2">
          {t(
            "So Verso remembers what you like — and saves your weekly gem for you.",
            "Damit Verso sich merkt, was dir gefällt — und dir den Wochentipp aufhebt.",
          )}
        </Text>

        {/* Onboarding personalization: pick a vibe (only when signing up).
            Gently tunes the feed (matching spots toward the top). */}
        {mode === "register" ? (
          <View className="mt-6">
            <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
              {t("YOUR VIBE", "DEIN VIBE")}
            </Text>
            <Text className="mt-1.5 font-hk-medium text-[13px] leading-[18px] text-ink-2">
              {t(
                `Pick up to ${max} — we'll tune your feed to it. (Optional)`,
                `Wähle bis zu ${max} — wir stimmen deinen Feed darauf ab. (Optional)`,
              )}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {ambienteOptions(lang).map((a) => {
                const on = interests.includes(a.name);
                return (
                  <AnimatedChip
                    key={a.name}
                    active={on}
                    onPress={() => toggle(a.name)}
                    activeBg="#FFE500"
                    inactiveBg="#FFFFFF"
                    activeBorder="#FFE500"
                    inactiveBorder="rgba(0,0,0,0.18)"
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      paddingHorizontal: 15,
                      paddingVertical: 9,
                    }}
                  >
                    <Text
                      className="font-hk-semibold text-[13px]"
                      style={{ color: on ? "#1A1A1A" : "#6E6A63" }}
                    >
                      {a.label}
                    </Text>
                  </AnimatedChip>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Segmented Toggle */}
        <View className="mt-6 flex-row rounded-pill bg-chip p-1">
          {(["register", "login"] as const).map((m) => {
            const active = m === mode;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 items-center rounded-pill py-2.5 ${
                  active ? "bg-surface" : ""
                }`}
              >
                <Text
                  className={`font-hk-semibold text-[14px] ${
                    active ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {m === "register"
                    ? t("Sign up", "Registrieren")
                    : t("Sign in", "Anmelden")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Social login (UI only). Custom buttons with real logos. */}
        <View className="mt-5 gap-2.5">
          <Pressable
            onPress={enter}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] bg-night py-4"
          >
            <Text className="font-hk-semibold text-[14px] text-screen">
              {t("Continue with Apple", "Weiter mit Apple")}
            </Text>
            <AppleLogo size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={enter}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] bg-surface py-4"
            style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.16)" }}
          >
            <Text className="font-hk-semibold text-[14px] text-ink">
              {t("Continue with Google", "Weiter mit Google")}
            </Text>
            <GoogleLogo size={18} />
          </Pressable>
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-black/10" />
          <Text className="mx-3 font-hk-semibold text-[11px] tracking-[1.5px] text-ink-3">
            {t("OR WITH EMAIL", "ODER MIT E-MAIL")}
          </Text>
          <View className="h-px flex-1 bg-black/10" />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("Your email address", "Deine E-Mail-Adresse")}
          placeholderTextColor="#8A857C"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="rounded-button bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
          style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t("Password", "Passwort")}
          placeholderTextColor="#8A857C"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === "register" ? "new-password" : "password"}
          className="mt-2.5 rounded-button bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
          style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
          inputAccessoryViewID={KEYBOARD_DONE_ID}
          onSubmitEditing={submit}
          returnKeyType={mode === "register" ? "done" : "go"}
        />

        {/* Error message (invalid credentials, email in use, …) */}
        {error ? (
          <Text className="mt-3 font-hk-medium text-[13px] leading-[18px] text-[#C0392B]">
            {error}
          </Text>
        ) : null}

        <View className="mt-5">
          <Button
            label={
              busy
                ? t("Please wait …", "Bitte warten …")
                : mode === "register"
                  ? t("Create account", "Konto erstellen")
                  : t("Sign in", "Anmelden")
            }
            variant="accent"
            trailing="arrow"
            onPress={submit}
          />
        </View>

        <Text className="mt-6 text-center font-hk-medium text-[12px] leading-[18px] text-ink-3">
          {t("By signing up you accept our", "Mit der Registrierung akzeptierst du")}{" "}
          <Text className="font-hk-semibold text-ink-2 underline">
            {t("Terms", "Bedingungen")}
          </Text>{" "}
          &{" "}
          <Text className="font-hk-semibold text-ink-2 underline">
            {t("Privacy Policy", "Datenschutz")}
          </Text>
          .
        </Text>
      </ScrollView>

      {/* "Done" bar above the keyboard (iOS) for the email field */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
