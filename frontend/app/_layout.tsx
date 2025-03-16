import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* 1️ SPLASH SCREEN (kezdő képernyő, ez vált át másra) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* 2️ AUTENTIKÁCIÓS OLDALAK */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* 3️ FŐ NAVIGÁCIÓS MENÜK */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(shelter-tabs)" options={{ headerShown: false }} />

      {/* 4️ KÜLÖNÁLLÓ KÉPERNYŐK (amik nem a Tabs részei) */}
      <Stack.Screen name="details" options={{ title: "Details", headerShown: false }} />
      <Stack.Screen name="shelter-pets-manage" options={{ title: "Manage Pets", headerShown: false }} />

      {/* 5️ DONATE ÉS PAYMENT FLOW */}
      <Stack.Screen name="payment" options={{ headerShown: false }} />

      {/* 6 BEÁLLÍTÁSOK PANEL */}
      <Stack.Screen name="settings" options={{ title: "Settings", presentation: "modal" }} />
    </Stack>
  );
}
