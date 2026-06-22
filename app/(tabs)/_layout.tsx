import { Tabs } from "expo-router";
import { BottomNav } from "../../src/components/BottomNav";

// Tab-Navigator mit unserer schwebenden Bottom-Nav.
// Die Reihenfolge hier bestimmt die Reihenfolge der Reiter in der Nav.

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      // Eigene Navigationsleiste statt der Standard-TabBar.
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="viertel" />
      <Tabs.Screen name="karte" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
