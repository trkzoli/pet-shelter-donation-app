import { Stack } from "expo-router";
import { Platform, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { initializeSystemUI, APP_STATUS_BAR_CONFIG } from "../config/systemUI";
import { StripeProvider } from '@stripe/stripe-react-native';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

export default function RootLayout() {

  useEffect(() => {
    initializeSystemUI(); // Ez beállítja mindent egyszer
  }, []);

  const [publishableKey, setPublishableKey] = useState<string>(
    'pk_test_51Nw...your_test_key_here'
  );

  useEffect(() => {
    // Stripe
    const fetchKey = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/payments/config`, { timeout: 5000 });
        setPublishableKey(res.data.publishableKey);
      } catch (err) {
        setPublishableKey('pk_test_51Nw...your_test_key_here');
      }
    };
    fetchKey();
  }, []);

  return (
    <StripeProvider publishableKey={publishableKey}>

      <StatusBar
        backgroundColor={APP_STATUS_BAR_CONFIG.backgroundColor}
        barStyle={APP_STATUS_BAR_CONFIG.barStyle}
        translucent={APP_STATUS_BAR_CONFIG.translucent}
        hidden={APP_STATUS_BAR_CONFIG.hidden}
      />
      
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.select({
            ios: 'fade',
            android: 'fade_from_bottom',
            default: 'fade',
          }),
          animationDuration: 300,
          contentStyle: { backgroundColor: '#E4E0E1' },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            animation: 'none',
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            animationDuration: 300,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(shelter-tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="details" 
          options={{ 
            title: "Details", 
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="shelter-pets-manage" 
          options={{ 
            title: "Manage Pets", 
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="payment" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="shelter" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="shelter/profile" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="shelter/banners" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </StripeProvider>
  );
}