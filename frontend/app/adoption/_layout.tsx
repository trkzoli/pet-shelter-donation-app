import { Stack } from "expo-router";
import { useEffect } from "react";
import { setTabsUI } from "../../config/systemUI";

export default function AdoptionLayout() {
  useEffect(() => {
    setTabsUI(); 
  }, []);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#E4E0E1' },
      }}
    >
      <Stack.Screen 
        name="process" 
        options={{ 
          title: "Real Adoption Process",
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="eligible-pets" 
        options={{ 
          title: "Eligible Pets",
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="request/[petId]" 
        options={{ 
          title: "Adoption Request",
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="status" 
        options={{ 
          title: "Request Status",
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}