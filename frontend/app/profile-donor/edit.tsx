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
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 45,
  HEADER_HEIGHT: 140,

  TAB_BAR_HEIGHT: 70,
  BOTTOM_SAFE_SPACING: 120,
} as const;

const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
  MASSIVE: 40, 
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


interface DonorProfileFormData {
  
  fullName: string;
  email: string;
  phone: string;
  

  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  

  housingType: string; 
  ownershipStatus: string;
  hasYard: string;
  yardFenced: string;
  
  
  currentPets: string;

  experienceLevel: string;

  occupation: string;
  workSchedule: string;
  
  adoptionReason: string;
  
}

const INITIAL_FORM_DATA: DonorProfileFormData = {
  fullName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  housingType: '',
  ownershipStatus: '',
  hasYard: '',
  yardFenced: '',
  
  currentPets: '',

  experienceLevel: '',
  
  occupation: '',
  workSchedule: '',
 
  adoptionReason: '',
};

const FIELD_VALIDATION = {
  fullName: { required: true, minLength: 2 },
  email: { required: true, pattern: /^\S+@\S+\.\S+$/ },
  phone: { required: true, minLength: 10 },
  street: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  state: { required: true, minLength: 2 },
  zipCode: { required: true, minLength: 3 }, 
  housingType: { required: true, minLength: 1 }, 
  ownershipStatus: { required: true, minLength: 1 }, 
  currentPets: { required: true, minLength: 3 },
  occupation: { required: true, minLength: 2 },
  workSchedule: { required: true, minLength: 1 }, 
  adoptionReason: { required: true, minLength: 10 }, 
  country: { required: false },
  hasYard: { required: false }, 
  yardFenced: { required: false }, 
  experienceLevel: { required: true, minLength: 1 }, 
} as const;

interface DonorProfileEditPageProps {}

