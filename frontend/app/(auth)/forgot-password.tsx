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
import { useRouter } from 'expo-router';
import ForgotPasswordSuccessModal from '../../components/modals/ForgotPasswordSuccessModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 40,
  INPUT_HEIGHT: 50,
  BUTTON_HEIGHT: 50,
  BORDER_RADIUS: 20,
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

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldsTouched, setFieldsTouched] = useState({
    email: false,
  });


  const availableWidth = width - DESIGN_CONSTANTS.HORIZONTAL_PADDING;
  const titleFontSize = availableWidth * FONT_RATIOS.TITLE;
  const buttonTextFontSize = availableWidth * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = availableWidth * FONT_RATIOS.BODY_TEXT;

  
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailBorderColor = () => {
    if (!fieldsTouched.email) return '#797979';
    if (!email) return '#797979';
    return isValidEmail(email) ? '#51CF66' : '#FF6B6B';
  };


  const handleBack = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handleEmailBlur = useCallback(() => {
    setFieldsTouched(prev => ({ ...prev, email: true }));
  }, []);

  const handleSendResetLink = useCallback(async () => {
    if (!email.trim() || !isValidEmail(email)) {
      return;
    }
    setIsLoading(true);
    try {

      await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        
      } else {
  
      }
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
  }, []);


  useEffect(() => {
    const onBackPress = () => {
      router.push('/login');
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
          accessibilityLabel="Go back to login screen"
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
   
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Forgot Password?
          </Text>

          
          <Text style={[styles.description, { fontSize: bodyTextFontSize }]}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </Text>
          
         
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.emailInput,
                { 
                  width: availableWidth * 0.9,
                  borderColor: getEmailBorderColor()
                }
              ]}
              placeholder="Enter your email address"
              placeholderTextColor="#6B6B6B"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
              accessibilityHint="Enter the email associated with your account"
            />
            {fieldsTouched.email && email && !isValidEmail(email) && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

    
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                width: availableWidth * 0.9,
                opacity: email && isValidEmail(email) ? 1 : 0.5,
                backgroundColor: email && isValidEmail(email) ? '#AB886D' : '#D6C0B3',
              }
            ]}
            onPress={handleSendResetLink}
            disabled={!email || !isValidEmail(email) || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Send password reset link"
            accessibilityState={{ disabled: !email || !isValidEmail(email) || isLoading }}
          >
            <Text style={[styles.sendButtonText, { fontSize: buttonTextFontSize }]}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

         
          <Text style={[styles.helpText, { fontSize: bodyTextFontSize }]}>
            Check your spam folder if you don't receive the email within a few minutes.
          </Text>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>


      <ForgotPasswordSuccessModal
        visible={showSuccessModal}
        email={email}
        onClose={handleSuccessModalClose}
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
    paddingTop: SPACING.VERTICAL_LARGE * 3, 
    paddingBottom: SPACING.CONTAINER_BOTTOM,
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.VERTICAL_MEDIUM,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.VERTICAL_LARGE,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: SPACING.VERTICAL_LARGE,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#493628',
    marginBottom: 8,
  },
  emailInput: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: '#E4E0E1',
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#FF6B6B',
    marginTop: 2,
    marginLeft: 5,
  },
  sendButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.VERTICAL_LARGE,
  },
  sendButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  helpText: {
    fontFamily: 'PoppinsItalic',
    color: '#797979',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ForgotPasswordScreen;