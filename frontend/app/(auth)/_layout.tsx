import { Stack } from "expo-router";
import { useEffect } from "react";
import { setAuthUI } from "../../config/systemUI";


export default function AuthLayout() {
  useEffect(() => {
    setAuthUI();
  }, []);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#E4E0E1' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="choose-signup" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="signup-shelter" />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}