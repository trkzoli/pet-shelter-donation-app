import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const SignUpScreen: React.FC = () => {
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
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        {/* Back Icon */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require('../assets/images/logo1brown.png')}
          style={styles.logo}
        />

        {/* Title */}
        <Text style={styles.title}>CREATE ACCOUNT</Text>

        {/* Input Fields */}
        <TextInput
          placeholder="Name"
          placeholderTextColor="#6B6B6B"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#6B6B6B"
          style={styles.input}
        />
        <TextInput
          placeholder="Create Password"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          style={styles.input}
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        {/* Terms & Privacy */}
        <Text style={styles.termsText}>
          By Signing Up, you agree to our{' '}
          <Text style={styles.linkText}>Terms & Privacy Policy</Text>
        </Text>

        {/* Or Divider */}
        <Text style={styles.orText}>or</Text>

        {/* Google Sign Up */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require('../assets/images/gl1.png')}
            style={styles.googleIcon}
          />
        </TouchableOpacity>

        {/* Already Have an Account */}
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text
            style={styles.linkText}
            onPress={() => router.push('/login')}
          >
            Login
          </Text>
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    color: '#1F2029',
  },
  backText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    marginTop: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: width * 0.80,
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    borderWidth: 1,
    borderColor: '#797979',
  },
  signupButton: {
    width: width * 0.80,
    height: 50,
    backgroundColor: '#704F38',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 15,
    paddingVertical: 12.5,
  },
  signupButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  termsText: {
    width: width * 0.60,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 10,
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  orText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 10,
  },
  googleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    //for Andorid
    elevation: 5,
    //for IOS
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
  },
  googleIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
});

export default SignUpScreen;
