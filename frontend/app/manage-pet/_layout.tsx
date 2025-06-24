import { Stack } from "expo-router";
import { useEffect } from "react";
import { setTabsUI } from "../../config/systemUI";

export default function ShelterManageLayout() {
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
        name="[id]" 
        options={{ 
          title: "Manage Pet",
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}