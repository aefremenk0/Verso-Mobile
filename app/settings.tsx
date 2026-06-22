import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOCK_USER } from "../src/data/user";

// Screen 07 — Einstellungen (Phase-1-Platzhalter).
//
// Die vollwertigen Screens (Profil bearbeiten, Passwort ändern, Toggles)
// kommen in Phase 2. Hier steht die Struktur, damit die Navigation schon passt.

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-black/5 py-4">
      <Text className="font-hk-semibold text-[16px] text-ink">{label}</Text>
      <View className="flex-row items-center">
        {value ? (
          <Text className="mr-2 font-hk-medium text-[14px] text-ink-3">{value}</Text>
        ) : null}
        <View className="rounded-pill bg-chip px-2.5 py-1">
          <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-3">BALD</Text>
        </View>
      </View>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      <View className="flex-row items-center px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="ml-4 font-hk-extrabold text-title-sm text-ink">
          Einstellungen
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">KONTO</Text>
        <View className="mt-1">
          <Row label="Profil bearbeiten" />
          <Row label="E-Mail" value="lena@verso.app" />
          <Row label="Passwort ändern" />
        </View>

        <Text className="mt-8 font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          BENACHRICHTIGUNGEN
        </Text>
        <View className="mt-1">
          <Row label="Geheimtipp der Woche" />
          <Row label="Neue Spots in der Nähe" />
          <Row label="Events & Termine" />
        </View>

        <Text className="mt-8 font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">APP</Text>
        <View className="mt-1">
          <Row label="Sprache" value="Deutsch" />
          <Row label="Erscheinungsbild" value="Hell" />
          <Row label="Rechtliches & Hilfe" />
        </View>

        <View className="mt-10 items-center rounded-card bg-surface p-5">
          <Text className="text-center font-hk-medium-italic text-[14px] leading-[20px] text-ink-2">
            Angemeldet als {MOCK_USER.name}. Die echten Einstellungen kommen in
            Phase 2 — inklusive Profil bearbeiten und Passwort ändern.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
