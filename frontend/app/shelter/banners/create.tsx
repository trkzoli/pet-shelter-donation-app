import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../../components/modals';
import { useAlertModal } from '../../../hooks/useAlertModal';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 45,
  HEADER_HEIGHT: 120,
  BACK_BUTTON_TOP: 50,
} as const;

const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
} as const;

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D', 
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  DONATE_ORANGE: '#FF8C42',
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  WARNING_YELLOW: '#FFD43B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
  INPUT_BORDER: '#E0E0E0',
};

interface BannerFormData {
  title: string;
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  duration: 1 | 2 | 3 | 4; 
  targetAmount: string;
}



const DURATION_OPTIONS = [
  { weeks: 1, label: '1 Week', feeModifier: 0.5 }, 
  { weeks: 2, label: '2 Weeks', feeModifier: 1 }, 
  { weeks: 3, label: '3 Weeks', feeModifier: 1.5 }, 
  { weeks: 4, label: '1 Month', feeModifier: 2 },
] as const;


const URGENCY_LEVELS = [
  { 
    id: 'low', 
    label: 'Low Priority', 
    color: COLORS.SUCCESS_GREEN, 
    feeModifier: 0.5,
    description: 'Standard listing',
    priority: 4 
  },
  { 
    id: 'medium', 
    label: 'Medium Priority', 
    color: COLORS.WARNING_YELLOW, 
    feeModifier: 1, 
    description: 'Enhanced visibility',
    priority: 3 
  },
  { 
    id: 'high', 
    label: 'High Priority', 
    color: COLORS.DONATE_ORANGE, 
    feeModifier: 1.5,  
    description: 'High visibility',
    priority: 2 
  },
  { 
    id: 'critical', 
    label: 'Critical', 
    color: COLORS.ERROR_RED, 
    feeModifier: 2,
    description: 'Top 4 positions guaranteed',
    priority: 1 
  },
] as const;

const BASE_FEE = 10; 
const BASE_MODIFIER = 0.5; 

interface BannerCreatePageProps {}

