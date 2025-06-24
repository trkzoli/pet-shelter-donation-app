import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
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
};

const FONT_RATIOS = {
  TITLE: 0.045,
  BODY_TEXT: 0.035,
  LABEL_TEXT: 0.032,
  BUTTON_TEXT: 0.042,
} as const;

interface AdoptionConfirmationData {
  adoptionType: 'app' | 'external';
  selectedAdopterId?: string;
  adoptionDocument?: any; 
  notes?: string;
}

interface AdoptionConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: AdoptionConfirmationData) => void;
  petName: string;
  adoptionRequests?: Array<{
    id: string;
    userName: string;
    userEmail: string;
  }>;
  isLoading?: boolean;
}

const AdoptionConfirmationModal: React.FC<AdoptionConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  petName,
  adoptionRequests = [],
  isLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [adoptionType, setAdoptionType] = useState<'app' | 'external' | null>(null);
  const [selectedAdopterId, setSelectedAdopterId] = useState<string | null>(null);
  const [hasDocument, setHasDocument] = useState<boolean>(false);

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const isFormValid = adoptionType && 
    (adoptionType === 'external' || selectedAdopterId) &&
    hasDocument;


  const handleDocumentUpload = useCallback(() => {

    setHasDocument(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!isFormValid) {
      showAlert({
        title: 'Missing Information',
        message: 'Please select adoption type and upload adoption documentation.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }

    const confirmationData: AdoptionConfirmationData = {
      adoptionType: adoptionType!,
      selectedAdopterId: adoptionType === 'app' ? selectedAdopterId! : undefined,
      adoptionDocument: hasDocument ? 'mock-document' : undefined,
    };

    onConfirm(confirmationData);
  }, [adoptionType, selectedAdopterId, hasDocument, isFormValid, onConfirm, showAlert]);

  const handleClose = useCallback(() => {
    setAdoptionType(null);
    setSelectedAdopterId(null);
    setHasDocument(false);
    onClose();
  }, [onClose]);

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
            Mark as Adopted
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalDescription, { fontSize: bodyTextFontSize }]}>
            Please specify how {petName} was adopted. This will determine the type of success notification sent to donors.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Adoption Method
            </Text>

            <TouchableOpacity
              style={[
                styles.adoptionTypeOption,
                adoptionType === 'app' && styles.adoptionTypeOptionSelected
              ]}
              onPress={() => {
                setAdoptionType('app');
                setSelectedAdopterId(null);
              }}
            >
              <Ionicons 
                name={adoptionType === 'app' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={adoptionType === 'app' ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
              />
              <View style={styles.adoptionTypeTextContainer}>
                <Text style={[styles.adoptionTypeTitle, { fontSize: bodyTextFontSize }]}>
                  Adopted through App
                </Text>
                <Text style={[styles.adoptionTypeDescription, { fontSize: labelTextFontSize }]}>
                  One of the users who requested adoption was approved
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.adoptionTypeOption,
                adoptionType === 'external' && styles.adoptionTypeOptionSelected
              ]}
              onPress={() => {
                setAdoptionType('external');
                setSelectedAdopterId(null);
              }}
            >
              <Ionicons 
                name={adoptionType === 'external' ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={adoptionType === 'external' ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
              />
              <View style={styles.adoptionTypeTextContainer}>
                <Text style={[styles.adoptionTypeTitle, { fontSize: bodyTextFontSize }]}>
                  Adopted Externally
                </Text>
                <Text style={[styles.adoptionTypeDescription, { fontSize: labelTextFontSize }]}>
                  Pet was adopted through direct contact or other means
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {adoptionType === 'app' && adoptionRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
                Select Adopter
              </Text>
              <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
                Choose which user was approved for adoption
              </Text>

              {adoptionRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={[
                    styles.adopterOption,
                    selectedAdopterId === request.id && styles.adopterOptionSelected
                  ]}
                  onPress={() => setSelectedAdopterId(request.id)}
                >
                  <Ionicons 
                    name={selectedAdopterId === request.id ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedAdopterId === request.id ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
                  />
                  <View style={styles.adopterInfo}>
                    <Text style={[styles.adopterName, { fontSize: bodyTextFontSize }]}>
                      {request.userName}
                    </Text>
                    <Text style={[styles.adopterEmail, { fontSize: labelTextFontSize }]}>
                      {request.userEmail}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Adoption Documentation *
            </Text>
            <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
              Please upload adoption papers or documentation to verify the adoption
            </Text>

            <TouchableOpacity
              style={[
                styles.documentUploadButton,
                hasDocument && styles.documentUploadButtonSuccess
              ]}
              onPress={handleDocumentUpload}
            >
              <Ionicons 
                name={hasDocument ? "checkmark-circle" : "document-attach-outline"} 
                size={20} 
                color={COLORS.PRIMARY_BROWN} 
              />
              <Text style={[
                styles.documentUploadText,
                { fontSize: bodyTextFontSize },
                hasDocument && styles.documentUploadTextSuccess
              ]}>
                {hasDocument ? 'Document Uploaded' : 'Upload Documents'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.documentNote, { fontSize: labelTextFontSize }]}>
              Upload adoption contracts, certificates, or any official documentation
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
              {isLoading ? 'Processing...' : 'Confirm Adoption'}
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
  adoptionTypeOption: {
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
  adoptionTypeOptionSelected: {
    borderColor: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.LIGHT_BROWN,
  },
  adoptionTypeTextContainer: {
    flex: 1,
  },
  adoptionTypeTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  adoptionTypeDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    lineHeight: 18,
  },

  adopterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  adopterOptionSelected: {
    borderColor: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.LIGHT_BROWN,
  },
  adopterInfo: {
    flex: 1,
  },
  adopterName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  adopterEmail: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN
  },


  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_BROWN,
    borderStyle: 'dashed',
    paddingVertical: SPACING.LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    gap: SPACING.SMALL,
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginBottom: SPACING.MEDIUM,
  },
  documentUploadButtonSuccess: {
    borderColor: COLORS.PRIMARY_BROWN,
    borderStyle: 'solid',
    backgroundColor: COLORS.LIGHT_BROWN,
  },
  documentUploadText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  documentUploadTextSuccess: {
    color: COLORS.PRIMARY_BROWN,
  },
  documentNote: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  buttonContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY_BROWN,
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
    height: 20,
  },
});

export default AdoptionConfirmationModal;