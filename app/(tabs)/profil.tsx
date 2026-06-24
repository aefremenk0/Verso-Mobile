import { useRouter } from "expo-router";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../../src/components/Brand";
import { MysticBadge } from "../../src/components/MysticBadge";
import { GEHEIMTIPP, MOCK_USER } from "../../src/data/user";
import { getSpotById } from "../../src/data/spots";
import { NEIGHBORHOODS } from "../../src/data/cities";
import { useSaved } from "../../src/store/saved";
import { openExternal } from "../../src/lib/maps";

// Screen 07 — Profil.
// Nutzerkopf, Geheimtipp-Karte, Stats und Einstiegspunkte (Gespeichert,
// Einstellungen usw.).

// Eine Zeile in der Einstiegs-Liste.
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
        <Text className="font-hk-bold text-[16px] text-ink-3">→</Text>
      </View>
    </Pressable>
  );
}

export default function Profil() {
  const router = useRouter();
  const { savedIds } = useSaved();

  const tippSpot = getSpotById(GEHEIMTIPP.spotId);
  const cityCount = new Set(NEIGHBORHOODS.map((n) => n.city)).size;

  // Verso lebt von Mundpropaganda -> systemeigenes Teilen-Sheet öffnen.
  const onInvite = () => {
    Share.share({
      message:
        "Verso — kuratierte Orte, die kaum jemand kennt. Schau mal: https://verso.app",
    }).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          // „PROFIL" soll denselben Abstand zum Notch haben wie „Wien" im Feed:
          // dort Container pt-2 (8) + Zentrierung in der 42er-Zeile ((42-30)/2=6)
          // = 14px unter dem Notch. Hier entsprechend 14.
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-hk-bold text-[11px] tracking-[1.5px] text-ink-3">
          PROFIL
        </Text>

        {/* Kopf: Avatar + Name */}
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

        {/* Geheimtipp-Karte (dunkel). Zeigt den Tipp stationär an; Tippen führt
            direkt zum Spot-Detail — KEIN Lade-/Reveal-Pop-up mehr. */}
        <Pressable
          onPress={() => tippSpot && router.push(`/spot/${tippSpot.id}`)}
          className="mt-6 rounded-card bg-night p-5"
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-hk-bold text-[10px] tracking-[1.5px] text-white/50">
              GEHEIMTIPP DER WOCHE · FÜR ALLE
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
            { n: savedIds.length, l: "GESPEICHERT" },
            { n: 8, l: "VIERTEL" },
            { n: cityCount, l: "STÄDTE" },
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

        {/* Einstiegspunkte */}
        <View className="mt-4">
          <Row
            label="Gespeicherte Orte"
            value={String(savedIds.length)}
            onPress={() => router.push("/gespeichert")}
          />
          <Row label="Einstellungen" onPress={() => router.push("/settings")} />
          <Row
            label="Verso unterstützen"
            badge="SPENDE"
            onPress={() => openExternal("https://verso.app")}
          />
          <Row
            label="Vorschlag machen"
            value="verso.app ↗"
            onPress={() => openExternal("https://verso.app")}
          />
        </View>

        {/* Freund einladen — passt zur App-DNA (Tipps von Freund zu Freund). */}
        <Pressable
          onPress={onInvite}
          className="mt-8 flex-row items-center justify-between rounded-card bg-night p-5"
        >
          <View className="flex-1 pr-3">
            <Text className="font-hk-extrabold-italic text-[18px] text-screen">
              Kennst du jemanden mit Gespür?
            </Text>
            <Text className="mt-1 font-hk-medium text-[13px] leading-[18px] text-screen/60">
              Verso lebt von Mundpropaganda. Gib den Geheimtipp weiter.
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-bold text-[16px] text-accent-ink">↗</Text>
          </View>
        </Pressable>

        {/* Stille Signatur ganz unten. mt-8 = derselbe Abstand wie die
            Einladen-Karte zur Liste (vorher mt-10 -> 8px nach oben geschoben). */}
        <View className="mt-8 items-center">
          <Brand size={26} color="#8A857C" />
          <Text className="mt-2 font-hk-semibold text-[10px] tracking-[2px] text-ink-3">
            VERSION 0.1 · MADE IN WIEN
          </Text>
          {/* Zitat in EINER Zeile: shrink-to-fit statt Umbruch. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-3 text-center font-hk-medium-italic text-[12px] leading-[18px] text-ink-3"
          >
            Die Stadt gehört denen, die hinter die Türen schauen.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
