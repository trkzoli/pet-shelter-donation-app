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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AlertModal } from '../../../components/modals';
import { useAlertModal } from '../../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


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


interface ShelterProfileFormData {

  shelterName: string;
  email: string;
  phone: string;
  website: string;
  

  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  

  licenseNumber: string;
  establishedYear: string;
  description: string;
  specializations: string; 
  
  contactPersonName: string;
  contactPersonTitle: string;
  operatingHours: string;
  

  facebookUrl: string;
  instagramUrl: string;
}

const INITIAL_FORM_DATA: ShelterProfileFormData = {
  shelterName: '',
  email: '',
  phone: '',
  website: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  licenseNumber: '',
  establishedYear: '',
  description: '',
  specializations: '',
  contactPersonName: '',
  contactPersonTitle: '',
  operatingHours: '',
  facebookUrl: '',
  instagramUrl: '',
};

const FIELD_VALIDATION = {

  shelterName: { required: true, minLength: 2 },
  description: { required: true, minLength: 10 }, 
  specializations: { required: true, minLength: 1 }, 
  licenseNumber: { required: true, minLength: 1 }, 
  establishedYear: { required: true, minLength: 1 }, 
  contactPersonName: { required: true, minLength: 2 },
  
  
  email: { required: true, readOnly: true }, 
  phone: { required: true, readOnly: true }, 
  street: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  state: { required: true, minLength: 2 },
  zipCode: { required: true, minLength: 3 }, 
  country: { required: true, minLength: 2 },
  
  contactPersonTitle: { required: false, minLength: 1 },
  operatingHours: { required: false, minLength: 1 },
  website: { required: false },
  facebookUrl: { required: false },
  instagramUrl: { required: false },
} as const;

interface ShelterProfileEditPageProps {}

