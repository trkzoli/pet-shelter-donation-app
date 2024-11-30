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
    return null; // Render nothing until fonts are loaded
  }

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')} // Use the same background as the splash screen
      style={styles.background}
      resizeMode="stretch"
    >
      {/* Content */}
      <View style={styles.container}>
        {/* Top Circular Images */}
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

        {/* Title */}
        <Text style={styles.title}>
          <Text style={styles.highlightedWord}>Adopt</Text> a furry friend virtually
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Text>

        {/* Buttons */}
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
    backgroundColor: 'transparent', // Transparent so the background image is visible
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Vertically align the images
    width: '80%',
    marginBottom: 20,
  },
  sideImage: {
    width: width * 0.25, // Smaller width for the side images
    height: width * 0.35, // Proportional height for the side images
    borderRadius: 20, // Rounded corners
    resizeMode: 'cover',
    marginHorizontal: 5, // Add spacing between images
  },
  middleImage: {
    width: width * 0.3, // Larger width for the middle image
    height: width * 0.4, // Taller height for the middle image
    borderRadius: 20, // Rounded corners
    resizeMode: 'cover',
    marginHorizontal: 10, // Add spacing between images
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold', // Use Poppins font
    textAlign: 'center',
    color: '#1F2029', // Black text color for most of the title
    marginBottom: 10,
  },
  highlightedWord: {
    fontFamily: 'PoppinsBold',
    color: '#704F38',
 
  },
  description: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular', // Use Poppins for the description
    textAlign: 'center',
    color: '#1F2029', // Black text for the description
    marginBottom: 30,
    lineHeight: 20,
  },
  signupButton: {
    backgroundColor: '#704F38',
    borderRadius: 50, // Rounded corners
    width: width * 0.80, // 80% of the screen width
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    paddingVertical: 12.5, // Added padding for button content
  },
  loginButton: {
    backgroundColor: '#704F38',
    borderRadius: 50, // Rounded corners
    width: width * 0.80, // 80% of the screen width
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 12.5, // Added padding for button content
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold', // Use Poppins for button text
    color: '#EDEDED', // Replace white with the requested off-white color
  },
});

export default WelcomeScreen;
