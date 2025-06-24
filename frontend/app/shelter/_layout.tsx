import { Stack } from "expo-router";

export default function ShelterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="campaigns" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}