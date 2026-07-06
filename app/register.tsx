import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
import { friendlyAuthError } from "../src/lib/errors";
import { track } from "../src/lib/analytics";
import { useAuth, type OAuthProvider } from "../src/store/auth";
import { useInterests } from "../src/store/interests";
import { useProfile } from "../src/store/profile";
import { useT, useLang } from "../src/lib/i18n";

// Screen 01 — Sign up / Sign in.
// Email + password and Google/Apple go through real Supabase Auth
// (src/store/auth). On sign-up the chosen name + username are saved to the
// profile. Every success leads to the feed.

// Fixed demo account for quick testing. The button below signs in with it (and
// creates it on first use if email confirmation is turned off in Supabase).
const DEMO_EMAIL = "demo@verso.app";
const DEMO_PASSWORD = "versodemo";

export default function Register() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [is16, setIs16] = useState(false); // GDPR Art. 8 age gate (register mode)
  const { interests, toggle, max } = useInterests();
  const { signUp, signIn, signInWithProvider, resetPassword } = useAuth();
  const { save: saveProfile } = useProfile();
  const t = useT();
  const lang = useLang();

  // Normalize the username to a handle: strip a leading @, lowercase, no spaces.
  const cleanUsername = (raw: string) =>
    raw.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();

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
    if (mode === "register") {
      if (password.length < 8) {
        setError(
          t(
            "Password needs at least 8 characters.",
            "Das Passwort braucht mindestens 8 Zeichen.",
          ),
        );
        return;
      }
      if (!name.trim()) {
        setError(t("Please enter your name.", "Bitte gib deinen Namen ein."));
        return;
      }
      if (!is16) {
        setError(
          t(
            "Please confirm you're at least 16.",
            "Bitte bestätige, dass du mindestens 16 bist.",
          ),
        );
        return;
      }
    }
    setBusy(true);
    const handle = cleanUsername(username);
    const profileMeta = {
      name: name.trim(),
      username: handle ? `@${handle}` : "",
    };
    const res =
      mode === "register"
        ? await signUp(mail, password, profileMeta)
        : await signIn(mail, password);
    if (res.error) {
      setBusy(false);
      setError(friendlyAuthError(res.error, lang));
      return;
    }
    track(mode === "register" ? "sign_up" : "sign_in", { method: "email" });

    // Email confirmation is ON -> no session yet. Don't enter the app; tell the
    // user to confirm first. Their name/username was passed as sign-up metadata,
    // so the DB trigger sets it on the profile once the account is created.
    if (mode === "register" && "needsConfirmation" in res && res.needsConfirmation) {
      setBusy(false);
      Alert.alert(
        t("Confirm your email", "E-Mail bestätigen"),
        t(
          `We sent a confirmation link to ${mail}. Tap it, then log in.`,
          `Wir haben einen Bestätigungslink an ${mail} geschickt. Tippe ihn an und melde dich dann an.`,
        ),
      );
      setMode("login"); // switch the form to login for when they come back
      setPassword("");
      return;
    }

    // Confirmation OFF -> we have a session immediately. Save name + username
    // (the trigger also sets them from metadata; this is the fast local path).
    if (mode === "register") {
      await saveProfile(profileMeta);
    }
    setBusy(false);
    enter();
  };

  // Send a password-reset email to the entered address.
  const forgot = async () => {
    const mail = email.trim();
    if (!mail) {
      setError(
        t("Enter your email first.", "Gib zuerst deine E-Mail-Adresse ein."),
      );
      return;
    }
    setError(null);
    const { error: err } = await resetPassword(mail);
    if (err) {
      setError(friendlyAuthError(err, lang));
      return;
    }
    Alert.alert(
      t("Check your email", "E-Mail prüfen"),
      t(
        "We sent a password-reset link to your address.",
        "Wir haben dir einen Reset-Link an deine Adresse geschickt.",
      ),
    );
  };

  // Google / Apple via the system browser (Supabase OAuth).
  const oauth = async (provider: OAuthProvider) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    const { error: err } = await signInWithProvider(provider);
    setBusy(false);
    if (err) {
      setError(friendlyAuthError(err, lang));
      return;
    }
    enter();
  };

  // Quick demo login: sign in with the fixed demo account; if it doesn't exist
  // yet, create it once and sign in (works when email confirmation is off).
  const demoLogin = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    let res = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    if (res.error) {
      const up = await signUp(DEMO_EMAIL, DEMO_PASSWORD);
      res = up.error ? up : await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    }
    if (res.error) {
      setBusy(false);
      setError(friendlyAuthError(res.error, lang));
      return;
    }
    // Give the demo account a friendly name/handle for the profile screen.
    await saveProfile({ name: "Demo", username: "@demo" });
    setBusy(false);
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

        {/* Social login via Supabase OAuth (system browser). */}
        <View className="mt-5 gap-2.5">
          {/* Apple: stays the dark brand button, text always white. */}
          <Pressable
            onPress={() => oauth("apple")}
            disabled={busy}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] bg-night py-4"
          >
            <Text className="font-hk-semibold text-[14px] text-white">
              {t("Continue with Apple", "Weiter mit Apple")}
            </Text>
            <AppleLogo size={17} color="#FFFFFF" />
          </Pressable>
          {/* Google: stays a WHITE button (brand), with dark text — even in dark
              mode (bg-surface/text-ink would flip to dark-on-dark). */}
          <Pressable
            onPress={() => oauth("google")}
            disabled={busy}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] py-4"
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "rgba(26,26,26,0.16)",
            }}
          >
            <Text className="font-hk-semibold text-[14px]" style={{ color: "#1A1A1A" }}>
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

        {/* Name + username — only when signing up */}
        {mode === "register" ? (
          <>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t("Your name", "Dein Name")}
              placeholderTextColor="#8A857C"
              autoCapitalize="words"
              autoComplete="name"
              className="mb-2.5 rounded-button bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
              inputAccessoryViewID={KEYBOARD_DONE_ID}
            />
            <View className="mb-2.5 flex-row items-center rounded-button bg-surface px-5" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}>
              <Text className="font-hk-medium text-[15px] text-ink-3">@</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder={t("username", "benutzername")}
                placeholderTextColor="#8A857C"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username-new"
                className="flex-1 py-4 pl-1 font-hk-medium text-[15px] text-ink"
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
            </View>
          </>
        ) : null}

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

        {/* Age gate (GDPR Art. 8): confirm 16+ before creating an account. */}
        {mode === "register" ? (
          <Pressable
            onPress={() => setIs16((v) => !v)}
            className="mt-3.5 flex-row items-center"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: is16 }}
          >
            <View
              className="h-[22px] w-[22px] items-center justify-center rounded-[7px] border"
              style={{
                borderColor: is16 ? "#FFE500" : "rgba(0,0,0,0.2)",
                backgroundColor: is16 ? "#FFE500" : "transparent",
              }}
            >
              {is16 ? (
                <Text className="font-hk-bold text-[13px] text-accent-ink">✓</Text>
              ) : null}
            </View>
            <Text className="ml-2.5 flex-1 font-hk-medium text-[12.5px] leading-[17px] text-ink-2">
              {t(
                "I'm at least 16 years old.",
                "Ich bin mindestens 16 Jahre alt.",
              )}
            </Text>
          </Pressable>
        ) : null}

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

        {/* Forgot password (sign-in mode) */}
        {mode === "login" ? (
          <Pressable onPress={forgot} disabled={busy} className="mt-3 items-center py-1">
            <Text className="font-hk-semibold text-[13px] text-ink-2 underline">
              {t("Forgot password?", "Passwort vergessen?")}
            </Text>
          </Pressable>
        ) : null}

        {/* Quick demo login for testing (demo@verso.app) */}
        <Pressable
          onPress={demoLogin}
          disabled={busy}
          className="mt-3 items-center py-2"
        >
          <Text className="font-hk-semibold text-[13px] text-ink-3 underline">
            {t("Log in as demo user", "Als Demo-Nutzer einloggen")}
          </Text>
        </Pressable>

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
