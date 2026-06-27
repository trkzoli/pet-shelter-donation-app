import React, { useState, useCallback } from 'react';
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
import  AlertModal  from './AlertModal';
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

const REMOVAL_REASONS = [
  {
    id: 'deceased',
    label: 'Pet has passed away',
    description: 'The pet has sadly crossed the rainbow bridge',
    requiresExplanation: false,
  },
];

interface RemovalConfirmationData {
  reason: 'deceased' | 'other';
  explanation?: string; 
}

interface RemovePetModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: RemovalConfirmationData) => void;
  petName: string;
  totalDonated: number;
  isLoading?: boolean;
}

const RemovePetModal: React.FC<RemovePetModalProps> = ({
  visible,
  onClose,
  onConfirm,
  petName,
  totalDonated,
  isLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [selectedReason, setSelectedReason] = useState<'deceased' | 'other' | null>(null);
  const [explanation, setExplanation] = useState<string>('');


  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const isFormValid = selectedReason && 
    (selectedReason === 'deceased' || (selectedReason === 'other' && explanation.trim()));

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleConfirm = useCallback(() => {
    if (!isFormValid) {
      showAlert({
        title: 'Missing Information',
        message: selectedReason === 'other' 
          ? 'Please provide an explanation for the removal.'
          : 'Please select a reason for removing the pet.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }

    const confirmationData: RemovalConfirmationData = {
      reason: selectedReason!,
      explanation: selectedReason === 'other' ? explanation.trim() : undefined,
    };

    onConfirm(confirmationData);
  }, [selectedReason, explanation, isFormValid, onConfirm, showAlert]);

  const handleClose = useCallback(() => {

    setSelectedReason(null);
    setExplanation('');
    onClose();
  }, [onClose]);

  const handleReasonSelect = useCallback((reason: 'deceased' | 'other') => {
    setSelectedReason(reason);
    if (reason === 'deceased') {
      setExplanation('');
    }
  }, []);

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
            Remove Pet
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalDescription, { fontSize: bodyTextFontSize }]}>
            Warning: marking {petName} as passed away removes them permanently. This action cannot be undone, and {petName} can never be added back to the app.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Reason for Removal *
            </Text>

            {REMOVAL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.id && styles.reasonOptionSelected
                ]}
                onPress={() => handleReasonSelect(reason.id as 'deceased' | 'other')}
              >
                <Ionicons 
                  name={selectedReason === reason.id ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={selectedReason === reason.id ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
                />
                <View style={styles.reasonTextContainer}>
                  <Text style={[styles.reasonTitle, { fontSize: bodyTextFontSize }]}>
                    {reason.label}
                  </Text>
                  <Text style={[styles.reasonDescription, { fontSize: labelTextFontSize }]}>
                    {reason.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedReason === 'other' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
                Please Explain *
              </Text>
              <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
                Provide details about why the pet needs to be removed
              </Text>
              
              <TextInput
                style={[styles.textAreaInput, { fontSize: bodyTextFontSize }]}
                value={explanation}
                onChangeText={setExplanation}
                placeholder="Describe the reason for removal..."
                placeholderTextColor={COLORS.GRAY_DARK}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.PRIMARY_BROWN} />
            <Text style={[styles.infoText, { fontSize: labelTextFontSize }]}>
              Donors will receive the news about {petName}'s passing, with a heartfelt thank you for helping make their life better.
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !isFormValid && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[
              styles.confirmButtonText,
              { fontSize: buttonTextFontSize },
              !isFormValid && styles.confirmButtonTextDisabled
            ]}>
              {isLoading ? 'Processing...' : 'Confirm Removal'}
            </Text>
          </TouchableOpacity>
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
  headerSpacer: {
    width: 44,
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

  section: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  sectionDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 18,
  },

  reasonOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  reasonOptionSelected: {
    borderColor: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  reasonDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },

  textAreaInput: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    minHeight: 100,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    textAlignVertical: 'top',
  },

  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_BROWN,
    gap: SPACING.SMALL,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  warningText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_BROWN,
    gap: SPACING.SMALL,
  },
  infoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
    flex: 1,
  },

  buttonContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  confirmButton: {
    backgroundColor: COLORS.ERROR_RED,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  confirmButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  confirmButtonTextDisabled: {
    color: COLORS.GRAY_DARK,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default RemovePetModal;