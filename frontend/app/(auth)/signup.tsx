import React, { useState, useCallback, useEffect } from 'react';
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
  Platform,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AlertModal, LegalContentModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

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
  TERMS_TEXT: 0.03,
} as const;

const SPACING = {
  VERTICAL_SMALL: 10,
  VERTICAL_MEDIUM: 15,
  VERTICAL_LARGE: 30,
  CONTAINER_BOTTOM: 50,
} as const;

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldsTouched, setFieldsTouched] = useState({
    email: false,
    password: false,
  });
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContentType, setLegalContentType] = useState<'terms' | 'privacy'>('terms');


  const availableWidth = width - DESIGN_CONSTANTS.HORIZONTAL_PADDING;
  const titleFontSize = availableWidth * FONT_RATIOS.TITLE;
  const buttonTextFontSize = availableWidth * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = availableWidth * FONT_RATIOS.BODY_TEXT;
  const termsTextFontSize = availableWidth * FONT_RATIOS.TERMS_TEXT;

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const isValid = metRequirements === 5;
    
    return { requirements, isValid, metCount: metRequirements };
  };

  const getPasswordRequirementText = (password: string) => {
    if (!password) return '';
    
    const validation = validatePassword(password);
    const missing = [];
    
    if (!validation.requirements.length) missing.push('8+ characters');
    if (!validation.requirements.uppercase) missing.push('uppercase letter');
    if (!validation.requirements.lowercase) missing.push('lowercase letter');
    if (!validation.requirements.number) missing.push('number');
    if (!validation.requirements.special) missing.push('special character');
    
    if (missing.length === 0) return 'Strong password!';
    
    return `Need: ${missing.join(', ')}`;
  };

  const getEmailBorderColor = () => {
    if (!fieldsTouched.email) return '#797979';
    if (!formData.email) return '#797979';
    return isValidEmail(formData.email) ? '#51CF66' : '#FF6B6B';
  };

  const getPasswordBorderColor = () => {
    if (!fieldsTouched.password) return '#797979';
    if (!formData.password) return '#797979';
    return validatePassword(formData.password).isValid ? '#51CF66' : '#FF6B6B';
  };


  const handleBack = useCallback(() => {
    router.push('/choose-signup');
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

  const handleEmailBlur = useCallback(() => {
    setFieldsTouched(prev => ({ ...prev, email: true }));
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setFieldsTouched(prev => ({ ...prev, password: true }));
  }, []);

  const handleSignUp = useCallback(async () => {

    if (!formData.email.trim()) {
      showAlert({
        title: 'Email Required',
        message: 'Please enter your email address.',
        type: 'warning',
        buttonText: 'OK'
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      showAlert({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        type: 'error',
        buttonText: 'OK'
      });
      return;
    }

    if (!validatePassword(formData.password).isValid) {
      showAlert({
        title: 'Password Requirements',
        message: 'Please ensure your password meets all security requirements.',
        type: 'warning',
        buttonText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    try {
      
      const response = await axios.post(`${API_BASE_URL}/auth/register/donor`, {
        email: formData.email,
        password: formData.password,
        name: 'Donor',
      });
      
      router.push({
        pathname: '/verify-email',
        params: {
          email: formData.email,
          userType: 'user',
        },
      });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message || 'Registration failed. Please try again.';
        showAlert({
          title: 'Registration Error',
          message: Array.isArray(message) ? message.join(' ') : message,
          type: 'error',
          buttonText: 'OK',
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



  const handleLoginNavigation = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleShowTerms = useCallback(() => {
    setLegalContentType('terms');
    setLegalModalVisible(true);
  }, []);

  const handleShowPrivacy = useCallback(() => {
    setLegalContentType('privacy');
    setLegalModalVisible(true);
  }, []);


  useEffect(() => {
    const onBackPress = () => {
      router.push('/choose-signup');
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
          accessibilityLabel="Go back to user type selection"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}         
        >
        {/* Main Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Image */}
          <Image
            source={require('../../assets/images/AOwner2.png')}
            style={[
              styles.topImage, 
              { width: width * 0.6, height: width * 0.6 }
            ]}
            accessibilityLabel="Pet owner illustration"
          />

          {/* Title */}
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Sign Up
          </Text>
          
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#6B6B6B"
              style={[
                styles.input, 
                { 
                  width: availableWidth * 0.9,
                  borderColor: getEmailBorderColor()
                }
              ]}
              value={formData.email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />
            {fieldsTouched.email && formData.email && !isValidEmail(formData.email) && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>
          
          {/* Password Input with Validation */}
          <View style={styles.inputContainer}>
            <View style={[styles.passwordContainer, { width: availableWidth * 0.9 }]}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6B6B6B"
                secureTextEntry={!passwordVisible}
                style={[
                  styles.input, 
                  styles.passwordInput,
                  { borderColor: getPasswordBorderColor() }
                ]}
                value={formData.password}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                autoComplete="password"
                textContentType="password"
                accessibilityLabel="Password"
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
            {fieldsTouched.password && formData.password && (
              <Text 
                style={[
                  styles.passwordRequirementText,
                  { 
                    color: validatePassword(formData.password).isValid ? '#51CF66' : '#FF6B6B' 
                  }
                ]}
              >
                {getPasswordRequirementText(formData.password)}
              </Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <Text style={[styles.termsText, { fontSize: termsTextFontSize }]}>
            By creating an account, you agree to our{' '}
            <Text 
              style={styles.linkText} 
              onPress={handleShowTerms}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text 
              style={styles.linkText}
              onPress={handleShowPrivacy}
            >
              Privacy Policy
            </Text>
          </Text>

     
          <TouchableOpacity
            style={[
              styles.createAccountButton, 
              { width: availableWidth * 0.9 },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Create your account"
          >
            <Text style={[styles.createAccountButtonText, { fontSize: buttonTextFontSize }]}>
              {isLoading ? 'Creating Account...' : 'Create Your Account'}
            </Text>
          </TouchableOpacity>
          

          
          {/* Login Link */}
          <Text style={[styles.loginText, { fontSize: bodyTextFontSize }]}>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={handleLoginNavigation}>
              Login
            </Text>
          </Text>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Custom Alert Modal */}
      <AlertModal
        visible={isVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
        onClose={hideAlert}
      />
      {/* Legal Content Modal */}
      <LegalContentModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        contentType={legalContentType}
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
    marginVertical: SPACING.VERTICAL_SMALL,
  },
  title: {
    fontFamily: 'Pacifico',  
    color: '#493628',
    marginBottom: SPACING.VERTICAL_MEDIUM,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.VERTICAL_SMALL,
  },
  input: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: '#E4E0E1',
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#FF6B6B',
    marginTop: 2,
    marginLeft: 5,
  },
  passwordRequirementText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
    marginLeft: 5,
    lineHeight: 16,
  },
  termsText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    lineHeight: 18,
    marginHorizontal: SPACING.VERTICAL_SMALL,
    marginBottom: SPACING.VERTICAL_MEDIUM,
    marginTop: SPACING.VERTICAL_SMALL,
  },
  createAccountButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.VERTICAL_MEDIUM,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createAccountButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },

  loginText: {
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

export default SignUpScreen;

