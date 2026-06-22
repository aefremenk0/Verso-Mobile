import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGeheimtipp } from "../src/store/geheimtipp";
import { useSaved } from "../src/store/saved";

// Screen 07 — Einstellungen.
// Gruppierte Karten nach Mockup. Die Toggles sind funktionsfähig (lokaler
// State, keine echte Wirkung im MVP). "Abmelden" setzt den Mock-Zustand
// zurück und führt zum Welcome-Screen.

// Ein/Aus-Schalter im Verso-Stil (gelb = an).
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <Pressable
      onPress={onChange}
      className="h-[25px] w-[42px] justify-center rounded-pill px-[2.5px]"
      style={{ backgroundColor: value ? "#FFE500" : "rgba(26,26,26,0.16)" }}
    >
      <View
        className="h-[20px] w-[20px] rounded-pill"
        style={{
          backgroundColor: value ? "#1A1A1A" : "#FFFFFF",
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}

function NavRow({
  label,
  value,
  last,
  onPress,
}: {
  label: string;
  value?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-black/5"
      }`}
    >
      <Text className="font-hk-extrabold text-[15px] text-ink">{label}</Text>
      {value ? (
        <Text className="font-hk-medium text-[13px] text-ink-3">{value}</Text>
      ) : (
        <Text className="text-[15px] text-ink-3">→</Text>
      )}
    </Pressable>
  );
}

export default function Settings() {
  const router = useRouter();
  const geheimtipp = useGeheimtipp();
  const saved = useSaved();

  const [tippN, setTippN] = useState(true);
  const [spotsN, setSpotsN] = useState(true);
  const [eventsN, setEventsN] = useState(false);

  const abmelden = () => {
    // Mock-Login zurücksetzen: Geheimtipp wieder frisch, Merkliste auf Start.
    geheimtipp.reset();
    saved.reset();
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-title-md text-ink">Einstellungen</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* KONTO */}
        <Text className="mb-2.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          KONTO
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          <NavRow
            label="Profil bearbeiten"
            onPress={() => router.push("/profil-bearbeiten")}
          />
          <NavRow label="E-Mail" value="lena@verso.app" />
          <NavRow
            label="Passwort ändern"
            last
            onPress={() => router.push("/passwort-aendern")}
          />
        </View>

        {/* BENACHRICHTIGUNGEN */}
        <Text className="mb-2.5 mt-7 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          BENACHRICHTIGUNGEN
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">Geheimtipp der Woche</Text>
            <Toggle value={tippN} onChange={() => setTippN((v) => !v)} />
          </View>
          <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">Neue Spots in der Nähe</Text>
            <Toggle value={spotsN} onChange={() => setSpotsN((v) => !v)} />
          </View>
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">Events & Termine</Text>
            <Toggle value={eventsN} onChange={() => setEventsN((v) => !v)} />
          </View>
        </View>

        {/* APP */}
        <Text className="mb-2.5 mt-7 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          APP
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          <NavRow label="Sprache" value="Deutsch" />
          <NavRow label="Erscheinungsbild" value="Hell" />
          <NavRow label="Rechtliches & Hilfe" last />
        </View>

        {/* Abmelden */}
        <View className="mt-8 items-center">
          <Pressable
            onPress={abmelden}
            className="w-full items-center rounded-[16px] border py-4"
            style={{ borderColor: "rgba(26,26,26,0.2)" }}
          >
            <Text className="font-hk-extrabold text-[15px] text-ink">Abmelden</Text>
          </Pressable>
          <Text className="mt-3 font-hk-semibold text-[11px] text-ink/40">
            Konto löschen
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
