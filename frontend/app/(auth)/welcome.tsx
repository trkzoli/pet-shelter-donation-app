import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsSemiBoldItalic: require('../../assets/fonts/Poppins-SemiBoldItalic.ttf'),
    PoppinsItalic: require('../../assets/fonts/Poppins-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const horizontalPadding = 20 * 2; 
  const availableWidth = width - horizontalPadding;

  const sideImageWidth = availableWidth * 0.30;
  const sideImageHeight = availableWidth * 0.40;
  const middleImageWidth = availableWidth * 0.35;
  const middleImageHeight = availableWidth * 0.45;

  const titleFontSize = width * 0.06;
  const descriptionFontSize = width * 0.04;
  const buttonFontSize = width * 0.04;
  const buttonHeight = height * 0.07;

  return (
    <SafeAreaView style={[styles.background, { width, height }]}>
      <View style={styles.container}>
        <View style={[styles.imageRow, { width: availableWidth }]}>
          <Image
            source={require('../../assets/images/ph1.jpg')}
            style={[
              styles.sideImage,
              { width: sideImageWidth, height: sideImageHeight },
            ]}
          />
          <Image
            source={require('../../assets/images/tmh1.jpg')}
            style={[
              styles.middleImage,
              { width: middleImageWidth, height: middleImageHeight },
            ]}
          />
          <Image
            source={require('../../assets/images/ph2.jpg')}
            style={[
              styles.sideImage,
              { width: sideImageWidth, height: sideImageHeight },
            ]}
          />
        </View>

        <Text style={[styles.title, { fontSize: titleFontSize }]}>
          <Text style={styles.highlightedWord}>Adopt</Text> a furry friend virtually
        </Text>

        <Text style={[styles.description, { fontSize: descriptionFontSize }]}>
         Every pet deserves love. Even from a distance, you can be the reason a shelter pet finds happiness. Start your virtual adoption journey today!
        </Text>

        <TouchableOpacity 
          style={[styles.signupButton, { width: availableWidth, height: buttonHeight }]}
          onPress={() => router.push('/choose-signup')}
        >
          <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>SIGN UP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.loginButton, { width: availableWidth, height: buttonHeight }]}
          onPress={() => router.push('/login')}
        >
          <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
  },
  sideImage: {
    borderRadius: 20, 
    resizeMode: 'cover',
    
  },
  middleImage: {
    borderRadius: 20, 
    resizeMode: 'cover',
  },
  title: {
    fontFamily: 'PoppinsSemiBold',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 10,
  },
  highlightedWord: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  description: {
    fontFamily: 'PoppinsItalic',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 30,
    lineHeight: 20,
  },
  signupButton: {
    backgroundColor: '#AB886D',
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    paddingVertical: 12.5,
  },
  loginButton: {
    backgroundColor: '#D6C0B3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 12.5,
  },
  buttonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
});

export default WelcomeScreen;
