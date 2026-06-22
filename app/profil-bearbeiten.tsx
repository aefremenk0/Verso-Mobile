import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StripeTexture } from "../src/components/StripeTexture";
import { MOCK_USER } from "../src/data/user";

// Screen 07c — Profil bearbeiten (reine UI, kein echtes Speichern im MVP).

const INITIALS = MOCK_USER.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

// Beschriftetes Eingabefeld im Verso-Stil.
function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View>
      <Text className="mb-1.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        className="rounded-[14px] bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
        style={{
          borderWidth: 1,
          borderColor: "rgba(26,26,26,0.2)",
          minHeight: multiline ? 64 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export default function ProfilBearbeiten() {
  const router = useRouter();
  const [name, setName] = useState(MOCK_USER.name);
  const [username, setUsername] = useState(MOCK_USER.username);
  const [bio, setBio] = useState(MOCK_USER.bio);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[28px] text-ink">Profil bearbeiten</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar mit Foto-ändern */}
        <View className="mb-5 items-center">
          <View className="h-[84px] w-[84px]">
            <View className="h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-pill bg-night-2">
              <StripeTexture />
              <Text className="font-hk-extrabold-italic text-[26px] text-screen">
                {INITIALS}
              </Text>
            </View>
            <View
              className="absolute -bottom-0.5 -right-0.5 h-[30px] w-[30px] items-center justify-center rounded-pill bg-accent"
              style={{ borderWidth: 3, borderColor: "#F7F4EF" }}
            >
              <Text className="text-[13px] text-accent-ink">✎</Text>
            </View>
          </View>
          <Text className="mt-2.5 font-hk-semibold text-[12px] text-ink underline">
            Foto ändern
          </Text>
        </View>

        {/* Felder */}
        <View className="gap-3.5">
          <Field label="NAME" value={name} onChangeText={setName} />
          <Field label="BENUTZERNAME" value={username} onChangeText={setUsername} />
          <Field label="BIO" value={bio} onChangeText={setBio} multiline />
        </View>

        {/* Speichern (unten) */}
        <View className="flex-1" />
        <Pressable
          onPress={() => router.back()}
          className="mt-8 items-center rounded-[16px] bg-accent py-4"
        >
          <Text className="font-hk-extrabold text-[17px] text-accent-ink">Speichern</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
