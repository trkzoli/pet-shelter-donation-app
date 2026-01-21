import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  Platform,
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
  PAYMENT_OPTION_HEIGHT: 80,
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
  BODY_TEXT: 0.04,
} as const;

const PaymentMethodsPage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  
  const amount = params.amount as string;
  const petId = params.petId as string;
  const campaignId = params.campaignId as string;
  const petName = params.petName as string || 'this pet';
  const campaignTitle = params.campaignTitle as string || 'this campaign';
  const shelterName = params.shelterName as string || 'the shelter';
  const type = params.type as string || 'pet';
  
  const displayName = type === 'campaign' ? shelterName : petName;

  useEffect(() => {
    setTabsUI();
  }, []);

  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;


  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleCardPayment = useCallback(() => {
    router.push({
      pathname: '/payment/add-card',
      params: {
        amount,
        petId,
        campaignId,
        petName,
        title: campaignTitle,
        shelterName,
        type,
      },
    });
  }, [amount, petId, campaignId, petName, campaignTitle, shelterName, type, router]);

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
          accessibilityLabel="Go back to donation amount"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Payment Method
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Secure Card Payment</Text>
          <TouchableOpacity 
            style={styles.cardPaymentOption}
            onPress={handleCardPayment}
            accessibilityRole="button"
            accessibilityLabel="Pay with credit or debit card"
          >
            <View style={styles.cardPaymentContent}>
              <Image 
                source={require('../../assets/images/bankcard.png')} 
                style={styles.cardIcon} 
              />
              <View style={styles.cardPaymentText}>
                <Text style={styles.cardPaymentTitle}>Credit & Debit Card</Text>
                <Text style={styles.cardPaymentSubtitle}>Visa, Mastercard, American Express</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#797979" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#51CF66" />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your payment details.
          </Text>
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

  paymentSection: {
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },

  cardPaymentOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardPaymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginRight: SPACING.MEDIUM,
    resizeMode: 'contain',
  },
  cardPaymentText: {
    flex: 1,
  },
  cardPaymentTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
    marginBottom: 2,
  },
  cardPaymentSubtitle: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
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

export default PaymentMethodsPage;


