import { Stack } from "expo-router";

export default function PetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: '#E4E0E1' }, 
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Pet Details",
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
    </Stack>
  );
}