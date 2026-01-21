import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Platform,
  Image,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 40,
  INPUT_HEIGHT: 50,
  BUTTON_HEIGHT: 50,
  BORDER_RADIUS: 20,
  SOCIAL_BUTTON_SIZE: 40,
  BACK_BUTTON_TOP: 50,
} as const;

const FONT_RATIOS = {
  TITLE: 0.08,
  BUTTON_TEXT: 0.045,
  BODY_TEXT: 0.035,
} as const;

const SPACING = {
  VERTICAL_SMALL: 10,
  VERTICAL_MEDIUM: 15,
  VERTICAL_LARGE: 30,
  CONTAINER_BOTTOM: 50,
} as const;

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const availableWidth = width - DESIGN_CONSTANTS.HORIZONTAL_PADDING;
  const titleFontSize = availableWidth * FONT_RATIOS.TITLE;
  const buttonTextFontSize = availableWidth * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = availableWidth * FONT_RATIOS.BODY_TEXT;

  const handleBack = useCallback(() => {
    router.push('/welcome');
  }, [router]);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email }));
  }, []);

  const handlePasswordChange = useCallback((password: string) => {
    setFormData(prev => ({ ...prev, password }));
  }, []);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });
      const { accessToken, user } = response.data;
      if (!accessToken) throw new Error('No token returned');
      await AsyncStorage.setItem('token', accessToken);
      
     
      const userType = user?.role === 'shelter' ? 'shelter' : 'user';
      if (userType === 'shelter') {
        router.replace('/(shelter-tabs)/shelter-home');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message || 'Login failed. Please try again.';
        showAlert({
          title: 'Login Failed',
          message: Array.isArray(message) ? message.join(' ') : message,
          type: 'error',
          buttonText: 'Try Again',
        });
      } else {
        showAlert({
          title: 'Network Error',
          message: 'Could not connect to the server. Please try again.',
          type: 'error',
          buttonText: 'OK',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, router, showAlert]);



  const handleSignUpNavigation = useCallback(() => {
    router.replace('/choose-signup');
  }, [router]);

  const handleForgotPasswordPress = useCallback(() => {
    router.push('/forgot-password');
  }, [router]);

  useEffect(() => {
    const onBackPress = () => {
      router.push('/welcome');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to welcome screen"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
         
          <Image
            source={require('../../assets/images/lgdog.png')}
            style={[
              styles.topImage,
              { width: width * 0.7, height: width * 0.7 }
            ]}
            accessibilityLabel="Welcome illustration"
          />

      
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Welcome, Friend!
          </Text>
          
         
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6B6B6B"
            style={[styles.input, { width: availableWidth * 0.9 }]}
            value={formData.email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address to log in"
          />
          
       
          <View style={[styles.passwordContainer, { width: availableWidth * 0.9 }]}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#6B6B6B"
              secureTextEntry={!passwordVisible}
              style={[styles.input, styles.passwordInput]}
              value={formData.password}
              onChangeText={handlePasswordChange}
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Password"
              accessibilityHint="Enter your password to log in"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIconContainer}
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? "Show password" : "Hide password"}
            >
              <Ionicons 
                name={passwordVisible ? 'eye' : 'eye-off'}
                size={width * 0.05} 
                color="#797979" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={handleForgotPasswordPress}
              accessibilityRole="button"
              accessibilityLabel="Reset your password"
            >
              <Text style={[styles.forgotPasswordText, { fontSize: bodyTextFontSize }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          
          
          <TouchableOpacity
            style={[
              styles.loginButton, 
              { width: availableWidth * 0.9 },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Log in to your account"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={[styles.loginButtonText, { fontSize: buttonTextFontSize }]}>
              {isLoading ? 'Logging In...' : 'LOG IN'}
            </Text>
          </TouchableOpacity>
          

          
  
          <Text style={[styles.signupText, { fontSize: bodyTextFontSize }]}>
            Don't have an account?{' '}
            <Text style={styles.linkText} onPress={handleSignUpNavigation}>
              Sign Up
            </Text>
          </Text>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>

 
      <AlertModal
        visible={isVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
        onClose={hideAlert}
      />

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
  backButton: {
    position: 'absolute',
    top: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#797979',
    resizeMode: 'contain',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: SPACING.VERTICAL_LARGE,
    paddingBottom: SPACING.CONTAINER_BOTTOM,
  },
  topImage: {
    resizeMode: 'contain',
    marginTop: SPACING.VERTICAL_SMALL,
    marginBottom: -20,
  },
  title: {
    fontFamily: 'Pacifico',
    color: '#493628',
    marginBottom: SPACING.VERTICAL_LARGE,
    textAlign: 'center',
  },
  input: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: '#E4E0E1',
    paddingHorizontal: 15,
    marginBottom: SPACING.VERTICAL_MEDIUM,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
    borderColor: '#797979',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.VERTICAL_MEDIUM,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
    marginBottom: 0,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  forgotPasswordContainer: {
    width: '90%',
    alignItems: 'flex-end',
    marginBottom: SPACING.VERTICAL_MEDIUM,
  },
  forgotPasswordText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#493628',
    textDecorationLine: 'underline',
  },
  loginButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.VERTICAL_MEDIUM,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  signupText: {
    marginTop: SPACING.VERTICAL_SMALL,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
});

export default LoginScreen;


