
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image,
  KeyboardAvoidingView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import { setTabsUI } from '../../config/systemUI';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe, CardForm } from '@stripe/stripe-react-native';


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 20,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 55,
  HEADER_HEIGHT: 100,
  INPUT_HEIGHT: 50,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.06,
  BUTTON_TEXT: 0.045,
  BODY_TEXT: 0.035,
} as const;

const CARD_FORM_STYLE = {
  backgroundColor: '#D6C0B3',
  textColor: '#1F2029',
  placeholderColor: '#797979',
  fontSize: 16,
  fontFamily: 'PoppinsRegular',
  textErrorColor: '#D14343',
  cursorColor: '#AB886D',
  borderWidth: 0,
};

const AddCardPage: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  const { confirmPayment, createPaymentMethod } = useStripe();
  
  
  const amount = params.amount as string;
  const petId = params.petId as string;
  const campaignId = params.campaignId as string;
  const petName = params.petName as string || 'this pet';
  const campaignTitle = params.title as string || 'this campaign';
  const shelterName = params.shelterName as string || 'the shelter';
  const type = params.type as string || 'pet';
  
  
  const displayName = type === 'campaign' ? shelterName : petName;
  
 
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [nameOnCard, setNameOnCard] = useState('');

 
  useEffect(() => {
    setTabsUI();
  }, []);


  
  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const cardFormHeight = Math.max(275, Math.round(height * 0.32));

  
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleProceed = useCallback(async () => {
    if (!cardDetails?.complete || isProcessing) {
      showAlert({
        title: 'Incomplete Card Details',
        message: 'Please complete all card information before proceeding.',
        type: 'error',
        buttonText: 'OK'
      });
      return;
    }

    if (!nameOnCard.trim()) {
      showAlert({
        title: 'Name Required',
        message: 'Please enter the name as it appears on your card.',
        type: 'error',
        buttonText: 'OK'
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const amountNum = parseFloat(amount);
      const paymentIntentRes = await axios.post(
        `${API_BASE_URL}/payments/create-intent`,
        {
          amount: amountNum,
          type: type,
          petId: type === 'pet' ? petId : undefined,
          campaignId: type === 'campaign' ? campaignId : undefined,
          paymentMethod: 'card',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { clientSecret, paymentIntentId } = paymentIntentRes.data;
      
      
      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: nameOnCard.trim(),
          },
        },
      });
      
      if (pmError) {
        throw new Error(pmError.message);
      }
      
     
      const { error: confirmError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });
      
      if (confirmError) {
        throw new Error(confirmError.message);
      }
      
     
      await axios.post(
        `${API_BASE_URL}/payments/confirm`,
        {
          paymentIntentId,
          paymentMethodId: paymentMethod?.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
   
      showAlert({
        title: 'Payment Successful!',
        message: `Thank you for your donation to support ${displayName}! Your payment has been processed successfully.`,
        type: 'success',
        buttonText: 'Continue',
      });
      setTimeout(() => {
        hideAlert();
        router.replace('/profile');
      }, 2500);
    } catch (error: any) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      showAlert({
        title: 'Payment Failed',
        message: message || 'Something went wrong with your payment. Please try again.',
        type: 'error',
        buttonText: 'Try Again',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [cardDetails, nameOnCard, amount, petId, campaignId, displayName, type, showAlert, hideAlert, router, confirmPayment, createPaymentMethod]);


  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.headerBackButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to payment methods"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Add Payment Card
        </Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="receipt-outline" size={24} color="#AB886D" />
              <Text style={styles.summaryTitle}>Payment Summary</Text>
            </View>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Donation Amount:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Supporting:</Text>
                <Text style={styles.summaryValue}>{displayName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Card Information</Text>
            
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name on Card</Text>
              <TextInput
                style={[
                  styles.input,
                ]}
                value={nameOnCard}
                onChangeText={setNameOnCard}
                placeholder=""
                placeholderTextColor="#797979"
                selectionColor="#AB886D"
                autoCapitalize="words"
                autoComplete="cc-name"
                accessibilityLabel="Name on card"
              />
            </View>
            
         
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Details</Text>
            <View style={[styles.cardFormContainer, { minHeight: cardFormHeight }]}>
              <CardForm
                style={[styles.cardForm, { height: cardFormHeight }]}
                placeholders={{
                  number: 'Card number',
                  expiration: 'MM / YY',
                  cvc: 'CVC',
                  postalCode: 'ZIP',
                }}
                cardStyle={CARD_FORM_STYLE}
                onFormComplete={(details) => {
                  setCardDetails(details);
                }}
              />
            </View>
            </View>
          </View>


          <View style={styles.payButtonContainer}>
            <TouchableOpacity
              style={[
                styles.payButton,
                (!cardDetails?.complete || !nameOnCard.trim() || isProcessing) && styles.payButtonDisabled
              ]}
              onPress={handleProceed}
              disabled={!cardDetails?.complete || !nameOnCard.trim() || isProcessing}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${formatCurrency(amount)}`}
              accessibilityState={{ disabled: !cardDetails?.complete || !nameOnCard.trim() || isProcessing }}
            >
              {isProcessing ? (
                <Text style={[styles.payButtonText, { fontSize: buttonTextFontSize }]}>
                  Processing Payment...
                </Text>
              ) : (
                <Text style={[styles.payButtonText, { fontSize: buttonTextFontSize }]}>
                  Pay {formatCurrency(amount)}
                </Text>
              )}
            </TouchableOpacity>
          </View>


          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#51CF66" />
              <Text style={styles.securityTitle}>Your payment is secure</Text>
            </View>
            <Text style={styles.securityText}>
              Your card information is encrypted and processed securely. We never store your complete card details.
            </Text>
          </View>


          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  container: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },

  header: {
    height: DESIGN_CONSTANTS.HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
    borderBottomWidth: 1,
    borderBottomColor: '#D6C0B3',
  },
  headerBackButton: {
    padding: 8,
    marginRight: SPACING.MEDIUM,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#797979',
    resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    flex: 1,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.LARGE,
    paddingBottom: SPACING.EXTRA_LARGE,
  },
  

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginLeft: SPACING.SMALL,
  },
  summaryDetails: {
    gap: SPACING.SMALL,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
  },
  

  formSection: {
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  

  inputContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.SMALL,
  },
  input: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: '#D6C0B3',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputValid: {
    borderColor: '#51CF66',
  },
  
  cardFormContainer: {
    backgroundColor: '#D6C0B3',
    borderRadius: SPACING.MEDIUM,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 275,
    overflow: 'hidden',
  },
  cardForm: {
    height: 275,
    width: '100%',
  },
  
  payButtonContainer: {
    marginVertical: SPACING.LARGE,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  payButtonDisabled: {
    backgroundColor: '#D6C0B3',
    opacity: 0.6,
  },
  payButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  

  securityCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  securityTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
    marginLeft: SPACING.SMALL,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#2E7D32',
    lineHeight: 16,
  },
  
  bottomSpacing: {
    height: 20,
  },
});

export default AddCardPage;



