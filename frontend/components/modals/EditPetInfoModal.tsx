import React, { useState, useCallback, useEffect } from 'react';
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
import ConfirmationModal from './ConfirmationModal';


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

const PET_CATEGORIES = [
  { id: 'dog', label: 'Dog', icon: 'paw-outline' },
  { id: 'cat', label: 'Cat', icon: 'paw-outline' },

];

const GENDER_OPTIONS = [
  { id: 'Male', label: 'Male' },
  { id: 'Female', label: 'Female' },
];

interface PetFormData {

  name: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female' | '';
  category: string; 
  

  vaccinated: boolean;
  spayedNeutered: boolean;
  
  adoptionFee: string;
  description: string;
  story: string;
  
  microchipNumber?: string;
  vetDocument?: any; 
}

interface EditPetInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PetFormData) => void;
  initialData?: Partial<PetFormData>;
  mode: 'create' | 'edit'; 
  isLoading?: boolean;
}

const EditPetInfoModal: React.FC<EditPetInfoModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData = {},
  mode,
  isLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    breed: '',
    age: '',
    gender: '',
    category: '',
    vaccinated: false,
    spayedNeutered: false,
    adoptionFee: '',
    description: '',
    story: '',
    microchipNumber: '',
    ...initialData,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const isFormValid = formData.name.trim() && 
                     formData.breed.trim() && 
                     formData.age.trim() && 
                     formData.gender && 
                     formData.category &&
                     formData.adoptionFee.trim() &&
                     formData.description.trim() &&
                     formData.story.trim(); 

  // Handlers
  const handleInputChange = useCallback((field: keyof PetFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!isFormValid) {
      showAlert({
        title: 'Incomplete Information',
        message: 'Please fill in all required fields before saving.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }

    onSave(formData);
  }, [formData, isFormValid, onSave, showAlert]);

  const handleClose = useCallback(() => {

    const hasChanges = Object.keys(formData).some(key => 
      formData[key as keyof PetFormData] !== initialData[key as keyof PetFormData]
    );

    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [formData, initialData, onClose]);

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedModal(false);
    onClose();
  }, [onClose]);

  const handleCancelClose = useCallback(() => {
    setShowUnsavedModal(false);
  }, []);

  const handleDocumentUpload = useCallback(() => {
    // TODO:document upload
    showAlert({
      title: 'Document Upload',
      message: 'Document upload functionality will be implemented soon.',
      type: 'info',
      buttonText: 'OK',
    });
  }, [showAlert]);

  const renderCategoryPicker = () => (
    <View style={styles.pickerContainer}>
      {PET_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.pickerOption,
            formData.category === category.id && styles.pickerOptionSelected
          ]}
          onPress={() => handleInputChange('category', category.id)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={formData.category === category.id ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
          />
          <Text style={[
            styles.pickerOptionText,
            { fontSize: bodyTextFontSize },
            formData.category === category.id && styles.pickerOptionTextSelected
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGenderPicker = () => (
    <View style={styles.pickerContainer}>
      {GENDER_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.pickerOption,
            formData.gender === option.id && styles.pickerOptionSelected
          ]}
          onPress={() => handleInputChange('gender', option.id)}
        >
          <Ionicons 
            name={formData.gender === option.id ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color={formData.gender === option.id ? COLORS.PRIMARY_BROWN : COLORS.GRAY_DARK} 
          />
          <Text style={[
            styles.pickerOptionText,
            { fontSize: bodyTextFontSize },
            formData.gender === option.id && styles.pickerOptionTextSelected
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMedicalToggle = (field: 'vaccinated' | 'spayedNeutered', label: string) => (
    <TouchableOpacity
      style={styles.toggleContainer}
      onPress={() => handleInputChange(field, !formData[field])}
    >
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, { fontSize: bodyTextFontSize }]}>
          {label}
        </Text>
        <View style={[
          styles.toggle,
          formData[field] && styles.toggleActive
        ]}>
          <View style={[
            styles.toggleIndicator,
            formData[field] && styles.toggleIndicatorActive
          ]} />
        </View>
      </View>
    </TouchableOpacity>
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
            {mode === 'create' ? 'Add Pet Information' : 'Edit Pet Information'}
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
          <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
            Basic Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Pet Name *
            </Text>
            <TextInput
              style={[styles.textInput, { fontSize: bodyTextFontSize }]}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter pet name"
              placeholderTextColor={COLORS.GRAY_DARK}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Breed *
            </Text>
            <TextInput
              style={[styles.textInput, { fontSize: bodyTextFontSize }]}
              value={formData.breed}
              onChangeText={(text) => handleInputChange('breed', text)}
              placeholder="Enter breed"
              placeholderTextColor={COLORS.GRAY_DARK}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Age *
            </Text>
            <TextInput
              style={[styles.textInput, { fontSize: bodyTextFontSize }]}
              value={formData.age}
              onChangeText={(text) => handleInputChange('age', text)}
              placeholder="e.g., 2 years, 6 months"
              placeholderTextColor={COLORS.GRAY_DARK}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Gender *
            </Text>
            {renderGenderPicker()}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Category *
            </Text>
            {renderCategoryPicker()}
          </View>

          <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
            Medical Information
          </Text>

          <View style={styles.medicalSection}>
            {renderMedicalToggle('vaccinated', 'Vaccinated & Dewormed')}
            {renderMedicalToggle('spayedNeutered', 'Spayed/Neutered')}
          </View>

          <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
            Adoption Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Adoption Fee ($) *
            </Text>
            <TextInput
              style={[styles.textInput, { fontSize: bodyTextFontSize }]}
              value={formData.adoptionFee}
              onChangeText={(text) => handleInputChange('adoptionFee', text)}
              placeholder="0"
              placeholderTextColor={COLORS.GRAY_DARK}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Description *
            </Text>
            <TextInput
              style={[styles.textAreaInput, { fontSize: bodyTextFontSize }]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Brief description of the pet's personality and characteristics"
              placeholderTextColor={COLORS.GRAY_DARK}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { fontSize: labelTextFontSize }]}>
              Pet Story *
            </Text>
            <TextInput
              style={[styles.textAreaInput, { fontSize: bodyTextFontSize }]}
              value={formData.story}
              onChangeText={(text) => handleInputChange('story', text)}
              placeholder="Tell the pet's story - how they came to the shelter, their journey, etc."
              placeholderTextColor={COLORS.GRAY_DARK}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
            Shelter Information
          </Text>
          <View style={styles.shelterInfoContainer}>
            <Text style={[styles.shelterInfoText, { fontSize: labelTextFontSize }]}>
              Shelter details will be automatically added from your profile
            </Text>
            <View style={styles.shelterInfoPreview}>
              <Text style={[styles.shelterInfoLabel, { fontSize: labelTextFontSize }]}>
              Name, Location and Contact Info.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <ConfirmationModal
          visible={showUnsavedModal}
          type="unsaved"
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />

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

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.EXTRA_LARGE,
    marginBottom: SPACING.MEDIUM,
  },

  inputGroup: {
    marginBottom: SPACING.LARGE,
  },
  inputLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  textInput: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.MEDIUM,
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
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

  pickerContainer: {
    gap: SPACING.SMALL,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 2,
    borderColor: COLORS.INPUT_BORDER,
    gap: SPACING.MEDIUM,
  },
  pickerOptionSelected: {
    borderColor: COLORS.PRIMARY_BROWN,
    backgroundColor: COLORS.LIGHT_BROWN,
  },
  pickerOptionText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
  },
  pickerOptionTextSelected: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },

  medicalSection: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  toggleContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  toggleLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.GRAY_LIGHT,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.PRIMARY_BROWN,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.CARD_BACKGROUND,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },

  shelterInfoContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  shelterInfoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.SMALL,
    fontStyle: 'italic',
  },
  shelterInfoPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
    paddingTop: SPACING.SMALL,
  },
  shelterInfoLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.LIGHT_BROWN,
  },

  verificationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_BROWN,
  },
  verificationNotice: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    fontStyle: 'italic',
    lineHeight: 18,
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
  },
  documentUploadText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  documentHelpText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginTop: SPACING.SMALL,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  bottomSpacing: {
    height: 40,
  },
});

export default EditPetInfoModal;