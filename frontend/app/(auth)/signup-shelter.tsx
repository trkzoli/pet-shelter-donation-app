import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const ShelterSignupScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const horizontalPadding = 20 * 2;
  const availableWidth = width - horizontalPadding;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSignUp = () => {
    console.log('Shelter Signup:', { email, phone, password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.push('/choose-signup')} style={styles.backIcon}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Image */}
          <Image
            source={require('../../assets/images/AShelter2.png')}
            style={[styles.topImage, { width: width * 0.7, height: width * 0.7 }]}
          />
          {/* Title */}
          <Text style={[styles.topTitle, { fontSize: availableWidth * 0.08 }]}>
            Sign Up
          </Text>
          {/* Email Input Field */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6B6B6B"
            style={[styles.input, { width: availableWidth * 0.9 }]}
            value={email}
            onChangeText={setEmail}
          />
          {/* Phone Number Input Field */}
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#6B6B6B"
            style={[styles.input, { width: availableWidth * 0.9 }]}
            value={phone}
            onChangeText={setPhone}
          />
          {/* Password Input Field with Eye Icon inside */}
          <View style={[styles.passwordContainer, { width: availableWidth * 0.9 }]}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#6B6B6B"
              secureTextEntry={!passwordVisible}
              style={[styles.input, { flex: 1, paddingRight: 40 }]}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIconContainer}
            >
              <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={width * 0.05} color="#797979" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.termsText, {fontSize: availableWidth * 0.03}]}>
                      By signing up, you agree to our{' '}
                      <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                      <Text style={styles.linkText}>Privacy Policy</Text>.
                    </Text>
          {/* Create Your Account Button */}
          <TouchableOpacity
            style={[styles.createAccountButton, { width: availableWidth * 0.9 }]}
            onPress={handleSignUp}
          >
            <Text style={[styles.createAccountButtonText, { fontSize: availableWidth * 0.045 }]}>
              Create Your Account
            </Text>
          </TouchableOpacity>
          {/* Already have an account */}
          <Text style={[styles.loginText, { fontSize: availableWidth * 0.035 }]}>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={() => router.push('/login')}>
              Login
            </Text>
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 50,
  },
  topImage: {
    resizeMode: 'contain',
    marginVertical: 10,
  },
  topTitle: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#E4E0E1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
    borderColor: '#797979',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  createAccountButton: {
    height: 50,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
    paddingVertical: 12.5,
  },
  createAccountButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  loginText: {
    marginTop: 10,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  termsText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    lineHeight: 18,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default ShelterSignupScreen;
