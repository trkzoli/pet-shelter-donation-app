import { Stack } from "expo-router";

export default function BannersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}