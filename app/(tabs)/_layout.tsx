import { Tabs } from "expo-router";
import { BottomNav } from "../../src/components/BottomNav";

// Tab navigator with our floating bottom nav.
// The order here determines the order of the tabs in the nav.

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      // Custom navigation bar instead of the default TabBar.
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="viertel" />
      <Tabs.Screen name="karte" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
