import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppleLogo, GoogleLogo } from "../src/components/Logos";
import { tapSelection } from "../src/lib/haptics";
import { useT } from "../src/lib/i18n";
import { useAuth } from "../src/store/auth";

// Screen: Connected accounts. Booking/ticketing + login providers the user can
// link to Verso. Mock state for now (in-memory) — real linking needs each
// provider's OAuth. Apple/Google reflect the sign-in provider when available.

type ServiceKey = "opentable" | "oeticket" | "apple" | "google";

export default function VerbundeneKonten() {
  const router = useRouter();
  const t = useT();
  const { user } = useAuth();

  // Pre-connect Apple/Google if the user signed in with that provider.
  const provider = (user?.app_metadata as { provider?: string } | undefined)
    ?.provider;
  const [connected, setConnected] = useState<Record<ServiceKey, boolean>>({
    opentable: false,
    oeticket: false,
    apple: provider === "apple",
    google: provider === "google",
  });

  const toggle = (k: ServiceKey) => {
    tapSelection();
    setConnected((c) => ({ ...c, [k]: !c[k] }));
  };

  const services: {
    key: ServiceKey;
    name: string;
    desc: string;
    logo?: React.ReactNode;
    initial?: string;
  }[] = [
    {
      key: "opentable",
      name: "OpenTable",
      desc: t("Table reservations", "Tischreservierungen"),
      initial: "O",
    },
    {
      key: "oeticket",
      name: "oeticket",
      desc: t("Event tickets", "Event-Tickets"),
      initial: "ö",
    },
    {
      key: "apple",
      name: "Apple",
      desc: t("Login & sync", "Login & Sync"),
      logo: <AppleLogo size={18} color="#1A1A1A" />,
    },
    {
      key: "google",
      name: "Google",
      desc: t("Login & calendar", "Login & Kalender"),
      logo: <GoogleLogo size={18} />,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[26px] text-ink">
          {t("Connected accounts", "Verbundene Konten")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 font-hk-medium text-[14px] leading-[20px] text-ink-2">
          {t(
            "Link services so Verso can reserve, ticket and sign you in faster.",
            "Verknüpfe Dienste, damit Verso schneller reserviert, Tickets holt und dich einloggt.",
          )}
        </Text>

        <View className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-surface">
          {services.map((s, i) => {
            const on = connected[s.key];
            return (
              <View
                key={s.key}
                className={`flex-row items-center px-4 py-[15px] ${
                  i < services.length - 1 ? "border-b border-black/5" : ""
                }`}
              >
                {/* Icon / initial */}
                <View
                  className="mr-3.5 h-9 w-9 items-center justify-center rounded-pill bg-chip"
                >
                  {s.logo ? (
                    s.logo
                  ) : (
                    <Text className="font-hk-extrabold text-[16px] text-ink">
                      {s.initial}
                    </Text>
                  )}
                </View>
                {/* Name + desc */}
                <View className="flex-1">
                  <Text className="font-hk-extrabold text-[15px] text-ink">
                    {s.name}
                  </Text>
                  <Text className="mt-0.5 font-hk-medium text-[12px] text-ink-3">
                    {s.desc}
                  </Text>
                </View>
                {/* Connect / connected button */}
                <Pressable
                  onPress={() => toggle(s.key)}
                  accessibilityRole="button"
                  className={`rounded-pill px-3.5 py-2 ${on ? "bg-accent" : ""}`}
                  style={
                    on
                      ? undefined
                      : { borderWidth: 1, borderColor: "rgba(26,26,26,0.2)" }
                  }
                >
                  <Text
                    className={`font-hk-bold text-[12px] ${
                      on ? "text-accent-ink" : "text-ink"
                    }`}
                  >
                    {on
                      ? t("Connected ✓", "Verbunden ✓")
                      : t("Connect", "Verbinden")}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text className="mt-4 text-center font-hk-medium text-[11px] text-ink/40">
          {t(
            "Linking is a preview — real connections come with each provider's login.",
            "Verknüpfen ist eine Vorschau — echte Verbindungen kommen über den Login des Anbieters.",
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
