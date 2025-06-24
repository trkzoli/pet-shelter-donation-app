
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Image,
  BackHandler,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 40,
  BUTTON_HEIGHT: 50,
  BORDER_RADIUS: 20,
  CODE_INPUT_SIZE: 60,
  CODE_INPUT_BORDER_RADIUS: 15,
  BACK_BUTTON_TOP: 50,
} as const;

const FONT_RATIOS = {
  TITLE: 0.08,
  SUBTITLE: 0.04,
  BUTTON_TEXT: 0.045,
  BODY_TEXT: 0.035,
  CODE_TEXT: 0.06,
} as const;

const SPACING = {
  VERTICAL_SMALL: 10,
  VERTICAL_MEDIUM: 15,
  VERTICAL_LARGE: 30,
  CONTAINER_BOTTOM: 50,
} as const;

const VerifyEmailScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { email, userType } = useLocalSearchParams<{ email: string; userType: 'user' | 'shelter' }>();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  

  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  

  const inputRefs = useRef<TextInput[]>([]);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  
  const availableWidth = width - DESIGN_CONSTANTS.HORIZONTAL_PADDING;
  const titleFontSize = availableWidth * FONT_RATIOS.TITLE;
  const subtitleFontSize = availableWidth * FONT_RATIOS.SUBTITLE;
  const buttonTextFontSize = availableWidth * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = availableWidth * FONT_RATIOS.BODY_TEXT;
  const codeTextFontSize = availableWidth * FONT_RATIOS.CODE_TEXT;

  const handleBack = useCallback(() => {
    if (userType === 'shelter') {
      router.push('/signup-shelter');
    } else {
      router.push('/signup');
    }
  }, [router, userType]);

  const handleCodeChange = useCallback((value: string, index: number) => {

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

 
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

   
  }, [code]);

  const handleKeyPress = useCallback((key: string, index: number) => {
   
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const shakeInputs = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  const handleVerifyCode = useCallback(async () => {
    const codeToVerify = code.join('');
    if (codeToVerify.length !== 4) {
      showAlert({
        title: 'Incomplete Code',
        message: 'Please enter all 4 digits of your verification code.',
        type: 'warning',
        buttonText: 'OK'
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email,
        code: codeToVerify,
      });
      
    
      if (response.data.accessToken) {
        await AsyncStorage.setItem('token', response.data.accessToken);
      }
      
      showAlert({
        title: 'Email Verified!',
        message: 'Your email has been successfully verified. Please log in to continue.',
        type: 'success',
        buttonText: 'Continue'
      });
      setTimeout(() => {
        hideAlert();
        
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      shakeInputs();
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message || 'Verification failed. Please try again.';
        showAlert({
          title: 'Invalid Code',
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
  }, [code, userType, router, showAlert, hideAlert, shakeInputs, email]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      
      await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email,
      });
      showAlert({
        title: 'Code Sent!',
        message: 'A new verification code has been sent to your email.',
        type: 'success',
        buttonText: 'OK'
      });
      setResendCooldown(60);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message || 'Failed to resend verification code. Please try again.';
        showAlert({
          title: 'Resend Failed',
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
    }
  }, [resendCooldown, showAlert, email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [handleBack]);


  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
    'your email';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to signup"
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
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Verify Your Email
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
            We've sent a 4-digit verification code to
          </Text>
          <Text style={[styles.emailText, { fontSize: subtitleFontSize }]}>
            {maskedEmail}
          </Text>

          {/* Code Input Fields */}
          <Animated.View 
            style={[
              styles.codeContainer,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  { 
                    fontSize: codeTextFontSize,
                    borderColor: digit ? '#AB886D' : '#797979',
                    backgroundColor: digit ? '#D6C0B3' : '#E4E0E1',
                  }
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                textAlignVertical="center" 
                selectTextOnFocus
                accessibilityLabel={`Verification code digit ${index + 1}`}
                accessibilityHint="Enter one digit of your verification code"
              />
            ))}
          </Animated.View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              { 
                width: availableWidth * 0.9,
                opacity: code.every(digit => digit !== '') ? 1 : 0.6
              },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleVerifyCode}
            disabled={isLoading || !code.every(digit => digit !== '')}
            accessibilityRole="button"
            accessibilityLabel="Verify email with entered code"
            accessibilityState={{ disabled: isLoading || !code.every(digit => digit !== '') }}
          >
            <Text style={[styles.verifyButtonText, { fontSize: buttonTextFontSize }]}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { fontSize: bodyTextFontSize }]}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendCooldown > 0}
              accessibilityRole="button"
              accessibilityLabel={resendCooldown > 0 ? `Resend code in ${resendCooldown} seconds` : 'Resend verification code'}
            >
              <Text 
                style={[
                  styles.resendLink,
                  { 
                    fontSize: bodyTextFontSize,
                    color: resendCooldown > 0 ? '#797979' : '#493628'
                  }
                ]}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text style={[styles.helpText, { fontSize: bodyTextFontSize }]}>
            Check your spam folder if you don't see the email
          </Text>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: SPACING.VERTICAL_LARGE,
    paddingBottom: SPACING.CONTAINER_BOTTOM,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.CONTAINER_BOTTOM,
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.VERTICAL_MEDIUM,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: SPACING.VERTICAL_LARGE,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: SPACING.VERTICAL_LARGE,
  },
  codeInput: {
    width: DESIGN_CONSTANTS.CODE_INPUT_SIZE,
    height: DESIGN_CONSTANTS.CODE_INPUT_SIZE,
    borderRadius: DESIGN_CONSTANTS.CODE_INPUT_BORDER_RADIUS,
    borderWidth: 2,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',

    
    alignContent: 'center',
    justifyContent: 'center',
    includeFontPadding: false, 
    paddingTop: Platform.OS === 'ios' ? 0 : 4, 
    
  },
  verifyButton: {
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
  verifyButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.VERTICAL_MEDIUM,
  },
  resendText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  resendLink: {
    fontFamily: 'PoppinsBold',
    textDecorationLine: 'underline',
  },
  helpText: {
    fontFamily: 'PoppinsItalic',
    color: '#797979',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default VerifyEmailScreen;