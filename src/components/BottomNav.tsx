import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shadows } from "../theme";

// Schwebende Bottom-Navigation.
//
// Wird als `tabBar` an den Expo-Router-<Tabs>-Navigator übergeben. Die vier
// Reiter (FEED · VIERTEL · KARTE · DU) entsprechen den Routen in app/(tabs)/.
// Der gelbe "?"-Kreis rechts ist der Schnellzugriff auf den Geheimtipp.

// Anzeige-Label je Routen-Name.
const LABELS: Record<string, string> = {
  feed: "FEED",
  viertel: "VIERTEL",
  karte: "KARTE",
  profil: "DU",
};

// Minimal getypte Props – wir brauchen nur State + navigate.
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
        className="mx-4 mb-2 flex-row items-center rounded-pill bg-surface px-3 py-2"
        style={[{ marginBottom: insets.bottom > 0 ? insets.bottom : 12 }, shadows.nav]}
      >
        <View className="flex-1 flex-row items-center justify-between">
          {state.routes
            .filter((r) => LABELS[r.name])
            .map((route) => {
              const focused =
                state.routes[state.index]?.name === route.name;
              return (
                <Pressable
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  className={`rounded-pill px-4 py-2 ${focused ? "bg-accent" : ""}`}
                >
                  <Text
                    className={`font-hk-bold text-[12px] tracking-[1px] ${
                      focused ? "text-accent-ink" : "text-ink-3"
                    }`}
                  >
                    {LABELS[route.name]}
                  </Text>
                </Pressable>
              );
            })}
        </View>

        {/* Geheimtipp-der-Woche-Schnellzugriff */}
        <Pressable
          onPress={() => router.push("/geheimtipp")}
          className="ml-1 h-10 w-10 items-center justify-center rounded-pill bg-accent"
        >
          <Text className="font-hk-extrabold text-[18px] text-accent-ink">?</Text>
        </Pressable>
      </View>
    </View>
  );
}
