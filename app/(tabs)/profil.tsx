import { useRouter } from "expo-router";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Arrow } from "../../src/components/Arrow";
import { Brand } from "../../src/components/Brand";
import { MysticBadge } from "../../src/components/MysticBadge";
import { MOCK_USER } from "../../src/data/user";
import { getSpotById } from "../../src/data/spots";
import { NEIGHBORHOODS } from "../../src/data/cities";
import { useCity } from "../../src/store/city";
import { useGeheimtipp } from "../../src/store/geheimtipp";
import { useSaved } from "../../src/store/saved";
import { openExternal } from "../../src/lib/maps";

// Screen 07 — Profile.
// User header, hidden-gem card, stats and entry points (Saved, Settings, etc.).

// A row in the entry-point list.
function Row({
  label,
  value,
  onPress,
  badge,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-black/5 py-4"
    >
      <Text className="font-hk-semibold text-[16px] text-ink">{label}</Text>
      <View className="flex-row items-center">
        {value ? (
          <Text className="mr-2 font-hk-medium text-[14px] text-ink-3">{value}</Text>
        ) : null}
        {badge ? (
          <View className="mr-2 rounded-pill bg-accent px-2.5 py-1">
            <Text className="font-hk-bold text-[10px] tracking-[1px] text-accent-ink">
              {badge}
            </Text>
          </View>
        ) : null}
        <Arrow width={18} color="#8A857C" />
      </View>
    </Pressable>
  );
}

export default function Profil() {
  const router = useRouter();
  const { savedIds } = useSaved();

  // Hidden gem of the currently selected city (city-dependent store).
  const { spotId } = useGeheimtipp();
  const { city } = useCity();
  const tippSpot = getSpotById(spotId);
  const cityCount = new Set(NEIGHBORHOODS.map((n) => n.city)).size;
  // The number of neighborhoods varies per city (München 8, Wien 7, Zürich 5 …)
  // -> derive it dynamically from NEIGHBORHOODS for the current city (was hard 8).
  const viertelCount = NEIGHBORHOODS.filter((n) => n.city === city).length;

  // Verso thrives on word of mouth -> open the native share sheet.
  const onInvite = () => {
    Share.share({
      message:
        "Verso — curated places hardly anyone knows. Take a look: https://verso.app",
    }).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          // "PROFILE" should have the same distance to the notch as "Wien" in the
          // feed: there container pt-2 (8) + centering in the 42px row ((42-30)/2=6)
          // = 14px below the notch. So 14 here.
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          PROFILE
        </Text>

        {/* Header: avatar + name */}
        <View className="mt-3 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-pill bg-night">
            <Text className="font-hk-extrabold text-[18px] text-white">LH</Text>
          </View>
          <View className="ml-4">
            <Text className="font-hk-extrabold text-title-sm text-ink">
              {MOCK_USER.name}
            </Text>
            <MysticBadge />
          </View>
        </View>

        {/* Hidden-gem card (dark). Shows the tip statically; tapping goes
            straight to the spot detail — NO loading/reveal popup anymore. */}
        <Pressable
          onPress={() => tippSpot && router.push(`/spot/${tippSpot.id}`)}
          className="mt-6 rounded-card bg-night p-5"
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-hk-bold text-[10px] tracking-[1.5px] text-white/50">
              HIDDEN GEM OF THE WEEK · FOR EVERYONE
            </Text>
            <View className="h-7 w-7 items-center justify-center rounded-pill bg-accent">
              <Text className="font-hk-extrabold text-[14px] text-accent-ink">?</Text>
            </View>
          </View>
          {tippSpot ? (
            <>
              <Text className="mt-3 font-hk-extrabold text-title-sm text-white">
                {tippSpot.name}
              </Text>
              <Text className="mt-1 font-hk-medium-italic text-[14px] leading-[19px] text-white/70">
                {tippSpot.hook}
              </Text>
            </>
          ) : null}
        </Pressable>

        {/* Stats */}
        <View className="mt-6 flex-row rounded-card bg-surface py-4">
          {[
            { n: savedIds.length, l: "SAVED" },
            { n: viertelCount, l: "AREAS" },
            { n: cityCount, l: "CITIES" },
          ].map((s, i) => (
            <View
              key={s.l}
              className={`flex-1 items-center ${i < 2 ? "border-r border-black/5" : ""}`}
            >
              <Text className="font-hk-extrabold text-title-sm text-ink">{s.n}</Text>
              <Text className="mt-1 font-hk-bold text-[10px] tracking-[1px] text-ink-3">
                {s.l}
              </Text>
            </View>
          ))}
        </View>

        {/* Entry points */}
        <View className="mt-4">
          <Row
            label="Saved places"
            value={String(savedIds.length)}
            onPress={() => router.push("/gespeichert")}
          />
          <Row label="Settings" onPress={() => router.push("/settings")} />
          <Row
            label="Support Verso"
            badge="DONATE"
            onPress={() => openExternal("https://verso.app")}
          />
          <Row
            label="Make a suggestion"
            value="verso.app ↗"
            onPress={() => openExternal("https://verso.app")}
          />
        </View>

        {/* Invite a friend — fits the app DNA (tips from friend to friend). */}
        <Pressable
          onPress={onInvite}
          className="flex-row items-center justify-between rounded-card bg-night p-5"
          style={{ marginTop: 21 }}
        >
          <View className="flex-1 pr-3">
            <Text className="font-hk-extrabold-italic text-[18px] text-screen">
              Know someone with good taste?
            </Text>
            <Text className="mt-1 font-hk-medium text-[13px] leading-[18px] text-screen/60">
              Verso thrives on word of mouth.{"\n"}Pass the hidden gem on.
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">↗</Text>
          </View>
        </Pressable>

        {/* Quiet signature at the very bottom. 21px = same spacing as the invite
            card to the list (both spacings equal). */}
        <View className="items-center" style={{ marginTop: 21 }}>
          <Brand size={26} color="#8A857C" />
          <Text className="mt-2 font-hk-semibold text-[10px] tracking-[2px] text-ink-3">
            VERSION 0.1 · MADE IN MUNICH
          </Text>
          {/* Quote on ONE line: shrink-to-fit instead of wrapping. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-3 text-center font-hk-medium-italic text-[12px] leading-[18px] text-ink-3"
          >
            The city belongs to those who look behind the doors.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
