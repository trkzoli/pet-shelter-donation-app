import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../../components/modals';
import { useAlertModal } from '../../../hooks/useAlertModal';
import { setTabsUI } from '../../../config/systemUI';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 16,
  BORDER_RADIUS: 15,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 100,
  STANDARDIZED_HEADER_HEIGHT: 160, 
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  TITLE: 0.055,
  SUBTITLE: 14,
} as const;

const ADOPTION_REQUEST_CONSTANTS = {
  MESSAGE_MAX_LENGTH: 500,
  VALIDATION_TIMEOUT: 3000,
  SUBMISSION_TIMEOUT: 30000,
} as const;

interface AdoptionRequestPayload {
  petId: string;
  userId: string;
  message?: string;
  userContactInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  donationHistory: {
    totalAmount: number;
    donationCount: number;
    firstDonation: string;
    lastDonation: string;
    donations: Array<{
      date: string;
      amount: number;
    }>;
  };
  requestMetadata: {
    deviceInfo: string;
    timestamp: string;
    appVersion: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}


interface PetDetails {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  image: any;
  shelter: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
    businessHours: string;
    adoptionRequirements: string[];
  };
  userDonationHistory: {
    totalAmount: number;
    donationCount: number;
    firstDonation: string;
    lastDonation: string;
    donations: Array<{
      date: string;
      amount: number;
    }>;
  };
  description: string;
  medicalInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  adoptionStatus: {
    isAvailable: boolean;
    hasActiveRequest: boolean;
    requestUserId?: string;
  };
  adoptionFee: number;
}


interface UserContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  pawPoints: number;
}

const MOCK_PET_DETAILS: { [key: string]: PetDetails } = {
  'pet1': {
    id: 'pet1',
    name: 'Rex',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'Male',
    image: require('../../../assets/images/ds5.jpg'),
    shelter: {
      id: 'shelter_001',
      name: 'Happy Tails Animal Shelter',
      email: 'adoption@happytails.com',
      phone: '+1 (555) 123-4567',
      address: '1234 Doggo Street, Petland, CA 90210',
      contactPerson: 'Sarah Johnson, Adoption Coordinator',
      businessHours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM',
      adoptionRequirements: [
        'Complete adoption application form',
        'In-person meet & greet appointment',
        'Home check within 2 weeks of application',
        'Valid government-issued ID',
        'Proof of residence (lease/mortgage)',
        'Veterinary references if you have other pets',
        'All household members must meet the pet'
      ]
    },
    userDonationHistory: {
      totalAmount: 75.00,
      donationCount: 3,
      firstDonation: '2024-03-15',
      lastDonation: '2024-05-20',
      donations: [
        { date: '2024-03-15', amount: 25.00 },
        { date: '2024-04-10', amount: 30.00 },
        { date: '2024-05-20', amount: 20.00 },
      ]
    },
    description: 'Rex is a medium-sized dog with a beautiful golden coat. He is friendly, energetic, and loves to be around people. He enjoys fetch and long walks in the park.',
    medicalInfo: {
      vaccinated: true,
      spayedNeutered: true,
      microchipped: true,
    },
    adoptionStatus: {
      isAvailable: true,
      hasActiveRequest: false,
    },
    adoptionFee: 100.00,
  },
 
};


const MOCK_USER_CONTACT: UserContactInfo = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 987-6543',
  address: '123 User Street, Your City, ST 12345',
  pawPoints: 10,
};

