import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shadows } from "../theme";

// Schwebende Bottom-Navigation (weiße, abgerundete Leiste, abgesetzt vom Rand).
//
// Wird als `tabBar` an den Expo-Router-<Tabs>-Navigator übergeben. Die vier
// Reiter (Feed · Viertel · Karte · Du) entsprechen den Routen in app/(tabs)/.
// Ganz rechts der dunkle "?"-Kreis: Schnellzugriff auf den Geheimtipp.

const LABELS: Record<string, string> = {
  feed: "Feed",
  viertel: "Viertel",
  karte: "Karte",
  profil: "Du",
};

interface BottomNavProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function BottomNav({ state, navigation }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      pointerEvents="box-none"
    >
      <View
        className="mx-4 flex-row items-center rounded-card border border-black/10 bg-surface p-[7px]"
        style={[{ marginBottom: insets.bottom > 0 ? insets.bottom : 14 }, shadows.nav]}
      >
        {state.routes
          .filter((r) => LABELS[r.name])
          .map((route) => {
            const focused = state.routes[state.index]?.name === route.name;
            return (
              <Pressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                className={`flex-1 items-center rounded-[17px] py-3 ${
                  focused ? "bg-accent" : ""
                }`}
              >
                <Text
                  className={`font-hk-semibold text-[10px] tracking-[1px] ${
                    focused ? "text-accent-ink" : "text-ink-3"
                  }`}
                >
                  {LABELS[route.name].toUpperCase()}
                </Text>
              </Pressable>
            );
          })}

        {/* Geheimtipp-Schnellzugriff: dunkler Kreis mit gelbem "?" und gelbem Ring */}
        <Pressable
          onPress={() => router.push("/geheimtipp")}
          className="h-[44px] w-[44px] items-center justify-center"
        >
          <View
            className="h-[40px] w-[40px] items-center justify-center rounded-pill"
            style={{ borderWidth: 1.6, borderColor: "#FFE500" }}
          >
            <View className="h-[26px] w-[26px] items-center justify-center rounded-pill bg-night">
              <Text className="font-hk-extrabold text-[14px] text-accent">?</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
