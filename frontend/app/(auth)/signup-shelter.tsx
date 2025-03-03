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
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const ShelterSignupScreen: React.FC = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/logo1brown.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>SIGN UP AS A SHELTER</Text>

          {/* Form Fields */}
          <TextInput
            placeholder="Shelter Name"
            placeholderTextColor="#6B6B6B"
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6B6B6B"
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
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
          <TextInput
            placeholder="Shelter Address"
            placeholderTextColor="#6B6B6B"
            style={styles.input}
          />
          <TextInput
            placeholder="Registration Number"
            placeholderTextColor="#6B6B6B"
            style={styles.input}
          />

          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By Signing Up, you agree to our{' '}
            <Text style={styles.linkText}>Terms & Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
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
    marginTop:50,
    
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
});

export default ShelterSignupScreen;
