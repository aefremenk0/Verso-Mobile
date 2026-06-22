import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityDropdown } from "../../src/components/CityDropdown";
import { NEIGHBORHOODS } from "../../src/data/cities";
import { useCity } from "../../src/store/city";

// Screen 05 — Stadt-Übersicht.
// Einheitlicher Stadt-Kopf (wie Feed) + Stadtteile mit poetischen Einzeilern.

export default function Viertel() {
  const { city } = useCity();
  const hoods = NEIGHBORHOODS.filter((n) => n.city === city);

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Identischer Stadt-Kopf wie im Feed */}
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
            ? `Wo geht die Reise hin? ${hoods.length} Bezirke, ${hoods.length} Stimmungen.`
            : "Diese Stadt kuratieren wir gerade. Bald geht's hier los."}
        </Text>

        <View className="mt-6">
          {hoods.map((n) => (
            <View
              key={n.name}
              className="flex-row items-center border-b border-black/5 py-5"
            >
              <View className="flex-1 pr-4">
                <Text className="font-hk-extrabold text-title-sm text-ink">
                  {n.name}
                </Text>
                <Text className="mt-1 font-hk-medium text-[14px] leading-[19px] text-ink-2">
                  {n.blurb}
                </Text>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-pill bg-accent">
                <Text className="font-hk-bold text-[16px] text-accent-ink">→</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