const BannerCreatePage: React.FC<BannerCreatePageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    urgencyLevel: 'low',
    duration: 1,
    targetAmount: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});

  const titleFontSize = width * 0.055;
  const sectionTitleFontSize = width * 0.045;
  const bodyFontSize = width * 0.035;
  const labelFontSize = width * 0.032;

  const feeCalculation = useMemo(() => {
    const selectedDuration = DURATION_OPTIONS.find(d => d.weeks === formData.duration);
    const selectedUrgency = URGENCY_LEVELS.find(u => u.id === formData.urgencyLevel);
    
    const durationFee = BASE_MODIFIER + (selectedDuration?.feeModifier || 0);
    const urgencyFee = BASE_MODIFIER + (selectedUrgency?.feeModifier || 0);
    const totalFeePercentage = BASE_FEE + durationFee + urgencyFee;
    
    const targetAmountNum = parseFloat(formData.targetAmount) || 0;
    const feeAmount = targetAmountNum * (totalFeePercentage / 100);
    const netAmount = targetAmountNum - feeAmount;
    
    return {
      percentage: totalFeePercentage,
      amount: feeAmount,
      net: netAmount,
      breakdown: {
        base: BASE_FEE,
        duration: durationFee,
        urgency: urgencyFee,
      }
    };
  }, [formData.duration, formData.urgencyLevel, formData.targetAmount]);

  const handleInputChange = useCallback((field: keyof BannerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);


  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Campaign title is required';
    else if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';

    

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

    if (!formData.targetAmount) newErrors.targetAmount = 'Target amount is required';
    else if (parseFloat(formData.targetAmount) < 50) newErrors.targetAmount = 'Minimum target amount is $50';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  const handleNext = useCallback(() => {
    if (!validateForm()) {
      showAlert({
        title: 'Form Incomplete',
        message: 'Please fill in all required fields before proceeding to preview.',
        type: 'error',
        buttonText: 'OK'
      });
      return;
    }

    router.push({
      pathname: '/shelter/banners/preview',
      params: {
        bannerData: JSON.stringify(formData),
        feeInfo: JSON.stringify(feeCalculation),
      }
    });
  }, [formData, feeCalculation, validateForm, showAlert, router]);

  const selectedUrgency = URGENCY_LEVELS.find(u => u.id === formData.urgencyLevel);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image source={require('../../../assets/images/backB.png')} 
            style={styles.backIcon} />
              
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
              Create Banner Campaign
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>


        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
              Basic Information
            </Text>


            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>
                Campaign Title *
              </Text>
              <TextInput
                style={[styles.textInput, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholder="e.g., Emergency Medical Funds"
                placeholderTextColor={COLORS.GRAY_DARK}
                maxLength={80}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              <Text style={styles.characterCount}>{formData.title.length}/80</Text>
            </View>

            

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>
                Detailed Description *
              </Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Explain why you need this funding, how it will be used, and the impact it will have..."
                placeholderTextColor={COLORS.GRAY_DARK}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              <Text style={styles.characterCount}>{formData.description.length}/500</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
              Campaign Settings
            </Text>


            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>
                Urgency Level
              </Text>
              <View style={styles.urgencyContainer}>
                {URGENCY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.urgencyOption,
                      { borderColor: level.color },
                      formData.urgencyLevel === level.id && { backgroundColor: level.color }
                    ]}
                    onPress={() => handleInputChange('urgencyLevel', level.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.urgencyHeader}>
                      <Text style={[
                        styles.urgencyLabel,
                        formData.urgencyLevel === level.id && styles.urgencyLabelSelected
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={[
                        styles.urgencyFee,
                        formData.urgencyLevel === level.id && styles.urgencyFeeSelected
                      ]}>
                        +{level.feeModifier.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={[
                      styles.urgencyDescription,
                      formData.urgencyLevel === level.id && styles.urgencyDescriptionSelected
                    ]}>
                      {level.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>
                Campaign Duration
              </Text>
              <View style={styles.durationContainer}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.weeks}
                    style={[
                      styles.durationOption,
                      formData.duration === option.weeks && styles.durationOptionSelected
                    ]}
                    onPress={() => handleInputChange('duration', option.weeks)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.durationText,
                      formData.duration === option.weeks && styles.durationTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.durationFee,
                      formData.duration === option.weeks && styles.durationFeeSelected
                    ]}>
                      +{option.feeModifier.toFixed(1)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>


            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>
                Target Amount *
              </Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.amountInput, errors.targetAmount && styles.inputError]}
                  value={formData.targetAmount}
                  onChangeText={(text) => handleInputChange('targetAmount', text.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={COLORS.GRAY_DARK}
                  keyboardType="numeric"
                />
              </View>
              {errors.targetAmount && <Text style={styles.errorText}>{errors.targetAmount}</Text>}
            </View>
          </View>


          {parseFloat(formData.targetAmount) > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
                Fee Breakdown
              </Text>
              
              <View style={styles.feeBreakdownContainer}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Base Fee:</Text>
                  <Text style={styles.feeValue}>{feeCalculation.breakdown.base}%</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Duration Fee ({DURATION_OPTIONS.find(d => d.weeks === formData.duration)?.label}):</Text>
                  <Text style={styles.feeValue}>+{feeCalculation.breakdown.duration.toFixed(1)}%</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Priority Fee ({selectedUrgency?.label}):</Text>
                  <Text style={styles.feeValue}>+{feeCalculation.breakdown.urgency.toFixed(1)}%</Text>
                </View>
                <View style={[styles.feeRow, styles.totalFeeRow]}>
                  <Text style={styles.totalFeeLabel}>Total Fee:</Text>
                  <Text style={styles.totalFeeValue}>{feeCalculation.percentage.toFixed(1)}%</Text>
                </View>
                
                <View style={styles.amountBreakdown}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Campaign Target:</Text>
                    <Text style={styles.amountValue}>${parseFloat(formData.targetAmount).toLocaleString()}</Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Platform Fee:</Text>
                    <Text style={styles.amountValue}>-${feeCalculation.amount.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.amountRow, styles.netAmountRow]}>
                    <Text style={styles.netAmountLabel}>You Receive:</Text>
                    <Text style={styles.netAmountValue}>${feeCalculation.net.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}


          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextButtonText, { fontSize: bodyFontSize }]}>
              Next
            </Text>
          </TouchableOpacity>
          <View style={styles.bottomSpace} />
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
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardContainer: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: SPACING.SMALL,
    
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  headerSpacer: {
    width: 40,
  },
  
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.EXTRA_LARGE,
    paddingBottom: SPACING.HUGE,
  },
  
  
  sectionContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.EXTRA_LARGE,
    paddingBottom: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  

  fieldContainer: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  fieldLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  textInput: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  inputError: {
    borderColor: COLORS.ERROR_RED,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.ERROR_RED,
    marginTop: SPACING.TINY,
  },
  characterCount: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'right',
    marginTop: SPACING.TINY,
  },
  
  
  imageUploadContainer: {
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginTop: SPACING.SMALL,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: SPACING.MEDIUM,
    resizeMode: 'cover',
  },
  

  urgencyContainer: {
    gap: SPACING.MEDIUM,
  },
  urgencyOption: {
    padding: SPACING.LARGE,
    borderWidth: 2,
    borderRadius: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  urgencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  urgencyLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  urgencyLabelSelected: {
    color: COLORS.CARD_BACKGROUND,
  },
  urgencyFee: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: COLORS.GRAY_DARK,
  },
  urgencyFeeSelected: {
    color: COLORS.CARD_BACKGROUND,
  },
  urgencyDescription: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  urgencyDescriptionSelected: {
    color: COLORS.CARD_BACKGROUND,
  },
  

  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MEDIUM,
  },
  durationOption: {
    width: '47%',
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: COLORS.LIGHT_BROWN,
    borderColor: COLORS.LIGHT_BROWN,
  },
  durationText: {
    fontSize: 13,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  durationTextSelected: {
    color: COLORS.CARD_BACKGROUND,
  },
  durationFee: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  durationFeeSelected: {
    color: COLORS.CARD_BACKGROUND,
  },
  
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
    paddingHorizontal: SPACING.LARGE,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginRight: SPACING.SMALL,
  },
  amountInput: {
    flex: 1,
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    fontSize: 18,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  
  feeBreakdownContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.MEDIUM,
    padding: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  feeLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  feeValue: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  totalFeeRow: {
    paddingTop: SPACING.SMALL,
    borderTopWidth: 1,
    borderTopColor: COLORS.INPUT_BORDER,
    marginBottom: SPACING.LARGE,
  },
  totalFeeLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  totalFeeValue: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },

  amountBreakdown: {
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.INPUT_BORDER,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  amountLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  amountValue: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  netAmountRow: {
    paddingTop: SPACING.SMALL,
    borderTopWidth: 1,
    borderTopColor: COLORS.INPUT_BORDER,
  },
  netAmountLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: COLORS.SUCCESS_GREEN,
  },
  netAmountValue: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: COLORS.SUCCESS_GREEN,
  },
  

  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginTop: SPACING.EXTRA_LARGE,
    gap: SPACING.SMALL,
  },
  nextButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.GRAY_DARK,
    resizeMode: 'contain',
  },
  
  imageInfoContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: SPACING.MEDIUM,
    padding: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
  },
  imageInfoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  bottomSpace: {
    paddingBottom: 140,
  },
});

export default BannerCreatePage;

