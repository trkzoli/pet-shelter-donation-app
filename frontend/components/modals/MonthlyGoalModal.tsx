import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AlertModal from '../modals/AlertModal';
import { useAlertModal } from '../../hooks/useAlertModal';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 45,
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
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  WARNING_YELLOW: '#FFD43B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
  INPUT_BORDER: '#E0E0E0',
  
};

const FONT_RATIOS = {
  TITLE: 0.045,
  BODY_TEXT: 0.035,
  LABEL_TEXT: 0.032,
  BUTTON_TEXT: 0.042,
} as const;

interface MonthlyGoalsData {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
  total: number;
}

interface GoalPercentages {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
}

interface MonthlyGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MonthlyGoalsData) => void;
  initialData?: Partial<MonthlyGoalsData>;
  mode: 'create' | 'update'; 
  petName?: string; 
  isLoading?: boolean;
}

const MonthlyGoalsModal: React.FC<MonthlyGoalsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData = {},
  mode,
  petName = 'this pet',
  isLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [goalData, setGoalData] = useState<MonthlyGoalsData>({
    vaccination: 0,
    food: 0,
    medical: 0,
    other: 0,
    total: 0,
    ...initialData,
  });

  useEffect(() => {
    setGoalData(prev => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const calculatedData = useMemo(() => {
    const total = goalData.vaccination + goalData.food + goalData.medical + goalData.other;
    
    const percentages: GoalPercentages = {
      vaccination: total > 0 ? (goalData.vaccination / total) * 100 : 0,
      food: total > 0 ? (goalData.food / total) * 100 : 0,
      medical: total > 0 ? (goalData.medical / total) * 100 : 0,
      other: total > 0 ? (goalData.other / total) * 100 : 0,
    };

    return {
      total,
      percentages,
    };
  }, [goalData]);

  const isFormValid = calculatedData.total > 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleInputChange = useCallback((field: keyof MonthlyGoalsData, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setGoalData(prev => ({
      ...prev,
      [field]: numericValue,
      total: field === 'total' ? prev.total : (
        (field === 'vaccination' ? numericValue : prev.vaccination) +
        (field === 'food' ? numericValue : prev.food) +
        (field === 'medical' ? numericValue : prev.medical) +
        (field === 'other' ? numericValue : prev.other)
      ),
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!isFormValid) {
      showAlert({
        title: 'Invalid Goals',
        message: 'Please set at least one care category with an amount greater than $0.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }

    const finalData = {
      ...goalData,
      total: calculatedData.total,
    };

    onSave(finalData);
  }, [goalData, calculatedData.total, isFormValid, onSave, showAlert]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);



  const renderCategoryInput = (
    field: keyof MonthlyGoalsData,
    label: string,
    description: string,
    placeholder: string = '0.00'
  ) => {
    if (field === 'total') return null; 
    
    const percentage = calculatedData.percentages[field as keyof GoalPercentages];
   
    return (
      <View style={styles.inputGroup}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
           
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              {label}
            </Text>
          </View>
          <Text style={[styles.categoryPercentage, { fontSize: labelTextFontSize }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
        
        <Text style={[styles.categoryDescription, { fontSize: labelTextFontSize }]}>
          {description}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.currencySymbol, { fontSize: bodyTextFontSize }]}>$</Text>
          <TextInput
            style={[styles.textInput, { fontSize: bodyTextFontSize }]}
            value={goalData[field].toString()}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder}
            placeholderTextColor={COLORS.GRAY_DARK}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    );
  };

  const renderPercentageBreakdown = () => (
    <View style={styles.breakdownContainer}>
      <Text style={[styles.breakdownTitle, { fontSize: titleFontSize }]}>
        Donation Distribution
      </Text>
      <Text style={[styles.breakdownDescription, { fontSize: labelTextFontSize }]}>
        When someone donates $10, it will be split as follows:
      </Text>
      
      <View style={styles.breakdownGrid}>
        {Object.entries(calculatedData.percentages).map(([category, percentage]) => {
          const labels = {
            vaccination: 'Vaccination & Deworming',
            food: 'Food & Nutrition', 
            medical: 'Medical Care',
            other: 'Other Expenses',
          };
          
          const donationAmount = (10 * percentage) / 100;
          
          
          if (percentage === 0) return null;
          
          return (
            <View key={category} style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <View style={[styles.categoryColorIndicator]} />
                <Text style={[styles.breakdownItemLabel, { fontSize: labelTextFontSize }]}>
                  {labels[category as keyof typeof labels]}
                </Text>
              </View>
              <View style={styles.breakdownItemValues}>
                <Text style={[styles.breakdownItemPercentage, { fontSize: labelTextFontSize }]}>
                  {percentage.toFixed(1)}%
                </Text>
                <Text style={[styles.breakdownItemAmount, { fontSize: labelTextFontSize }]}>
                  {formatCurrency(donationAmount)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>

        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { fontSize: titleFontSize }]}>
            {mode === 'create' ? 'Set Monthly Care Goals' : 'Update Monthly Goals'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.modalSaveButton}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[
              styles.modalSaveText,
              { fontSize: buttonTextFontSize },
              (!isFormValid || isLoading) && styles.modalSaveTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

          <Text style={[styles.modalDescription, { fontSize: bodyTextFontSize }]}>
            {mode === 'create' 
              ? `Set the monthly care costs for ${petName}. These amounts will help donors understand how their contributions help.`
              : `Update the monthly care goals for ${petName}. Goals can be updated once every 31 days.`
            }
          </Text>


          {renderCategoryInput(
            'vaccination',
            'Vaccination & Deworming',
            'Monthly costs for vaccines, deworming, and preventive treatments'
          )}

          {renderCategoryInput(
            'food',
            'Food & Nutrition',
            'Monthly food costs including special dietary needs'
          )}

          {renderCategoryInput(
            'medical',
            'Medical Care',
            'Ongoing medical treatments, medications, and veterinary visits'
          )}

          {renderCategoryInput(
            'other',
            'Other Expenses',
            'Toys, bedding, grooming, and other care essentials'
          )}


          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { fontSize: titleFontSize }]}>
              Total Monthly Goal
            </Text>
            <Text style={[styles.totalAmount, { fontSize: titleFontSize }]}>
              {formatCurrency(calculatedData.total)}
            </Text>
          </View>

 
          {calculatedData.total > 0 && renderPercentageBreakdown()}

  
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.PRIMARY_BROWN} />
            <Text style={[styles.infoText, { fontSize: labelTextFontSize }]}>
              Donations will be automatically distributed across categories based on these percentages. 
              You can update these goals once every 31 days to keep them current.
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  modalCloseButton: {
    padding: SPACING.SMALL,
  },
  modalTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  modalSaveButton: {
    padding: SPACING.SMALL,
  },
  modalSaveText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  modalSaveTextDisabled: {
    color: COLORS.GRAY_DARK,
  },
  modalContent: {
    flex: 1,
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  modalDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.EXTRA_LARGE,
    lineHeight: 22,
  },

  inputGroup: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  categoryPercentage: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  categoryDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  currencySymbol: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    paddingLeft: SPACING.MEDIUM,
  },
  textInput: {
    flex: 1,
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    paddingHorizontal: SPACING.SMALL,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
  },

  totalContainer: {
    backgroundColor: COLORS.PRIMARY_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    alignItems: 'center',
    marginBottom: SPACING.EXTRA_LARGE,
  },
  totalLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.CARD_BACKGROUND,
    marginBottom: SPACING.SMALL,
  },
  totalAmount: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },

  breakdownContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.EXTRA_LARGE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  breakdownTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
  },
  breakdownDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  breakdownGrid: {
    gap: SPACING.MEDIUM,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
    flex: 1,
  },
  breakdownItemLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
  },
  breakdownItemValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
  },
  breakdownItemPercentage: {
    fontFamily: 'PoppinsBold',
    color: COLORS.GRAY_DARK,
    minWidth: 50,
    textAlign: 'right',
  },
  breakdownItemAmount: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    minWidth: 60,
    textAlign: 'right',
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    
    gap: SPACING.SMALL,
  },
  infoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
    flex: 1,
  },

  bottomSpacing: {
    height: 40,
  },
});

export default MonthlyGoalsModal;