const ShelterProfileEditPage: React.FC<ShelterProfileEditPageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [formData, setFormData] = useState<ShelterProfileFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ShelterProfileFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    console.log('=== FORM DATA STATE CHANGED ===');
    console.log('Email in state:', formData.email);
    console.log('Phone in state:', formData.phone);
    console.log('Shelter name in state:', formData.shelterName);
    console.log('Full form data:', formData);

  }, [formData]);

  const titleFontSize = width * 0.055;
  const sectionTitleFontSize = width * 0.045;
  const bodyFontSize = width * 0.035;
  const labelFontSize = width * 0.032;

  const completionPercentage = useMemo(() => {
    const requiredFields = Object.keys(FIELD_VALIDATION).filter(field => {
      const rules = FIELD_VALIDATION[field as keyof typeof FIELD_VALIDATION];
      return rules.required && !('readOnly' in rules && rules.readOnly);
    });
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof ShelterProfileFormData];
      return value !== '' && value !== undefined && value !== null;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  const validateField = useCallback((field: keyof ShelterProfileFormData, value: string): string => {
    const rules = FIELD_VALIDATION[field];
    if (!rules) return '';

    if (rules.required && (!value || value.trim() === '')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if ('minLength' in rules && value.length < (rules.minLength || 0)) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if ('pattern' in rules && rules.pattern && !rules.pattern.test(value)) {
      if (field === 'email') return 'Invalid email format';
      return 'Invalid format';
    }

    return '';
  }, []);

  const handleInputChange = useCallback((field: keyof ShelterProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ShelterProfileFormData, string>> = {};
    let hasErrors = false;

    Object.keys(FIELD_VALIDATION).forEach(field => {
      const fieldKey = field as keyof ShelterProfileFormData;
      const error = validateField(fieldKey, formData[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [formData, validateField]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        
        const res = await axios.get(`${API_BASE_URL}/shelters/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const d = res.data;
        console.log('=== SHELTER PROFILE DEBUG ===');
        console.log('Full API response:', JSON.stringify(d, null, 2));
        console.log('User object:', d.user);
        console.log('Email from API:', d.user?.email);
        console.log('Phone from API:', d.user?.phone);
        console.log('Shelter name from API:', d.shelterName);

        
        const formDataToSet = {
          shelterName: d.shelterName || '',
          email: d.user?.email || '',
          phone: d.user?.phone || '',
          website: d.website || '',
          street: d.user?.street || '',
          city: d.user?.city || '',
          state: d.user?.state || '',
          zipCode: d.user?.zip || '',
          country: d.user?.country || '',
          licenseNumber: d.licenseNumber || '',
          establishedYear: d.yearEstablished ? String(d.yearEstablished) : '',
          description: d.description || '',
          specializations: d.petSpecialization || '',
          contactPersonName: d.contactPerson || '',
          contactPersonTitle: d.contactTitle || '',
          operatingHours: d.operatingHours || '',
          facebookUrl: d.facebook || '',
          instagramUrl: d.instagram || '',
        };
        
        console.log('Form data being set:', {
          email: formDataToSet.email,
          phone: formDataToSet.phone,
          shelterName: formDataToSet.shelterName
        });
        
        setFormData(formDataToSet);
      } catch (err: any) {
        console.error('Failed to load shelter profile:', err.response?.data || err.message);
        showAlert({
          title: 'Error',
          message: 'Failed to load profile. Please try again.',
          type: 'error',
          buttonText: 'OK',
        });
      }
    };
    fetchProfile();
  }, [showAlert]);

  const handleSave = useCallback(async () => {
    console.log('SAVE ATTEMPT START');
    console.log('Current form data:', formData);

    const filledRequiredFields = Object.keys(FIELD_VALIDATION).filter(field => {
      const rules = FIELD_VALIDATION[field as keyof typeof FIELD_VALIDATION];
      if (!rules.required || ('readOnly' in rules && rules.readOnly)) return false;
      const value = formData[field as keyof ShelterProfileFormData];
      return value !== '' && value !== undefined && value !== null;
    });
    
    if (!formData.shelterName || formData.shelterName.trim() === '') {
      showAlert({
        title: 'Shelter Name Required',
        message: 'Please enter a shelter name before saving.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }
    
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      console.log('Sending shelter profile update...');

      let petSpecialization = formData.specializations;
      if (petSpecialization === 'Dogs') petSpecialization = 'dogs';
      else if (petSpecialization === 'Cats') petSpecialization = 'cats';
      else if (petSpecialization === 'Both' || petSpecialization === 'both') petSpecialization = 'both';
      
      const shelterUpdateData = {
        shelterName: formData.shelterName,
        description: formData.description || undefined,
        petSpecialization: petSpecialization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        yearEstablished: formData.establishedYear ? Number(formData.establishedYear) : undefined,
        contactPerson: formData.contactPersonName || undefined,
        contactTitle: formData.contactPersonTitle || undefined,
        operatingHours: formData.operatingHours || undefined,
        website: formData.website || undefined,
        facebook: formData.facebookUrl || undefined,
        instagram: formData.instagramUrl || undefined,
      };
      
      Object.keys(shelterUpdateData).forEach(key => {
        if ((shelterUpdateData as any)[key] === undefined) {
          delete (shelterUpdateData as any)[key];
        }
      });
      
      console.log('Shelter update payload:', shelterUpdateData);

      const shelterResponse = await axios.put(`${API_BASE_URL}/shelters/profile`, shelterUpdateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Shelter update response:', shelterResponse.data);

      console.log('Sending user profile update...');
      const userUpdateData = {
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zipCode || undefined,
        country: formData.country || undefined,
      };

      Object.keys(userUpdateData).forEach(key => {
        if ((userUpdateData as any)[key] === undefined) {
          delete (userUpdateData as any)[key];
        }
      });
      
      console.log('User update payload:', userUpdateData);
      
      if (Object.keys(userUpdateData).length > 0) {
        const userResponse = await axios.put(`${API_BASE_URL}/users/profile`, userUpdateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User update response:', userResponse.data);
      }
      
      console.log('Updates successful!');
      showAlert({
        title: 'Profile Updated',
        message: 'Your shelter profile has been updated successfully.',
        type: 'success',
        buttonText: 'OK',
      });
      setTimeout(() => router.replace('/(shelter-tabs)/shelter-profile'), 1000);
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
      console.log('SAVE ATTEMPT END');
    }
  }, [formData, router, showAlert]);


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
    field: keyof ShelterProfileFormData,
    label: string,
    placeholder: string,
    isTextArea: boolean = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    isReadOnly: boolean = false
  ) => {

    if (field === 'email' || field === 'phone') {
      console.log(`=== ${field.toUpperCase()} FIELD DEBUG ===`);
      console.log(`Value: "${formData[field]}"`);
      console.log(`Value length: ${formData[field]?.length || 0}`);
      console.log(`Value type: ${typeof formData[field]}`);
      console.log(`Is empty: ${!formData[field] || formData[field] === ''}`);
      console.log(`Placeholder: "${placeholder}"`);

    }
    
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>
          {label}
        </Text>
        <TextInput
          style={[
            isTextArea ? styles.textArea : styles.textInput,
            errors[field] && styles.inputError,
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
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  }, [formData, errors, handleInputChange, labelFontSize, bodyFontSize]);

  return (
    <SafeAreaView style={styles.container}>

      <View style={[styles.header, { height: DESIGN_CONSTANTS.HEADER_HEIGHT }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('../../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
            Edit Shelter Profile
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: bodyFontSize }]}>
            {completionPercentage}% Complete • {completionPercentage >= 90 ? 'Verification Ready!' : 'Almost Done!'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >


          {renderFormSection('Basic Information', (
            <>
              {renderInputField('shelterName', 'Shelter Name *', 'Enter shelter name')}
              {renderInputField('email', 'Email Address * (from registration)', 
                formData.email || 'No email found in registration data', false, 'email-address', true)}
              {renderInputField('phone', 'Phone Number * (from registration)', 
                formData.phone || 'No phone found in registration data', false, 'phone-pad', true)}
              {renderInputField('website', 'Website', 'www.shelter.org')}
              {renderInputField('description', 'Description *', 'Tell people about your shelter, mission, and values...', true)}
              {renderInputField('specializations', 'Pet Specializations *', 'dogs, cats, or both')}
            </>
          ))}

          {renderFormSection('Address Information', (
            <>
              {renderInputField('street', 'Street Address *', 'Enter shelter street address')}
              {renderInputField('city', 'City *', 'Enter city')}
              {renderInputField('state', 'State/Province *', 'Enter state or province')}
              {renderInputField('zipCode', 'ZIP/Postal Code *', 'Enter ZIP or postal code')}
              {renderInputField('country', 'Country', 'Enter country')}
            </>
          ))}

          {renderFormSection('Organization Details', (
            <>
              {renderInputField('licenseNumber', 'License Number *', 'AS-2024-001')}
              {renderInputField('establishedYear', 'Year Established *', 'e.g. 2015', false, 'numeric')}
              {renderInputField('contactPersonName', 'Contact Person *', 'Full name of main contact')}
              {renderInputField('contactPersonTitle', 'Contact Title', 'Director, Manager, etc.')}
              {renderInputField('operatingHours', 'Operating Hours', 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM', true)}
            </>
          ))}


          {renderFormSection('Social Media (Optional)', (
            <>
              {renderInputField('facebookUrl', 'Facebook', '@YourShelterName')}
              {renderInputField('instagramUrl', 'Instagram', '@your_shelter_pets')}
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
    paddingTop: SPACING.EXTRA_LARGE, 
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
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

  dropdownContainer: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  picker: {
    flex: 1,
  },
});

export default ShelterProfileEditPage;

