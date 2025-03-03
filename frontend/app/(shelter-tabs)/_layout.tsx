import { Tabs } from "expo-router";

export default function ShelterTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="shelter-home" options={{ title: "Shelter Home" }} />
      <Tabs.Screen name="shelter-pets-add" options={{ title: "Add Pets" }} />
      <Tabs.Screen name="shelter-profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
