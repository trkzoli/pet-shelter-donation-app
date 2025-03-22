import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, Dimensions } from 'react-native';
import React from 'react'; 


export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "Home", headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="owned-pets" options={{ title: "My Pets", headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", headerShown: false, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
