import { Pressable, Text, View } from "react-native";
import { useScene } from "../store/scene";

// Umschalter oben rechts: Ausgehen (🎉 Bar/Club/Event) vs. Essen (🍴 Restaurant/
// Snack/Café). Die aktive Seite ist gelb hinterlegt.
export function SceneToggle() {
  const { scene, setScene } = useScene();

  return (
    <View className="flex-row rounded-pill bg-chip p-1">
      <Pressable
        onPress={() => setScene("feiern")}
        className={`rounded-pill px-3 py-1.5 ${scene === "feiern" ? "bg-accent" : ""}`}
      >
        <Text className="text-[16px]">🎉</Text>
      </Pressable>
      <Pressable
        onPress={() => setScene("essen")}
        className={`rounded-pill px-3 py-1.5 ${scene === "essen" ? "bg-accent" : ""}`}
      >
        <Text className="text-[16px]">🍴</Text>
      </Pressable>
    </View>
  );
}
