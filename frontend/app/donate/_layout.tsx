import { Stack } from "expo-router";

export default function DonateLayout() {
  return (
    <Stack>
      <Stack.Screen name="donate" options={{ title: "Donate", headerShown: true }} />
      <Stack.Screen name="payment-methods" options={{ title: "Payment Methods", headerShown: true }} />
      <Stack.Screen name="add-card" options={{ title: "Add Card", headerShown: true }} />
    </Stack>
  );
}
