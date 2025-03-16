import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const horizontalPadding = 20 * 2;
  const availableWidth = width - horizontalPadding;

  // States for inputs and password visibility
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = () => {
    const users = {
      shelter: { email: "shelter@example.com", password: "shelter123" },
      adopter: { email: "adopter@example.com", password: "adopter123" },
    };
    if (email === users.shelter.email && password === users.shelter.password) {
      router.push('/shelter-home');
    } else if (email === users.adopter.email && password === users.adopter.password) {
      router.push('/home');
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.push('/welcome')} style={styles.backIcon}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Animated Top Image */}
          <Animated.Image
            source={require('../../assets/images/lgdog.png')}
            style={[
              styles.topImage,
              {
                width: width * 0.7,
                height: width * 0.7,
              },
            ]}
          />
          {/* Title */}
          <Text style={[styles.topTitle, { fontSize: availableWidth * 0.08 }]}>
            Welcome, Friend!
          </Text>
          
          {/* Email Input Field */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6B6B6B"
            style={[styles.input, { width: availableWidth * 0.9 }]}
            value={email}
            onChangeText={setEmail}
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
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIconContainer}>
              <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#797979" />
            </TouchableOpacity>
          </View>
          
          {/* LOG IN Button */}
          <TouchableOpacity
            style={[styles.loginButton, { width: availableWidth * 0.9 }]}
            onPress={handleLogin}
          >
            <Text style={[styles.loginButtonText, { fontSize: availableWidth * 0.045 }]}>
              LOG IN
            </Text>
          </TouchableOpacity>
          
          {/* Separator */}
          <Text style={[styles.orText, { fontSize: availableWidth * 0.035 }]}>
            - Or continue with -
          </Text>
          
          {/* Social Media Buttons Row */}
          <View style={[styles.socialButtonsContainer, { width: availableWidth * 0.8 }]}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../../assets/images/gl1.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../../assets/images/fb1.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../../assets/images/x1.png')} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
          
          {/* Sign Up Link */}
          <Text style={[styles.loginText, { fontSize: availableWidth * 0.035 }]}>
            Don't have an account?{' '}
            <Text style={styles.linkText} onPress={() => router.push('/choose-signup')}>
              Sign Up
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
    marginTop: 10,
    marginBottom: -20,
  },
  topTitle: {
    fontFamily: 'Pacifico',
    color: '#1F2029',
    marginBottom: 40,
  },
  input: {
    height: 50,
    backgroundColor: '#E4E0E1',
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
    borderColor: '#797979',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 15,
    paddingVertical: 12.5,
  },
  loginButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  orText: {
    fontFamily: 'PoppinsRegular',
    color: '#6B6B6B',
    marginBottom: 15,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 15,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  loginText: {
    marginTop: 10,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default LoginScreen;
