import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguageToggle } from "../src/components/LanguageToggle";
import { useT } from "../src/lib/i18n";
import { useGeheimtipp } from "../src/store/geheimtipp";
import { useInterests } from "../src/store/interests";
import { useSaved } from "../src/store/saved";

// Screen 07 — Settings.
// Grouped cards per the mockup. The toggles work (local state, no real effect
// in the MVP). The "Language" row toggles the whole app between English and
// German. "Log out" resets the mock state and leads to the Welcome screen.

// On/off switch in the Verso style (yellow = on).
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
      className={`flex-row items-center justify-between px-4 py-[18px] ${
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
  const t = useT();
  const geheimtipp = useGeheimtipp();
  const saved = useSaved();
  const interests = useInterests();

  const [tippN, setTippN] = useState(true);
  const [spotsN, setSpotsN] = useState(true);
  const [eventsN, setEventsN] = useState(false);

  const abmelden = () => {
    // Reset the mock login: hidden gem fresh again, saved list back to start,
    // clear the selected vibes/interests.
    geheimtipp.reset();
    saved.reset();
    interests.reset();
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text
          className="font-hk-extrabold text-title-md text-ink"
          style={{ lineHeight: 38, includeFontPadding: false }}
        >
          {t("Settings", "Einstellungen")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 6,
          paddingBottom: 20,
          // Fill at least the full height so the sections can spread evenly
          // (the flexible spacers below push them apart instead of clustering
          // at the top).
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ACCOUNT */}
        <Text className="mb-2.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          {t("ACCOUNT", "KONTO")}
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          <NavRow
            label={t("Edit profile", "Profil bearbeiten")}
            onPress={() => router.push("/profil-bearbeiten")}
          />
          <NavRow label={t("Email", "E-Mail")} value="lena@verso.app" />
          <NavRow
            label={t("Change password", "Passwort ändern")}
            last
            onPress={() => router.push("/passwort-aendern")}
          />
        </View>

        {/* Flexible gap -> spreads the sections evenly over the page height. */}
        <View style={{ flexGrow: 1, minHeight: 22 }} />

        {/* NOTIFICATIONS */}
        <Text className="mb-2.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          {t("NOTIFICATIONS", "BENACHRICHTIGUNGEN")}
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Hidden gem of the week", "Geheimtipp der Woche")}
            </Text>
            <Toggle value={tippN} onChange={() => setTippN((v) => !v)} />
          </View>
          <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("New spots nearby", "Neue Spots in der Nähe")}
            </Text>
            <Toggle value={spotsN} onChange={() => setSpotsN((v) => !v)} />
          </View>
          <View className="flex-row items-center justify-between px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Events & dates", "Events & Termine")}
            </Text>
            <Toggle value={eventsN} onChange={() => setEventsN((v) => !v)} />
          </View>
        </View>

        <View style={{ flexGrow: 1, minHeight: 22 }} />

        {/* APP */}
        <Text className="mb-2.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          APP
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          {/* Language row — emoji toggle flips the whole app EN <-> DE. */}
          <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Language", "Sprache")}
            </Text>
            <LanguageToggle />
          </View>
          <NavRow
            label={t("Appearance", "Erscheinungsbild")}
            value={t("Light", "Hell")}
          />
          <NavRow
            label={t("Legal & help", "Rechtliches & Hilfe")}
            last
            onPress={() => router.push("/legal")}
          />
        </View>

        <View style={{ flexGrow: 1, minHeight: 28 }} />

        {/* Log out */}
        <View className="items-center">
          <Pressable
            onPress={abmelden}
            className="w-full items-center rounded-[16px] border py-4"
            style={{ borderColor: "rgba(26,26,26,0.2)" }}
          >
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Log out", "Abmelden")}
            </Text>
          </Pressable>
          <Text className="mt-3 font-hk-semibold text-[11px] text-ink/40">
            {t("Delete account", "Konto löschen")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
