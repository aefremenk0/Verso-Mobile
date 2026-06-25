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
import { AppleLogo, GoogleLogo } from "../src/components/Logos";
import { AMBIENTE_OPTIONS } from "../src/lib/mapFilter";
import { useInterests } from "../src/store/interests";

// Screen 01 — Registrierung / Anmelden.
// Reine UI: Apple/Google/E-Mail sind Platzhalter. Jeder Weg führt in den Feed.

export default function Register() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const { interests, toggle, max } = useInterests();

  // Im MVP kein echtes Login – wir ersetzen den Screen durch den Feed,
  // damit der Zurück-Button nicht wieder hierher führt.
  const enter = () => router.replace("/(tabs)/feed");

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: zurück + Wortmarke */}
      <View className="flex-row items-center px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
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
          KONTO
        </Text>
        <Text className="mt-2 font-hk-extrabold text-title-lg text-ink">
          Fast drin.
        </Text>
        <Text className="mt-3 font-hk-medium text-[15px] leading-[21px] text-ink-2">
          Damit Verso sich merkt, was dir gefällt — und dir den Wochentipp
          aufhebt.
        </Text>

        {/* Onboarding-Personalisierung: Vibe wählen (nur beim Registrieren).
            Stimmt den Feed sanft ab (passende Spots nach oben). */}
        {mode === "register" ? (
          <View className="mt-6">
            <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
              DEIN VIBE
            </Text>
            <Text className="mt-1.5 font-hk-medium text-[13px] leading-[18px] text-ink-2">
              Wähle bis zu {max} — wir stimmen deinen Feed darauf ab. (Optional)
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {AMBIENTE_OPTIONS.map((a) => {
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
                onPress={() => setMode(m)}
                className={`flex-1 items-center rounded-pill py-2.5 ${
                  active ? "bg-surface" : ""
                }`}
              >
                <Text
                  className={`font-hk-semibold text-[14px] ${
                    active ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {m === "register" ? "Registrieren" : "Anmelden"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Social Login (nur UI). Eigene Buttons mit echten Logos. */}
        <View className="mt-5 gap-2.5">
          <Pressable
            onPress={enter}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] bg-night py-4"
          >
            <Text className="font-hk-semibold text-[14px] text-screen">
              Weiter mit Apple
            </Text>
            <AppleLogo size={17} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={enter}
            className="flex-row items-center justify-center gap-2.5 rounded-[16px] bg-surface py-4"
            style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.16)" }}
          >
            <Text className="font-hk-semibold text-[14px] text-ink">
              Weiter mit Google
            </Text>
            <GoogleLogo size={18} />
          </Pressable>
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-black/10" />
          <Text className="mx-3 font-hk-semibold text-[11px] tracking-[1.5px] text-ink-3">
            ODER MIT E-MAIL
          </Text>
          <View className="h-px flex-1 bg-black/10" />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Deine E-Mail-Adresse"
          placeholderTextColor="#8A857C"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-button bg-surface px-5 py-4 font-hk-medium text-[15px] text-ink"
          style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
        />

        <View className="mt-5">
          <Button
            label={mode === "register" ? "Konto erstellen" : "Anmelden"}
            variant="accent"
            trailing="arrow"
            onPress={enter}
          />
        </View>

        <Text className="mt-6 text-center font-hk-medium text-[12px] leading-[18px] text-ink-3">
          Mit der Registrierung akzeptierst du{" "}
          <Text className="font-hk-semibold text-ink-2 underline">Bedingungen</Text>{" "}
          &{" "}
          <Text className="font-hk-semibold text-ink-2 underline">Datenschutz</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
