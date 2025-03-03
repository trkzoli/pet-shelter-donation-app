import React, { useEffect, useRef } from 'react';
import { View, StatusBar, StyleSheet, useWindowDimensions, Animated } from 'react-native';
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
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  //const titleTranslateY = useRef(new Animated.Value(80)).current;

  const { width, height } = useWindowDimensions();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Animated.sequence([
        // Először a logó animációja
        Animated.parallel([
          Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(logoTranslateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
      
        // Majd a cím animációja
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
          // Animated.spring(titleTranslateY, {
          //   toValue: 0,
          //   friction: 5, // Rugalmasság (minél kisebb, annál nagyobb az ugrás)
          //   tension: 60, // Gyorsaság (minél nagyobb, annál gyorsabb a visszaállás)
          //   useNativeDriver: true,
          // }),
        ]),
      ]).start();

      setTimeout(() => {
        SplashScreen.hideAsync();
        router.push('/welcome');
      }, 3500);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Responsive sizes based on screen width
  const logoSize = width * 0.4;
  const titleFontSize = width * 0.1;
  // Compute dynamic negative margin based on the logo size.
  // If logoSize is 160, then 25% of that is 40 (so marginBottom becomes -40)
  const dynamicNegativeMargin = -logoSize * 0.25;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={[styles.background, { width, height }]}>
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
                //transform: [{ translateY: titleTranslateY }],
                fontSize: titleFontSize,
              },
            ]}
          >
            Pawner
          </Animated.Text>
        </View>
      </View>
    </>
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
    color: '#1F2029',
    textAlign: 'center',
  },
});

export default SplashScreenComponent;
