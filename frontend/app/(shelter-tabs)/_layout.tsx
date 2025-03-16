import { Tabs } from "expo-router";

export default function ShelterTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="shelter-home" options={{ title: "Shelter Home",  headerShown : false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="shelter-pets-add" options={{ title: "Add Pets",  headerShown : false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="shelter-profile" options={{ title: "Profile",  headerShown : false, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
