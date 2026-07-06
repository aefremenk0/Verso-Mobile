import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguageToggle } from "../src/components/LanguageToggle";
import { tapSelection } from "../src/lib/haptics";
import { isAnalyticsEnabled, setAnalyticsConsent } from "../src/lib/analytics";
import { useT, useLang } from "../src/lib/i18n";
import { friendlyAuthError } from "../src/lib/errors";
import { useAppearance } from "../src/store/appearance";
import { useAuth } from "../src/store/auth";
import { useGeheimtipp } from "../src/store/geheimtipp";
import { useInsider } from "../src/store/insider";
import { useInterests } from "../src/store/interests";
import { useNotifications } from "../src/store/notifications";
import { useSaved } from "../src/store/saved";
import { useScene } from "../src/store/scene";

// Screen 07 — Settings.
// Grouped cards per the mockup. The toggles work (local state, no real effect
// in the MVP). The "Language" row toggles the whole app between English and
// German. "Log out" resets the mock state and leads to the Welcome screen.

// On/off switch in the Verso style (yellow = on). Animated: the knob springs
// across and track + knob colors crossfade (Reanimated).
const TOGGLE_TRAVEL = 17; // track 42 - padding 2*2.5 - knob 20 = 17px

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  const p = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    p.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 220,
      mass: 0.6,
    });
  }, [value, p]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      p.value,
      [0, 1],
      ["rgba(26,26,26,0.16)", "#FFE500"],
    ),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * TOGGLE_TRAVEL }],
    backgroundColor: interpolateColor(p.value, [0, 1], ["#FFFFFF", "#1A1A1A"]),
  }));

  return (
    <Pressable
      onPress={() => {
        tapSelection(); // subtle "tick"
        onChange();
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View
        style={[
          {
            height: 25,
            width: 42,
            borderRadius: 999,
            justifyContent: "center",
            paddingHorizontal: 2.5,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            { height: 20, width: 20, borderRadius: 999 },
            knobStyle,
          ]}
        />
      </Animated.View>
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
        last ? "" : "border-b border-line/5"
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
  const lang = useLang();
  const geheimtipp = useGeheimtipp();
  const saved = useSaved();
  const interests = useInterests();
  const insider = useInsider();
  const { setScene } = useScene();
  const { user, signOut, deleteAccount } = useAuth();
  const notif = useNotifications();
  const appearance = useAppearance();
  const [statsOn, setStatsOn] = useState(isAnalyticsEnabled());

  const resetStores = () => {
    geheimtipp.reset();
    saved.reset();
    interests.reset();
    insider.reset(); // drop Insider preview
    setScene("essen"); // leave any Insider-only scene
  };

  const abmelden = () => {
    signOut(); // end the Supabase session (persisted in AsyncStorage)
    resetStores();
    router.replace("/");
  };

  const kontoLoeschen = () => {
    Alert.alert(
      t("Delete account?", "Konto löschen?"),
      t(
        "This permanently deletes your account and data. This can't be undone.",
        "Das löscht dein Konto und deine Daten dauerhaft. Nicht rückgängig zu machen.",
      ),
      [
        { text: t("Cancel", "Abbrechen"), style: "cancel" },
        {
          text: t("Delete", "Löschen"),
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert(
                t("Couldn't delete", "Löschen fehlgeschlagen"),
                friendlyAuthError(error, lang),
              );
              return;
            }
            resetStores();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
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
        <View className="overflow-hidden rounded-[18px] border border-line/[0.08] bg-surface">
          <NavRow
            label={t("Edit profile", "Profil bearbeiten")}
            onPress={() => router.push("/profil-bearbeiten")}
          />
          <NavRow label={t("Email", "E-Mail")} value={user?.email ?? "lena@verso.app"} />
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
        <View className="overflow-hidden rounded-[18px] border border-line/[0.08] bg-surface">
          <View className="flex-row items-center justify-between border-b border-line/5 px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Hidden gem of the week", "Geheimtipp der Woche")}
            </Text>
            <Toggle
              value={notif.isEnabled("geheimtipp")}
              onChange={() =>
                notif.setEnabled("geheimtipp", !notif.isEnabled("geheimtipp"))
              }
            />
          </View>
          <View className="flex-row items-center justify-between border-b border-line/5 px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("New spots nearby", "Neue Spots in der Nähe")}
            </Text>
            <Toggle
              value={notif.isEnabled("spots")}
              onChange={() =>
                notif.setEnabled("spots", !notif.isEnabled("spots"))
              }
            />
          </View>
          <View className="flex-row items-center justify-between px-4 py-[17px]">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Events & dates", "Events & Termine")}
            </Text>
            <Toggle
              value={notif.isEnabled("events")}
              onChange={() =>
                notif.setEnabled("events", !notif.isEnabled("events"))
              }
            />
          </View>
        </View>

        <View style={{ flexGrow: 1, minHeight: 22 }} />

        {/* APP */}
        <Text className="mb-2.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          APP
        </Text>
        <View className="overflow-hidden rounded-[18px] border border-line/[0.08] bg-surface">
          {/* Language row — emoji toggle flips the whole app EN <-> DE. */}
          <View className="flex-row items-center justify-between border-b border-line/5 px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Language", "Sprache")}
            </Text>
            <LanguageToggle />
          </View>
          {/* Dark mode — available to everyone. */}
          <View className="flex-row items-center justify-between border-b border-line/5 px-4 py-3">
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Dark mode", "Dunkelmodus")}
            </Text>
            <Toggle
              value={appearance.isDark}
              onChange={() =>
                appearance.setPref(appearance.pref === "dark" ? "light" : "dark")
              }
            />
          </View>
          {/* Anonymous usage stats — opt-out (privacy-first). */}
          <View className="flex-row items-center justify-between border-b border-line/5 px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className="font-hk-extrabold text-[15px] text-ink">
                {t("Anonymous usage stats", "Anonyme Nutzungsdaten")}
              </Text>
              <Text className="mt-0.5 font-hk-medium text-[11px] text-ink-3">
                {t(
                  "Helps improve Verso. No personal data, no tracking.",
                  "Hilft, Verso zu verbessern. Keine persönlichen Daten, kein Tracking.",
                )}
              </Text>
            </View>
            <Toggle
              value={statsOn}
              onChange={() => {
                const next = !statsOn;
                setStatsOn(next);
                setAnalyticsConsent(next);
              }}
            />
          </View>
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
            className="w-full items-center rounded-[16px] border border-line/20 py-4"
          >
            <Text className="font-hk-extrabold text-[15px] text-ink">
              {t("Log out", "Abmelden")}
            </Text>
          </Pressable>
          <Pressable onPress={kontoLoeschen} hitSlop={8} className="mt-3 py-1">
            <Text className="font-hk-semibold text-[11px] text-[#C0392B]">
              {t("Delete account", "Konto löschen")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
