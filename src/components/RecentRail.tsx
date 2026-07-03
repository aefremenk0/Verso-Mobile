import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PIN_COLORS } from "../lib/pinColors";
import { useLang, useT } from "../lib/i18n";
import { spotText } from "../lib/localized";
import { useCatalog } from "../store/catalog";
import { useRecent } from "../store/recent";

// Horizontal "recently viewed" rail for the feed. Resolves the recent ids to
// real spots (dropping any that no longer exist) and links back to the detail.
// Renders nothing when there's nothing to show.

export function RecentRail() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { getSpotById } = useCatalog();
  const { recentIds } = useRecent();

  const spots = recentIds
    .map((id) => getSpotById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 10);

  if (spots.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="mb-2 font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
        {t("RECENTLY VIEWED", "ZULETZT ANGESEHEN")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-2.5">
          {spots.map((s) => {
            const col = PIN_COLORS[s.category];
            const txt = spotText(s, lang);
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/spot/${s.id}`)}
                className="w-[150px] rounded-[16px] border border-line/[0.08] bg-surface p-3"
              >
                <View className="flex-row items-center">
                  <View
                    className="h-2 w-2 rounded-pill"
                    style={{ backgroundColor: col.dot }}
                  />
                  <Text
                    numberOfLines={1}
                    className="ml-2 flex-1 font-hk-extrabold text-[13px] text-ink"
                  >
                    {txt.name}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  className="mt-1 font-hk-medium text-[11px] text-ink-3"
                >
                  {s.neighborhood}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