const AdoptionRequestDetailsPage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  
  
  const { petId } = useLocalSearchParams<{ petId: string }>();
  
  // State
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petDetails, setPetDetails] = useState<PetDetails | null>(null);
  const [userContact, setUserContact] = useState<UserContactInfo | null>(null);
  const [bonusPointsToUse, setBonusPointsToUse] = useState<number>(0);

  
  useEffect(() => {
    setTabsUI();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        
       
        const petRes = await axios.get(`${API_BASE_URL}/pets/${petId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
      
        const backendPet = petRes.data;
        
        
        let shelterAddress = '';
        if (backendPet.shelter?.user) {
          const user = backendPet.shelter.user;
          const addressParts = [user.street, user.city, user.state, user.zip, user.country].filter(Boolean);
          shelterAddress = addressParts.join(', ') || 'Address not available';
        }
        
        const transformedPet: PetDetails = {
          id: backendPet.id,
          name: backendPet.name,
          breed: backendPet.breed,
          age: backendPet.age,
          gender: backendPet.gender,
          image: backendPet.mainImage ? { uri: backendPet.mainImage } : require('../../../assets/images/placeholder.png'),
          shelter: {
            id: backendPet.shelter?.id || '',
            name: backendPet.shelter?.shelterName || 'Unknown Shelter',
            email: backendPet.shelter?.user?.email || 'Email not available',
            phone: backendPet.shelter?.user?.phone || 'Phone not available',
            address: shelterAddress || 'Address not available',
            contactPerson: backendPet.shelter?.contactPerson || 'Contact person not specified',
            businessHours: backendPet.shelter?.operatingHours || 'Contact shelter for hours',
            adoptionRequirements: [
              'Complete adoption application form',
              'In-person meet & greet appointment',
              'Home check within 2 weeks of application',
              'Valid government-issued ID',
              'Proof of residence (lease/mortgage)',
              'Veterinary references if you have other pets',
              'All household members must meet the pet'
            ]
          },
          userDonationHistory: {
            totalAmount: 0,
            donationCount: 0,
            firstDonation: '',
            lastDonation: '',
            donations: []
          },
          description: backendPet.description || backendPet.story || 'No description available',
          medicalInfo: {
            vaccinated: backendPet.vaccinated || false,
            spayedNeutered: backendPet.spayedNeutered || false,
            microchipped: !!backendPet.microchipNumber,
          },
          adoptionStatus: {
            isAvailable: backendPet.status === 'published',
            hasActiveRequest: false,
          },
          adoptionFee: backendPet.adoptionFee || 0,
        };
        
        
        try {
          
          let donationAmount = 0;
          let donationCount = 0;
          let firstDonation = '';
          let lastDonation = '';
          
          try {
            const individualDonationsRes = await axios.get(`${API_BASE_URL}/donations/user/pet/${petId}`, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (individualDonationsRes.data && individualDonationsRes.data.length > 0) {
              const donations = individualDonationsRes.data;
              donationAmount = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
              donationCount = donations.length;
              
              const sortedDonations = donations.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              firstDonation = sortedDonations[0].createdAt;
              lastDonation = sortedDonations[sortedDonations.length - 1].createdAt;
              
            }
          } catch (individualError) {
            
            
            const supportedPetsRes = await axios.get(`${API_BASE_URL}/donations/supported-pets`, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            
            const supportedPet = supportedPetsRes.data.find((pet: any) => pet.id === petId);
            if (supportedPet && supportedPet.donationSummary) {
              donationAmount = Number(supportedPet.donationSummary.totalDonated) || 0;
              donationCount = Number(supportedPet.donationSummary.donationCount) || 0;
              firstDonation = supportedPet.donationSummary.firstDonationDate || '';
              lastDonation = supportedPet.donationSummary.lastDonationDate || '';
            }
          }
          
          
          transformedPet.userDonationHistory = {
            totalAmount: donationAmount,
            donationCount: donationCount,
            firstDonation: firstDonation,
            lastDonation: lastDonation,
            donations: []
          };
          
    
          try {
            const supportedPetsRes = await axios.get(`${API_BASE_URL}/donations/supported-pets`, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            
            const supportedPet = supportedPetsRes.data.find((pet: any) => pet.id === petId);
            if (supportedPet && supportedPet.shelter) {
              transformedPet.shelter = {
                id: supportedPet.shelter.id || '',
                name: supportedPet.shelter.shelterName || 'Unknown Shelter',
                email: supportedPet.shelter.email || 'Email not available',
                phone: supportedPet.shelter.contact || 'Phone not available',
                address: supportedPet.shelter.location || 'Address not available',
                contactPerson: transformedPet.shelter.contactPerson, 
                businessHours: transformedPet.shelter.businessHours,
                adoptionRequirements: transformedPet.shelter.adoptionRequirements 
              };
            }
          } catch (shelterError) {
            
          }
          
        } catch (donationError) {
          
        }
        
        setPetDetails(transformedPet);

        const userRes = await axios.get(`${API_BASE_URL}/users/profile`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        const userData = userRes.data;
        const userPawPoints = userData.pawPoints || 0;
        
        setUserContact({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: `${userData.street || ''}, ${userData.city || ''}, ${userData.state || ''} ${userData.zip || ''}`.trim(),
          pawPoints: userPawPoints,
        });
        
        if (userPawPoints >= 5) {
          setBonusPointsToUse(0); 
        }
        
      } catch (err: any) {
        setError('Failed to load adoption request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (petId) {
      fetchData();
    }
  }, [petId]);



  const titleFontSize = Math.min(width * FONT_RATIOS.TITLE, 24);


  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!petDetails) {
      errors.push('Pet information not found');
    }
    
    if (!petDetails?.adoptionStatus.isAvailable) {
      errors.push('Pet is no longer available for adoption');
    }
    
    if (petDetails?.adoptionStatus.hasActiveRequest) {
      errors.push('Pet already has an active adoption request');
    }
    
    if (userMessage.length > ADOPTION_REQUEST_CONSTANTS.MESSAGE_MAX_LENGTH) {
      errors.push(`Message too long (${userMessage.length}/${ADOPTION_REQUEST_CONSTANTS.MESSAGE_MAX_LENGTH} characters)`);
    }

    if (!userContact?.name?.trim()) {
      errors.push('Contact name is required');
    }
    
    if (!userContact?.email?.trim()) {
      errors.push('Contact email is required');
    }
    
    return errors;
  }, [petDetails, userMessage, userContact]);


  const isFormValid = useMemo(() => {
    return validateForm().length === 0;
  }, [validateForm]);


  const prepareRequestPayload = useCallback((): AdoptionRequestPayload => {
    if (!petDetails) {
      throw new Error('Pet details not available');
    }
    
    return {
      petId: petDetails.id,
      userId: 'current_user',
      message: userMessage.trim(),
      userContactInfo: {
        name: userContact?.name || '',
        email: userContact?.email || '',
        phone: userContact?.phone || '',
        address: userContact?.address || '',
      },
      donationHistory: petDetails.userDonationHistory,
      requestMetadata: {
        deviceInfo: Platform.OS,
        timestamp: new Date().toISOString(),
        appVersion: '1.0.0', 
      },
    };
  }, [petDetails, userMessage]);


  const handleSubmitRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      

      const existingRequestsRes = await axios.get(`${API_BASE_URL}/adoptions/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const activeRequests = existingRequestsRes.data.filter((req: any) => req.status === 'pending');
      
      if (activeRequests.length > 0) {
        throw new Error('You already have an active adoption request. Please wait for it to be processed or cancel it first.');
      }
      
      await axios.post(
        `${API_BASE_URL}/adoptions/request`,
        {
          petId,
          message: userMessage,
          pawPointsToUse: 5 + bonusPointsToUse, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert({
        title: 'Request Submitted!',
        message: 'Your adoption request has been sent to the shelter. You can track its status on the next page.',
        type: 'success',
        buttonText: 'Continue',
      });
      setTimeout(() => {
        hideAlert();
        router.replace('/adoption/status');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      
      
      showAlert({
        title: 'Cannot Submit Request',
        message: errorMessage,
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  }, [petId, userMessage, bonusPointsToUse, showAlert, hideAlert, router]);

  
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleContactShelter = useCallback(() => {
    if (!petDetails) return;
    
    Alert.alert(
      'Contact Shelter',
      `Call ${petDetails.shelter.name} at ${petDetails.shelter.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
           
          }
        }
      ]
    );
  }, [petDetails]);

  const handleMessageChange = useCallback((text: string) => {
    if (text.length <= ADOPTION_REQUEST_CONSTANTS.MESSAGE_MAX_LENGTH) {
      setUserMessage(text);
    }
  }, []);


  const validatePetAvailability = useCallback(async () => {
    if (!petDetails) return false;
    
    setIsValidating(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return petDetails.adoptionStatus.isAvailable && !petDetails.adoptionStatus.hasActiveRequest;
    } catch (error) {
              return false;
    } finally {
      setIsValidating(false);
    }
  }, [petDetails]);


  const formatCurrency = (amount: number): string => {
 
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  
  const formatDate = (dateString: string): string => {
    if (!dateString) {
      return 'No date available';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image source={require('../../../assets/images/backB.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Loading...</Text>
          <Text style={styles.errorText}>Fetching adoption request details...</Text>
        </View>
      </SafeAreaView>
    );
  }


  if (!petDetails || error) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image source={require('../../../assets/images/backB.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Pet Not Found</Text>
          <Text style={styles.errorText}>{error || 'The requested pet could not be found.'}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity 
        onPress={handleBack} 
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back to eligible pets"
      >
        <Image
          source={require('../../../assets/images/backB.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>Adoption Request</Text>
        <Text style={styles.subtitle}>Request to adopt {petDetails.name}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.petSummaryCard}>
          <View style={styles.petHeader}>
            <Image source={petDetails.image} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{petDetails.name}</Text>
              <Text style={styles.petBreed}>{petDetails.breed}</Text>
              <Text style={styles.petDetails}>{petDetails.age} • {petDetails.gender}</Text>
              
             
            </View>
          </View>
        </View>

       
        <View style={styles.supportCard}>
          <Text style={styles.cardTitle}>Your Support History</Text>
          <View style={styles.supportSummary}>
            <View style={styles.supportStat}>
              <Text style={styles.supportValue}>{formatCurrency(petDetails.userDonationHistory.totalAmount)}</Text>
              <Text style={styles.supportLabel}>Total Donated</Text>
            </View>
            <View style={styles.supportStat}>
              <Text style={styles.supportValue}>{formatDate(petDetails.userDonationHistory.firstDonation)}</Text>
              <Text style={styles.supportLabel}>First Support</Text>
            </View>
          </View>
          
          
        </View>

        
        <View style={styles.shelterCard}>
          <Text style={styles.cardTitle}>Shelter Details</Text>
          
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>{petDetails.shelter.name}</Text>
            
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color="#797979" />
              <Text style={styles.contactText}>{petDetails.shelter.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color="#797979" />
              <Text style={styles.contactText}>{petDetails.shelter.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color="#797979" />
              <Text style={styles.contactText}>{petDetails.shelter.address}</Text>
            </View>
            
          </View>

          
        </View>

       
        <View style={styles.contactCard}>
          <Text style={styles.cardTitle}>Your Contact Information</Text>
          <Text style={styles.contactSubtitle}>
            This information will be sent to the shelter:
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{userContact?.name || 'Loading...'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userContact?.email || 'Loading...'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{userContact?.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{userContact?.address || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        
        {petDetails && petDetails.adoptionFee > 0 && userContact && userContact.pawPoints >= 5 && (
          <View style={styles.feeReductionCard}>
            <Text style={styles.cardTitle}>Adoption Fee Reduction</Text>
            <Text style={styles.feeInfo}>
              Adoption Fee: <Text style={styles.feeAmount}>{formatCurrency(petDetails.adoptionFee)}</Text>
            </Text>
            <Text style={styles.feeInfo}>
              PawPoints Available: <Text style={styles.feeAmount}>{userContact.pawPoints}</Text>
            </Text>
            <Slider
              style={{ width: '100%', height: 40, marginVertical: 20 }}
              minimumValue={0}
              maximumValue={userContact.pawPoints - 5}
              value={bonusPointsToUse}
              step={1}
              minimumTrackTintColor="#AB886D"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#493628"
              onValueChange={(value) => {
                console.log('Bonus points changing to:', value);
                setBonusPointsToUse(Math.round(value));
              }}
              onSlidingComplete={(value) => {
                console.log('Bonus points completed at:', value);
                setBonusPointsToUse(Math.round(value));
              }}
            />
            <Text style={styles.feeFinal}>
              Final Adoption Fee: <Text style={styles.feeAmount}>{formatCurrency(Math.max(0, petDetails.adoptionFee - bonusPointsToUse * 5))}</Text>
            </Text>
            <Text style={styles.feeInfoSmall}>
              5 PawPoints required to unlock adoption (no fee reduction). Additional points reduce the fee by $5 each.
            </Text>
          </View>
        )}

       
        <View style={styles.messageCard}>
          <Text style={styles.cardTitle}>Message to Shelter (Optional)</Text>
          <Text style={styles.messageSubtitle}>
            Tell the shelter why you'd like to adopt {petDetails.name}:
          </Text>
          <TextInput
            style={styles.messageInput}
            value={userMessage}
            onChangeText={handleMessageChange}
            placeholder={`I'm interested in adopting ${petDetails.name} because...`}
            placeholderTextColor="#797979"
            multiline
            textAlignVertical="top"
            maxLength={ADOPTION_REQUEST_CONSTANTS.MESSAGE_MAX_LENGTH}
          />
          <Text style={styles.characterCount}>
            {userMessage.length}/{ADOPTION_REQUEST_CONSTANTS.MESSAGE_MAX_LENGTH}
          </Text>
        </View>


        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (!isFormValid || isSubmitting || isValidating) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitRequest}
            disabled={!isFormValid || isSubmitting || isValidating}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting Request...</Text>
            ) : isValidating ? (
              <Text style={styles.submitButtonText}>Validating...</Text>
            ) : (
              <>
                
                <Text style={styles.submitButtonText}>Submit Adoption Request</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.submitDisclaimer}>
            By submitting this request, you agree that the shelter will contact you directly 
            to begin their adoption process. You can only have one active request at a time.
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
  backButton: {
    position: 'absolute',
    top: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
    left: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#797979',
    resizeMode: 'contain',
  },
  header: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: 80,
    height: DESIGN_CONSTANTS.STANDARDIZED_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.MEDIUM,
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_RATIOS.SUBTITLE,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  
  petSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  petHeader: {
    flexDirection: 'row',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.LARGE,
  },
  petInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.SMALL,
  },
  medicalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicalText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#2E7D32',
    marginLeft: 4,
    flex: 1,
  },

  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  cardTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  supportSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  supportStat: {
    alignItems: 'center',
    flex: 1,
  },
  supportValue: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  supportLabel: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
  },
  donationHistory: {
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  donationDate: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    flex: 1,
  },
  donationAmount: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
    textAlign: 'right',
  },

  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  shelterInfo: {
    marginBottom: SPACING.LARGE,
  },
  shelterName: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginLeft: SPACING.SMALL,
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingVertical: SPACING.MEDIUM,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#AB886D',
    marginLeft: SPACING.SMALL,
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  contactSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.MEDIUM,
  },
  contactInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.SMALL,
    padding: SPACING.MEDIUM,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#797979',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    flex: 2,
    textAlign: 'right',
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  messageSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.MEDIUM,
  },
  messageInput: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: '#F8F9FA',
    borderRadius: SPACING.SMALL,
    padding: SPACING.MEDIUM,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: SPACING.SMALL,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'right',
  },

  submitContainer: {
    marginBottom: SPACING.LARGE,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.MEDIUM,
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
  submitButtonDisabled: {
    backgroundColor: '#D6C0B3',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  submitDisclaimer: {
    fontSize: 12,
    fontFamily: 'PoppinsItalic',
    color: '#797979',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SPACING.MEDIUM,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
  errorButton: {
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    paddingVertical: SPACING.MEDIUM,
  },
  errorButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },

  bottomSpacing: {
    height: 100,
  },

  feeReductionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  feeInfo: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.SMALL,
  },
  feeAmount: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
  },
  feeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
  },
  feeSummaryText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  feeFinal: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
    marginBottom: SPACING.SMALL,
  },
  feeInfoSmall: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
});

export default AdoptionRequestDetailsPage;

