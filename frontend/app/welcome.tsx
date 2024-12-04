import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <View style={styles.imageRow}>
          <Image
            source={require('../assets/images/ph1.jpg')}
            style={styles.sideImage}
          />
          <Image
            source={require('../assets/images/tmh1.jpg')}
            style={styles.middleImage}
          />
          <Image
            source={require('../assets/images/ph2.jpg')}
            style={styles.sideImage}
          />
        </View>

        <Text style={styles.title}>
          <Text style={styles.highlightedWord}>Adopt</Text> a furry friend virtually
        </Text>

        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Text>

        <TouchableOpacity 
          style={styles.signupButton}
          onPress={() => router.push('/signup')}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    width: '80%',
    marginBottom: 20,
  },
  sideImage: {
    width: width * 0.25, 
    height: width * 0.35, 
    borderRadius: 20, 
    resizeMode: 'cover',
    marginHorizontal: 5,
  },
  middleImage: {
    width: width * 0.3, 
    height: width * 0.4, 
    borderRadius: 20, 
    resizeMode: 'cover',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 10,
  },
  highlightedWord: {
    fontFamily: 'PoppinsBold',
    color: '#704F38',
 
  },
  description: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 30,
    lineHeight: 20,
  },
  signupButton: {
    backgroundColor: '#704F38',
    borderRadius: 50, 
    width: width * 0.80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    paddingVertical: 12.5,
  },
  loginButton: {
    backgroundColor: '#704F38',
    borderRadius: 50,
    width: width * 0.80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 12.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
});

export default WelcomeScreen;
