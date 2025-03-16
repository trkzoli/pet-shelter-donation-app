import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "Home" , headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="owned-pets" options={{ title: "My Pets", headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", headerShown: false, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
