import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import { setTabsUI } from '../../config/systemUI';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditPetInfoModal from '../../components/modals/EditPetInfoModal';
import MonthlyGoalsModal from '../../components/modals/MonthlyGoalModal';
import GalleryManagementModal from '../../components/modals/GalleryManagementModal';


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 55,
  HEADER_HEIGHT: 80,
  INPUT_HEIGHT: 45,
  BOTTOM_SAFE_SPACING: 120,
} as const;

const SPACING = {
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
  HEADER_TITLE: 0.055,
  SECTION_TITLE: 0.045,
  BODY_TEXT: 0.035,
  LABEL_TEXT: 0.032,
  BUTTON_TEXT: 0.042,
} as const;


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
  vetDocument?: { name: string; uri: string } | null;
}

interface MonthlyGoalsData {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
  total: number;
}

interface GalleryData {
  mainImage: { uri: string } | null;
  galleryImages: { uri: string }[];
}

type ModalType = 'none' | 'petInfo' | 'monthlyGoals' | 'gallery';


const MOCK_SHELTER_PROFILE_COMPLETION = 85;

const ShelterPetsAddPage: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();


  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [isLoading, setIsLoading] = useState(false);


  const [vetDocument, setVetDocument] = useState<{ name: string; uri: string } | null>(null);

  
  const [petInfoData, setPetInfoData] = useState<PetFormData>({
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
    vetDocument: null,
  });

  const [monthlyGoalsData, setMonthlyGoalsData] = useState<MonthlyGoalsData>({
    vaccination: 0,
    food: 0,
    medical: 0,
    other: 0,
    total: 0,
  });

  const [galleryData, setGalleryData] = useState<GalleryData>({
    mainImage: null,
    galleryImages: [],
  });

  const [shelterProfileCompletion, setShelterProfileCompletion] = useState<number>(0);


  useEffect(() => {
    setTabsUI();
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API_BASE_URL}/shelters/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShelterProfileCompletion(res.data.profileCompleteness || 0);
      } catch (err) {
        setShelterProfileCompletion(0);
      }
    };
    fetchProfile();
  }, []);


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  
  const isPetInfoComplete = useMemo(() => {
    return petInfoData.name && petInfoData.breed && petInfoData.age && 
           petInfoData.gender && petInfoData.category && petInfoData.adoptionFee &&
           petInfoData.description && petInfoData.story;
  }, [petInfoData]);

  const isMonthlyGoalsComplete = useMemo(() => {
    return monthlyGoalsData.total > 0;
  }, [monthlyGoalsData]);

  const isGalleryComplete = useMemo(() => {
    return galleryData.mainImage !== null;
  }, [galleryData]);

  const isVerificationComplete = useMemo(() => {
    return vetDocument !== null;
  }, [vetDocument]);

  const isShelterProfileComplete = useMemo(() => {
    return shelterProfileCompletion === 100;
  }, [shelterProfileCompletion]);

  const isFormComplete = useMemo(() => {
    return isPetInfoComplete && isMonthlyGoalsComplete && isGalleryComplete && 
           isVerificationComplete && isShelterProfileComplete;
  }, [isPetInfoComplete, isMonthlyGoalsComplete, isGalleryComplete, isVerificationComplete, isShelterProfileComplete]);

  
  const handleSavePetInfo = useCallback((data: PetFormData) => {
    setPetInfoData(data);
    setActiveModal('none');
    showAlert({
      title: 'Pet Information Saved',
      message: 'Pet details have been saved successfully.',
      type: 'success',
      buttonText: 'OK',
    });
  }, [showAlert]);

  const handleSaveMonthlyGoals = useCallback((data: MonthlyGoalsData) => {
    setMonthlyGoalsData(data);
    setActiveModal('none');
    showAlert({
      title: 'Monthly Goals Saved',
      message: 'Monthly care goals have been saved successfully.',
      type: 'success',
      buttonText: 'OK',
    });
  }, [showAlert]);

  const handleSaveGallery = useCallback((data: GalleryData) => {
    setGalleryData(data);
    setActiveModal('none');
    showAlert({
      title: 'Photos Saved',
      message: 'Pet photos have been saved successfully.',
      type: 'success',
      buttonText: 'OK',
    });
  }, [showAlert]);

  
  const handleDocumentUpload = useCallback(() => {
    
    setVetDocument({ 
      name: 'pet-verification-document.pdf', 
      uri: 'document://verified' 
    });
    
    showAlert({
      title: 'Document Uploaded',
      message: 'Veterinary document has been uploaded successfully.',
      type: 'success',
      buttonText: 'OK',
    });
  }, [showAlert]);

  const handleAddPet = useCallback(async () => {
    if (!isFormComplete) {
      showAlert({
        title: 'Incomplete',
        message: 'Please complete all required sections before adding a pet.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }
    setIsLoading(true);
    try {
      console.log('=== STARTING PET CREATION ===');
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      console.log('Token found:', token ? 'YES' : 'NO');
      
      let mainImageUrl = '';
      if (galleryData.mainImage?.uri) {
        console.log('Uploading main image...');
        try {
          const response = await fetch(galleryData.mainImage.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          const uploadResponse = await fetch(`${API_BASE_URL}/uploads/base64-image?type=pet_image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              image: base64Data.split(',')[1], 
              mimeType: 'image/jpeg',
              filename: `pet-main-${Date.now()}.jpg`
            }),
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Main image upload failed:', errorText);
            throw new Error(`Image upload failed: ${uploadResponse.status}`);
          }
          
          const uploadResult = await uploadResponse.json();
          mainImageUrl = uploadResult.secureUrl;
          console.log('Main image uploaded successfully:', mainImageUrl);
        } catch (imageError) {
          console.error('Main image upload error:', imageError);
          throw new Error('Failed to upload main image');
        }
      }

      let galleryImageUrls: string[] = [];
      if (galleryData.galleryImages.length > 0) {
        for (const img of galleryData.galleryImages) {
 
          const response = await fetch(img.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          const uploadResponse = await fetch(`${API_BASE_URL}/uploads/base64-image?type=pet_image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              image: base64Data.split(',')[1], 
              mimeType: 'image/jpeg',
              filename: `pet-gallery-${Date.now()}-${galleryImageUrls.length}.jpg`
            }),
          });
          
          const uploadResult = await uploadResponse.json();
          galleryImageUrls.push(uploadResult.secureUrl);
        }
      }
    
      let vetDocUrl = '';
      /*
      if (vetDocument?.uri) {
        const formData = new FormData();
        formData.append('image', { uri: vetDocument.uri, name: vetDocument.name, type: 'application/pdf' } as any);
        const res = await axios.post(`${API_BASE_URL}/uploads/image?type=vet_records`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        vetDocUrl = res.data.secureUrl;
      }
      */
      
      console.log('Creating pet with data:', {
        name: petInfoData.name,
        breed: petInfoData.breed,
        age: petInfoData.age,
        gender: petInfoData.gender.toLowerCase(),
        type: petInfoData.category.toLowerCase(),
        mainImage: mainImageUrl,
        additionalImages: galleryImageUrls,
        vetRecords: vetDocUrl,
      });
      
    
      if (!mainImageUrl) {
        throw new Error('Main image is required but was not uploaded successfully');
      }
      
      const petRes = await axios.post(`${API_BASE_URL}/pets`, {
        name: petInfoData.name,
        breed: petInfoData.breed,
        age: petInfoData.age,
        gender: petInfoData.gender.toLowerCase(), 
        type: petInfoData.category.toLowerCase(),
        vaccinated: petInfoData.vaccinated,
        dewormed: false,
        spayedNeutered: petInfoData.spayedNeutered,
        adoptionFee: parseFloat(petInfoData.adoptionFee),
        description: petInfoData.description,
        story: petInfoData.story,
        mainImage: mainImageUrl || '', 
        additionalImages: galleryImageUrls, 
        microchipNumber: `PET-${Date.now()}`,
        vetRecords: vetDocUrl || '',
        monthlyGoals: {
          vaccination: monthlyGoalsData.vaccination,
          food: monthlyGoalsData.food,
          medical: monthlyGoalsData.medical,
          other: monthlyGoalsData.other,
        },
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Pet created successfully:', petRes.data);
      showAlert({
        title: 'Pet Added',
        message: 'Your new pet has been added successfully.',
        type: 'success',
        buttonText: 'OK',
      });
      setTimeout(() => router.replace('/(shelter-tabs)/shelter-home'), 1000);
    } catch (err: any) {
      console.error('=== PET CREATION ERROR ===');
      console.error('Error object:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);
      console.error('Error message:', err?.message);
      
      let errorMessage = 'Failed to add pet. Please try again.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      showAlert({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isFormComplete, galleryData, petInfoData, monthlyGoalsData, vetDocument, showAlert, router]);

  const renderSectionStatus = (completed: boolean, label: string) => (
    <View style={styles.sectionStatus}>
      <Ionicons 
        name={completed ? "checkmark-circle" : "ellipse-outline"} 
        size={20} 
        color={completed ? COLORS.SUCCESS_GREEN : COLORS.GRAY_LIGHT} 
      />
      <Text style={[styles.sectionStatusText, { fontSize: labelTextFontSize }]}>
        {label}: {completed ? 'Completed' : 'Pending'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: height * 0.05 }]}>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Add New Pet to Pawner
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Pet Information
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
            Add basic details about the pet
          </Text>
          
          {isPetInfoComplete ? (
            <View style={styles.completedSection}>
              <Text style={[styles.completedSectionTitle, { fontSize: bodyTextFontSize }]}>
                {petInfoData.name} • {petInfoData.breed}
              </Text>
              <Text style={[styles.completedSectionDetails, { fontSize: labelTextFontSize }]}>
                {petInfoData.age} • {petInfoData.gender} • ${petInfoData.adoptionFee}
              </Text>
            </View>
          ) : (
            <Text style={[styles.incompleteSectionText, { fontSize: labelTextFontSize }]}>
              Complete pet details to continue
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.sectionButton} 
            onPress={() => setActiveModal('petInfo')}
          >
            <Text style={[styles.sectionButtonText, { fontSize: bodyTextFontSize }]}>
              {isPetInfoComplete ? 'Edit Pet Information' : 'Add Pet Information'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Pet Photos
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
            Upload photos of the pet
          </Text>
          
          {isGalleryComplete ? (
            <View style={styles.completedSection}>
              <Text style={[styles.completedSectionTitle, { fontSize: bodyTextFontSize }]}>
                Photos Uploaded
              </Text>
              <Text style={[styles.completedSectionDetails, { fontSize: labelTextFontSize }]}>
                {galleryData.galleryImages.length + 1} photos ready
              </Text>
            </View>
          ) : (
            <Text style={[styles.incompleteSectionText, { fontSize: labelTextFontSize }]}>
              Add at least one main photo
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.sectionButton} 
            onPress={() => setActiveModal('gallery')}
          >
            <Text style={[styles.sectionButtonText, { fontSize: bodyTextFontSize }]}>
              {isGalleryComplete ? 'Manage Photos' : 'Add Photos'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Monthly Care Goals
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
            Set monthly costs for care needs
          </Text>
          
          {isMonthlyGoalsComplete ? (
            <View style={styles.completedSection}>
              <Text style={[styles.completedSectionTitle, { fontSize: bodyTextFontSize }]}>
                Monthly Goals Set
              </Text>
              <Text style={[styles.completedSectionDetails, { fontSize: labelTextFontSize }]}>
                Total: ${monthlyGoalsData.total}/month
              </Text>
            </View>
          ) : (
            <Text style={[styles.incompleteSectionText, { fontSize: labelTextFontSize }]}>
              Set monthly care costs
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.sectionButton} 
            onPress={() => setActiveModal('monthlyGoals')}
          >
            <Text style={[styles.sectionButtonText, { fontSize: bodyTextFontSize }]}>
              {isMonthlyGoalsComplete ? 'Edit Goals' : 'Set Goals'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Pet Verification
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
            Upload pet verification documents
          </Text>
          
          <View style={styles.verificationNotice}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.LIGHT_BROWN} />
            <Text style={[styles.verificationNoticeText, { fontSize: labelTextFontSize }]}>
              Upload documentation to verify pet identity and medical records
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.documentUploadButton,
              vetDocument && styles.documentUploadButtonSuccess
            ]}
            onPress={handleDocumentUpload}
          >
            <Ionicons 
              name={vetDocument ? "checkmark-circle" : "document-attach-outline"} 
              size={20} 
              color={vetDocument ? COLORS.SUCCESS_GREEN : COLORS.PRIMARY_BROWN} 
            />
            <Text style={[
              styles.documentUploadText,
              { fontSize: bodyTextFontSize },
              vetDocument && styles.documentUploadTextSuccess
            ]}>
              {vetDocument ? `Document Uploaded: ${vetDocument.name}` : 'Upload Pet Passport or Vet Records'}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.documentHelpText, { fontSize: labelTextFontSize }]}>
            Upload documents that verify the pet's identity and medical history
          </Text>
        </View>

        {!isShelterProfileComplete && (
          <Text style={[styles.profileIncompleteMessage, { fontSize: labelTextFontSize }]}>
            Complete your shelter profile to 100% before adding pets to Pawner.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormComplete && styles.submitButtonDisabled,
            isLoading && styles.submitButtonLoading,
            { marginBottom: DESIGN_CONSTANTS.BOTTOM_SAFE_SPACING }
          ]}
          onPress={handleAddPet}
          disabled={!isFormComplete || isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitButtonText, { fontSize: buttonTextFontSize }]}>
            {isLoading ? 'Adding Pet to Pawner...' : 'Add Pet to Pawner'}
          </Text>
        </TouchableOpacity>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditPetInfoModal
        visible={activeModal === 'petInfo'}
        onClose={() => setActiveModal('none')}
        onSave={handleSavePetInfo}
        initialData={petInfoData}
        mode="create"
      />

      <MonthlyGoalsModal
        visible={activeModal === 'monthlyGoals'}
        onClose={() => setActiveModal('none')}
        onSave={handleSaveMonthlyGoals}
        initialData={monthlyGoalsData}
        mode="create"
      />

      <GalleryManagementModal
        visible={activeModal === 'gallery'}
        onClose={() => setActiveModal('none')}
        onSave={handleSaveGallery}
        initialData={galleryData}
        mode="create"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  header: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.LARGE,
  },
  
  section: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
    marginBottom: SPACING.LARGE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  },
  sectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginBottom: SPACING.SMALL,
  },
  sectionStatusText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginLeft: SPACING.SMALL,
  },
  completedSection: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  completedSectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  completedSectionDetails: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.SMALL,
  },
  incompleteSectionText: {
    fontFamily: 'PoppinsItalic',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  sectionButton: {
    backgroundColor: COLORS.LIGHT_BROWN,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    alignItems: 'center',
  },
  sectionButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },

  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.MEDIUM,
  },
  verificationNoticeText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    flex: 1,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: SPACING.MEDIUM,
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
    marginBottom: SPACING.SMALL,
  },
  documentUploadButtonSuccess: {
    borderColor: COLORS.SUCCESS_GREEN,
    borderStyle: 'solid',
    backgroundColor: '#E8F5E8',
  },
  documentUploadText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    flex: 1,
  },
  documentUploadTextSuccess: {
    color: COLORS.SUCCESS_GREEN,
  },
  documentHelpText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  profileIncompleteMessage: {
    fontFamily: 'PoppinsItalic',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
  },

  submitButton: {
    backgroundColor: COLORS.SUCCESS_GREEN,
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.LARGE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
    opacity: 0.6,
  },
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ShelterPetsAddPage;

