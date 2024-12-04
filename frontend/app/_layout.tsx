import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ title: "Sign Up / Log In", headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "Create Account", headerShown: false}} />
      <Stack.Screen name="login" options={{ title: "Log In", headerShown: false }} />
      <Stack.Screen name="home" options={{ title: "Home", headerShown: false }} />
      <Stack.Screen name="details" options={{ title: "Details", headerShown: false }} />
      <Stack.Screen name="donate" options={{ title: "Donate", headerShown: false }} />
      <Stack.Screen name="payment-methods" options={{ title: "Payment Methods", headerShown: false }} />
      <Stack.Screen name="add-card" options={{ title: "Add Card", headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
      <Stack.Screen name="owned-pets" options={{ title: "Owned Pets", headerShown: false }} />
    </Stack>
  );  
}
