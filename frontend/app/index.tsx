import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  useWindowDimensions, 
  Animated,
  Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

// All fonts load
const ALL_APP_FONTS = {
  Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
  PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
  PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  PoppinsSemiBoldItalic: require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
  PoppinsItalic: require('../assets/fonts/Poppins-Italic.ttf'),
};

// Preventhiding
SplashScreen.preventAutoHideAsync();

const SplashScreenComponent: React.FC = () => {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts(ALL_APP_FONTS);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.warn('Some fonts failed to load:', fontError);
          }

          await new Promise(resolve => setTimeout(resolve, 300));
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('App preparation failed:', e);
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();

      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, { 
            toValue: 1, 
            duration: 1000, 
            useNativeDriver: true 
          }),
          Animated.timing(logoTranslateY, { 
            toValue: 0, 
            duration: 1000, 
            useNativeDriver: true 
          }),
        ]),
        Animated.timing(titleOpacity, { 
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true 
        }),
      ]).start();

      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [appIsReady, logoOpacity, logoTranslateY, titleOpacity, router]);

  if (!appIsReady) {
    return null;
  }

  const logoSize = width * 0.4;
  const titleFontSize = width * 0.1;
  const dynamicNegativeMargin = -logoSize * 0.25;

  return (
    <Animated.View 
      style={[
        styles.background, 
        { 
          width, 
          height,
        }
      ]}
    >
      <View style={styles.centerContainer}>
        <Animated.Image
          source={require("../assets/images/LogoWhite.png")}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
              width: logoSize,
              height: logoSize,
              marginBottom: dynamicNegativeMargin,
            },
          ]}
        />
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              fontSize: titleFontSize,
            },
          ]}
        >
          Pawner
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'contain',
    tintColor: '#AB886D',
  },
  title: {
    fontFamily: 'Pacifico',
    color: '#493628',
    textAlign: 'center',
  },
});

export default SplashScreenComponent;


