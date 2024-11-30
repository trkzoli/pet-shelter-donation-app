import React, { useCallback, useEffect, useRef } from 'react';
import { ImageBackground, StatusBar, Image, StyleSheet, Text, Dimensions, Animated } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

const SplashScreenComponent: React.FC = () => {
  
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
  });

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current; // Logo starts slightly below
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current; // Title starts slightly below

  // Prevent the splash screen from auto-hiding
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  // Trigger animations when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      // Logo animation
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Title animation (delayed slightly after the logo)
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }).start();

      // Navigate to the next screen after animations
      setTimeout(() => {
        SplashScreen.hideAsync();
        router.push('/welcome'); 
      }, 3500); // Total duration of animations + small buffer
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content" 
      />
      <ImageBackground
        source={require('../assets/images/bgi.jpg')}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* Animated Logo */}
        <Animated.Image
          source={require('../assets/images/logo1brown.png')}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        />
        {/* Animated Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          PawPal
        </Animated.Text>
      </ImageBackground>
    </>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: -30, // Reduced space below the logo
  },
  title: {
    width: '100%',
    fontSize: 32,
    fontFamily: 'Pacifico',
    color: '#1F2029',
    textAlign: 'center',
  },
});

export default SplashScreenComponent;
