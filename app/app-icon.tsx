import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useT } from "../src/lib/i18n";
import {
  currentIcon,
  hasAltIcons,
  setIcon,
  type IconKey,
} from "../src/lib/appIcon";
import { useInsider } from "../src/store/insider";

// App icon picker. The default (white "v." on dark) is for everyone; the two
// color variants are an Insider perk. iOS only (needs a dev/standalone build).

const GOLD = "#F4C430";

type IconOption = {
  key: IconKey;
  label: string;
  sub: string;
  img: number;
  insider: boolean;
};

export default function AppIconScreen() {
  const router = useRouter();
  const t = useT();
  const { isInsider } = useInsider();
  const [selected, setSelected] = useState<IconKey>(currentIcon());

  const options: IconOption[] = [
    {
      key: "Default",
      label: t("Classic", "Klassisch"),
      sub: t("White on black", "Weiß auf Schwarz"),
      img: require("../assets/icon.png"),
      insider: false,
    },
    {
      key: "Gold",
      label: t("Gold", "Gold"),
      sub: t("Yellow on black", "Gelb auf Schwarz"),
      img: require("../assets/icon-gold.png"),
      insider: true,
    },
    {
      key: "Inverse",
      label: t("Inverse", "Invertiert"),
      sub: t("Black on yellow", "Schwarz auf Gelb"),
      img: require("../assets/icon-inverse.png"),
      insider: true,
    },
  ];

  const choose = async (o: IconOption) => {
    if (o.insider && !isInsider) {
      router.push("/insider");
      return;
    }
    // In Expo Go there's no native module -> keep it as a visual preview.
    // In a dev/App Store build only commit the selection if the switch worked.
    if (!hasAltIcons) {
      setSelected(o.key);
      return;
    }
    const ok = await setIcon(o.key);
    if (ok) setSelected(o.key);
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[26px] text-ink">
          {t("App icon", "App-Icon")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 font-hk-medium text-[14px] leading-[20px] text-ink-2">
          {t(
            "Pick your home-screen look. The two color icons are an Insider perk.",
            "Wähle dein Homescreen-Icon. Die zwei Farb-Icons sind ein Insider-Extra.",
          )}
        </Text>

        <View className="gap-2.5">
          {options.map((o) => {
            const locked = o.insider && !isInsider;
            const active = selected === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => choose(o)}
                className="flex-row items-center rounded-card border-[1.5px] border-line/[0.08] bg-surface p-3.5"
                style={active ? { borderColor: GOLD } : undefined}
              >
                <View className="h-16 w-16 overflow-hidden rounded-[16px]">
                  <Image
                    source={o.img}
                    style={{ width: 64, height: 64 }}
                    contentFit="cover"
                  />
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-hk-extrabold text-[16px] text-ink">
                      {o.label}
                    </Text>
                    {o.insider ? (
                      <Text className="ml-2 text-[12px]" style={{ color: GOLD }}>
                        ✦
                      </Text>
                    ) : null}
                  </View>
                  <Text className="mt-0.5 font-hk-medium text-[12px] text-ink-3">
                    {o.sub}
                  </Text>
                </View>
                {/* Right: check when active, lock when Insider-gated */}
                {active ? (
                  <View
                    className="h-7 w-7 items-center justify-center rounded-pill"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Text className="font-hk-bold text-[13px] text-night">✓</Text>
                  </View>
                ) : locked ? (
                  <View className="rounded-pill bg-chip px-2.5 py-1">
                    <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-2">
                      {t("INSIDER", "INSIDER")}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {!hasAltIcons ? (
          <Text className="mt-4 text-center font-hk-medium text-[11px] leading-[16px] text-ink/40">
            {t(
              "Changing the icon works on iOS in a dev/App Store build (not in Expo Go).",
              "Das Ändern des Icons klappt auf iOS im Dev-/App-Store-Build (nicht in Expo Go).",
            )}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