const DonorProfileEditPage: React.FC<DonorProfileEditPageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [formData, setFormData] = useState<DonorProfileFormData>(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<number>(0);

  const titleFontSize = width * 0.055;
  const sectionTitleFontSize = width * 0.045;
  const bodyFontSize = width * 0.035;
  const labelFontSize = width * 0.032;

  const completionPercentage = useMemo(() => {

    const requiredFields = Object.keys(FIELD_VALIDATION).filter(field => {
      const rules = FIELD_VALIDATION[field as keyof typeof FIELD_VALIDATION];
      return rules.required;
    });
    
    const completedRequiredFields = requiredFields.filter(field => {
      const value = formData[field as keyof DonorProfileFormData];
      return value !== '' && value !== undefined && value !== null && value.trim() !== '';
    });
    
    console.log('COMPLETION CALCULATION');
    console.log('Required fields:', requiredFields.length);
    console.log('Completed required fields:', completedRequiredFields.length);
    console.log('Percentage:', Math.round((completedRequiredFields.length / requiredFields.length) * 100));
   
    
    return Math.round((completedRequiredFields.length / requiredFields.length) * 100);
  }, [formData]);

  const getCompletionStatus = () => {
    if (completionPercentage >= 90) return { text: 'Verification Ready!', color: COLORS.SUCCESS_GREEN };
    if (completionPercentage >= 70) return { text: 'Almost Done!', color: '#FFD43B' };
    if (completionPercentage >= 50) return { text: 'Good Progress', color: COLORS.LIGHT_BROWN };
    return { text: 'Getting Started', color: COLORS.GRAY_DARK };
  };

  const completionStatus = getCompletionStatus();

  const handleInputChange = useCallback((field: keyof DonorProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        setFormData({
          fullName: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          street: d.street || '',
          city: d.city || '',
          state: d.state || '',
          zipCode: d.zip || '',
          country: d.country || '',
          housingType: d.housingType || '',
          ownershipStatus: d.ownershipStatus || '',
          hasYard: d.hasYard || '',
          yardFenced: d.isFenced || '',
          currentPets: d.currentPets || '',
          experienceLevel: d.experienceLevel || '',
          occupation: d.occupation || '',
          workSchedule: d.workSchedule || '',
          adoptionReason: d.whyAdopt || '',
        });
        setProfileCompleteness(d.profileCompleteness || 0);
      } catch (err) {
        setProfileCompleteness(0);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = useCallback(async () => {
    console.log('SAVE ATTEMPT START ');
    console.log('Current form data:', formData);
    
    if (!formData.fullName || formData.fullName.trim() === '') {
      showAlert({
        title: 'Name Required',
        message: 'Please enter your full name before saving.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }
    
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      console.log('Sending donor profile update...');
      
      const userUpdateData = {
        name: formData.fullName,
        phone: formData.phone || undefined,
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zipCode || undefined,
        country: formData.country || undefined,
        housingType: formData.housingType || undefined,
        ownershipStatus: formData.ownershipStatus || undefined,
        hasYard: formData.hasYard || undefined,
        isFenced: formData.yardFenced || undefined,
        currentPets: formData.currentPets || undefined,
        experienceLevel: formData.experienceLevel || undefined,
        occupation: formData.occupation || undefined,
        workSchedule: formData.workSchedule || undefined,
        whyAdopt: formData.adoptionReason || undefined,
      };
      
      Object.keys(userUpdateData).forEach(key => {
        if ((userUpdateData as any)[key] === undefined) {
          delete (userUpdateData as any)[key];
        }
      });
      
      console.log('User update payload:', userUpdateData);
      
      await axios.put(`${API_BASE_URL}/users/profile`, userUpdateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Updates successful!');
      showAlert({
        title: 'Profile Updated',
        message: 'Your donor profile has been updated successfully.',
        type: 'success',
        buttonText: 'OK',
      });
      setTimeout(() => router.replace('/(tabs)/profile'), 1000);
    } catch (err: any) {
      console.error('Profile update failed:', err.response?.data || err.message);
      console.error('Full error object:', err);
      showAlert({
        title: 'Update Failed',
        message: err?.response?.data?.message || 'Failed to update profile. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setSaving(false);
      console.log(' SAVE ATTEMPT END');
    }
      }, [formData, showAlert, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderFormSection = useCallback((title: string, children: React.ReactNode) => (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        {title}
      </Text>
      {children}
    </View>
  ), [sectionTitleFontSize]);


  const renderInputField = useCallback((
    field: keyof DonorProfileFormData,
    label: string,
    placeholder: string,
    isTextArea: boolean = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    isReadOnly: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>
        {label}
      </Text>
      <TextInput
        style={[
          isTextArea ? styles.textArea : styles.textInput,
          isReadOnly && styles.readOnlyInput,
          { fontSize: bodyFontSize }
        ]}
        value={formData[field]}
        onChangeText={isReadOnly ? undefined : (value) => handleInputChange(field, value)}
        placeholder={isReadOnly && !formData[field] ? 'Not provided during registration' : placeholder}
        placeholderTextColor={COLORS.GRAY_DARK}
        keyboardType={keyboardType}
        multiline={isTextArea}
        textAlignVertical={isTextArea ? 'top' : 'center'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType !== 'email-address'}
        editable={!isReadOnly}
      />

    </View>
  ), [formData, handleInputChange, labelFontSize, bodyFontSize]);



  return (
    <SafeAreaView style={styles.container}>
 
      <View style={[styles.header, { height: DESIGN_CONSTANTS.HEADER_HEIGHT }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
            Edit Donor Profile
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: bodyFontSize }]}>
            {completionPercentage}% Complete • {completionStatus.text}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {renderFormSection('Basic Information', (
            <>
              {renderInputField('fullName', 'Full Name *', 'Enter your full name')}
              {renderInputField('email', 'Email Address * (from registration)', 'Your registered email', false, 'email-address', true)}
              {renderInputField('phone', 'Phone Number *', 'Enter your phone number', false, 'phone-pad')}
            </>
          ))}

          {renderFormSection('Address Information', (
            <>
              {renderInputField('street', 'Street Address *', 'Enter your street address')}
              {renderInputField('city', 'City *', 'Enter your city')}
              {renderInputField('state', 'State/Province *', 'Enter your state or province')}
              {renderInputField('zipCode', 'ZIP/Postal Code *', 'Enter your ZIP or postal code')}
              {renderInputField('country', 'Country', 'Enter your country')}
            </>
          ))}

          {renderFormSection('Housing Information', (
            <>
              {renderInputField('housingType', 'Housing Type *', 'House, Apartment, Condo, etc.')}
              {renderInputField('ownershipStatus', 'Ownership Status *', 'Own, Rent, Living with Family, etc.')}
              {renderInputField('hasYard', 'Do you have a yard?', 'Yes, No, or Shared yard')}
              {renderInputField('yardFenced', 'Is your yard fenced?', 'Yes, No, or Partially fenced')}
          
            </>
          ))}


          {renderFormSection('Pet Experience', (
            <>
              {renderInputField('currentPets', 'Current Pets *', 'Describe any pets you currently have', true)}
             
              {renderInputField('experienceLevel', 'Experience Level *', 'First-time, Some experience, Experienced, etc.')}
              
            </>
          ))}


          {renderFormSection('Personal Information', (
            <>
              {renderInputField('occupation', 'Occupation *', 'Your job or profession')}
              {renderInputField('workSchedule', 'Work Schedule *', 'Describe your typical work schedule', true)}
              
              {renderInputField('adoptionReason', 'Why do you want to adopt? *', 'Tell us why you want to adopt a pet', true)}
            </>
          ))}


          <TouchableOpacity 
            style={[
              styles.saveButton, 
              saving && styles.buttonDisabled,
              { marginBottom: DESIGN_CONSTANTS.BOTTOM_SAFE_SPACING } 
            ]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={[styles.saveButtonText, { fontSize: bodyFontSize }]}>
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
    paddingTop: SPACING.EXTRA_LARGE,
  },
  backButton: {
    padding: SPACING.SMALL,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.GRAY_DARK,
    resizeMode: 'contain',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.LIGHT_BROWN,
    textAlign: 'center',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 40, 
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.LARGE,
   
  },
  

  formSection: {
    marginBottom: SPACING.HUGE,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.LARGE,
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
    minHeight: 100,
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
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: COLORS.GRAY_DARK,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.ERROR_RED,
    marginTop: SPACING.TINY,
  },
 
  saveButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: COLORS.PRIMARY_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.MASSIVE, 

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },


  profileImageSection: {
    marginBottom: SPACING.HUGE,
  },
  profileImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.CARD_BACKGROUND,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.CARD_BACKGROUND,
  },
  profileImageHint: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
    fontStyle: 'italic',
  },
});

export default DonorProfileEditPage;

