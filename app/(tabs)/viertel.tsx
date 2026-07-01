import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Arrow } from "../../src/components/Arrow";
import { CityDropdown } from "../../src/components/CityDropdown";
import { useLang, useT } from "../../src/lib/i18n";
import { neighborhoodBlurb } from "../../src/lib/localized";
import { useCatalog } from "../../src/store/catalog";
import { useCity } from "../../src/store/city";

// Screen 05 — City overview.
// Unified city header (like the feed) + neighborhoods with poetic one-liners.

export default function Viertel() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { neighborhoods } = useCatalog();
  const { city } = useCity();
  const hoods = neighborhoods.filter((n) => n.city === city);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Identical city header as in the feed */}
      <CityDropdown />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-medium text-[15px] leading-[21px] text-ink-2">
          {hoods.length > 0
            ? t(
                `Where to? ${hoods.length} neighborhoods, ${hoods.length} moods.`,
                `Wo geht die Reise hin? ${hoods.length} Bezirke, ${hoods.length} Stimmungen.`,
              )
            : t(
                "We're curating this city right now. It'll kick off here soon.",
                "Diese Stadt kuratieren wir gerade. Bald geht's hier los.",
              )}
        </Text>

        <View className="mt-6">
          {hoods.map((n) => (
            <Pressable
              key={n.name}
              onPress={() => router.push(`/bezirk/${encodeURIComponent(n.name)}`)}
              className="flex-row items-center border-b border-black/5 py-5"
            >
              <View className="flex-1 pr-4">
                <Text className="font-hk-extrabold text-title-sm text-ink">
                  {n.name}
                </Text>
                <Text className="mt-1 font-hk-medium text-[14px] leading-[19px] text-ink-2">
                  {neighborhoodBlurb(n, lang)}
                </Text>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-pill bg-accent">
                <Arrow width={18} color="#1A1A1A" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
