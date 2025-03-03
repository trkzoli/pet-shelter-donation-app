import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#E4E0E1', // Set your header background color here
        },
        headerTintColor: '#1F2029', // Set the header text and icon color here
        headerTitleStyle: {
          fontFamily: 'PoppinsBold', // Customize the title font if desired
        },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="choose-signup" options={{ title: "", headerShown: false}} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
      <Stack.Screen name="signup-shelter" options={{ title: "Shelter Sign Up" }} />
      <Stack.Screen name="login" options={{ title: "Log In" }} />
    </Stack>
  );
}
