import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import { setTabsUI } from '../../config/systemUI';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 20,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 55,
  HEADER_HEIGHT: 100,
  INPUT_HEIGHT: 60,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.06,
  AMOUNT_TEXT: 0.08,
  BUTTON_TEXT: 0.045,
  BODY_TEXT: 0.035,
} as const;

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

const DonatePage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const type = (params.type as string) || 'pet';
  const petId = params.petId as string;
  const campaignId = params.bannerId as string;
  const petName = params.petName as string || 'this pet';
  const campaignTitle = params.title as string || 'this campaign';
  const shelterName = params.shelterName as string || 'the shelter';

  const [donationAmount, setDonationAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTabsUI();
  }, []);


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const amountTextFontSize = width * FONT_RATIOS.AMOUNT_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;

  const isValidAmount = useCallback((amount: string): boolean => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= 1 && numAmount <= 10000;
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAmountChange = useCallback((value: string) => {   
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setDonationAmount(cleanValue);
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setDonationAmount(amount.toString());
  }, []);

  const handleProceed = useCallback(async () => {
    if (!isValidAmount(donationAmount)) {
      showAlert({
        title: 'Invalid Amount',
        message: 'Please enter a donation amount between $1 and $10,000.',
        type: 'warning',
        buttonText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    try {
      router.push({
        pathname: '/payment/payment-methods',
        params: {
          amount: donationAmount,
          petId: type === 'pet' ? petId : '',
          campaignId: type === 'campaign' ? campaignId : '',
          petName: petName,
          campaignTitle: campaignTitle,
          shelterName: shelterName,
          type: type,
        },
      });
    } catch (error) {
      console.error('Navigation failed:', error);
      showAlert({
        title: 'Navigation Error',
        message: 'Something went wrong. Please try again.',
        type: 'error',
        buttonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  }, [donationAmount, petId, campaignId, petName, campaignTitle, shelterName, router, showAlert, isValidAmount, type]);

  
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
          accessibilityLabel="Go back"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Make a Donation
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

  
        <View style={styles.quickAmountsCard}>
          <Text style={styles.quickAmountsTitle}>Quick Select</Text>
          <View style={styles.quickAmountsGrid}>
            {QUICK_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  donationAmount === amount.toString() && styles.quickAmountButtonSelected
                ]}
                onPress={() => handleQuickAmount(amount)}
                accessibilityRole="button"
                accessibilityLabel={`Select $${amount} donation`}
              >
                <Text style={[
                  styles.quickAmountText,
                  donationAmount === amount.toString() && styles.quickAmountTextSelected
                ]}>
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        <View style={styles.customAmountCard}>
          <Text style={styles.customAmountTitle}>Custom Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.amountInput, { fontSize: amountTextFontSize }]}
              value={donationAmount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#797979"
              keyboardType="decimal-pad"
              maxLength={8}
              returnKeyType="done"
              accessibilityLabel="Enter custom donation amount"
              accessibilityHint="Enter amount in dollars"
            />
          </View>
          

  
          <TouchableOpacity
            style={[
              styles.proceedButton,
              (!donationAmount || !isValidAmount(donationAmount)) && styles.proceedButtonDisabled
            ]}
            onPress={handleProceed}
            disabled={!donationAmount || !isValidAmount(donationAmount) || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Proceed to payment methods"
            accessibilityState={{ disabled: !donationAmount || !isValidAmount(donationAmount) || isLoading }}
          >
            {isLoading ? (
              <Text style={[styles.proceedButtonText, { fontSize: buttonTextFontSize }]}>
                Processing...
              </Text>
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#E4E0E1" style={{ marginRight: 8 }} />
                <Text style={[styles.proceedButtonText, { fontSize: buttonTextFontSize }]}>
                  Proceed to Payment
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>


        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#AB886D" />
            <Text style={styles.infoTitle}>Donation Information</Text>
          </View>
          <View style={styles.infoItems}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>• 90% of your donation goes directly to the shelter</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>• 10% supports app development & maintenance</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>• All donations are tax-deductible</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>• Donations help you qualify for real adoption</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>• Earn PawPoints: 1 point per $25 donated</Text>
            </View>
          </View>
        </View>


        <View style={styles.bottomSpacing} />
      </ScrollView>

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
  
  
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.LARGE,
    paddingBottom: SPACING.EXTRA_LARGE,
  },
  

  donationInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  donationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  donationInfoTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginLeft: SPACING.SMALL,
  },
  donationInfoText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 20,
    marginBottom: SPACING.LARGE,
  },
  impactInfo: {
    gap: SPACING.SMALL,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginLeft: SPACING.SMALL,
  },
  
  quickAmountsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickAmountsTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '18%',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    backgroundColor: '#AB886D',
    borderColor: '#AB886D',
  },
  quickAmountText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  quickAmountTextSelected: {
    color: '#E4E0E1',
  },

  customAmountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  customAmountTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.MEDIUM,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: SPACING.LARGE,
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginRight: SPACING.SMALL,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    paddingVertical: 0,
  },
  
  
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginTop: SPACING.LARGE,
  },
  proceedButtonDisabled: {
    backgroundColor: '#D6C0B3',
    opacity: 0.6,
  },
  proceedButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },

  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginLeft: SPACING.SMALL,
  },
  infoItems: {
    gap: SPACING.SMALL,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 18,
    flex: 1,
  },
  
  
  bottomSpacing: {
    height: 20,
  },
});

export default DonatePage;

