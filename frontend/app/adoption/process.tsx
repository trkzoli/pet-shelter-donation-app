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
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import { setTabsUI } from '../../config/systemUI';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 16,
  BORDER_RADIUS: 15,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 50,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

interface UserAdoptionStatus {
  canRequestAdoption: boolean;
  activeRequest: {
    petId: string;
    petName: string;
    requestDate: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    canCancel: boolean;
  } | null;
  nextRequestAvailable: string | null;
  pawPoints: number;
  profileCompleteness: number;
  eligiblePetsCount: number;
}

interface EligiblePetStatus {
  id: string;
  name: string;
  hasActiveRequest: boolean;
  activeRequestUserId: string | null;
  adoptionStatus: 'available' | 'pending_adoption' | 'adopted';
}


const MOCK_PET_AVAILABILITY: EligiblePetStatus[] = [
  {
    id: 'pet1',
    name: 'Rex',
    hasActiveRequest: false,
    activeRequestUserId: null,
    adoptionStatus: 'available',
  },
  {
    id: 'pet2', 
    name: 'Bella',
    hasActiveRequest: true,
    activeRequestUserId: 'other_user_123',
    adoptionStatus: 'pending_adoption',
  },
  {
    id: 'pet3',
    name: 'Whiskers', 
    hasActiveRequest: false,
    activeRequestUserId: null,
    adoptionStatus: 'available',
  },
];

const MOCK_ADOPTION_STATUS: UserAdoptionStatus = {
  canRequestAdoption: true,
  activeRequest: null,
  nextRequestAvailable: null,
  pawPoints: 9,
  profileCompleteness: 95,
  eligiblePetsCount: MOCK_PET_AVAILABILITY.filter(pet => 
    !pet.hasActiveRequest && pet.adoptionStatus === 'available'
  ).length, 
};

const RealAdoptionProcessPage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  const [refreshing, setRefreshing] = useState(false);
  const [adoptionStatus, setAdoptionStatus] = useState<UserAdoptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const STANDARDIZED_HEADER_HEIGHT = 140;
  const titleFontSize = Math.min(width * 0.055, 24); 
  const bodyFontSize = Math.min(width * 0.035, 16); 


  const meetsRequirements = useMemo(() => {
    return (adoptionStatus?.pawPoints ?? 0) >= 5 && (adoptionStatus?.profileCompleteness ?? 0) >= 100;
  }, [adoptionStatus]);

  const timeUntilNextRequest = useMemo(() => {
    if (!adoptionStatus?.nextRequestAvailable) return null;
    
    const now = new Date();
    const nextAvailable = new Date(adoptionStatus.nextRequestAvailable);
    const diffTime = nextAvailable.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return null;
    return diffDays;
  }, [adoptionStatus]);

  const fetchAdoptionStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API_BASE_URL}/adoptions/eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      const backendData = res.data;
      const adaptedData: UserAdoptionStatus = {
        canRequestAdoption: backendData.isEligible,
        activeRequest: null, 
        nextRequestAvailable: null, 
        pawPoints: backendData.pawPoints,
        profileCompleteness: backendData.profileCompleteness,
        eligiblePetsCount: 0, 
      };
      
      setAdoptionStatus(adaptedData);
    } catch (err: any) {
      setError('Failed to load adoption status. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdoptionStatus();
  }, [fetchAdoptionStatus]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleViewEligiblePets = useCallback(() => {

    router.push('/adoption/eligible-pets');
  }, [router]);

  const handleViewRequestStatus = useCallback(() => {
    router.push('/adoption/status');
  }, [router]);

  const handleCancelRequest = useCallback(() => {
    if (!adoptionStatus?.activeRequest?.canCancel) return;

    showAlert({
      title: 'Cancel Adoption Request',
      message: 'Are you sure you want to cancel your adoption request? You can submit a new request in 3 days.',
      type: 'warning',
      buttonText: 'Yes, Cancel'
    });


  }, [adoptionStatus?.activeRequest, showAlert]);


  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  const StatusCard = () => {
    if (adoptionStatus?.activeRequest) {

      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: '#FFD43B' }]} />
            <Text style={styles.statusTitle}>Active Adoption Request</Text>
          </View>
          
          <Text style={styles.statusPetName}>{adoptionStatus.activeRequest.petName}</Text>
          <Text style={styles.statusDate}>
            Requested on {formatDate(adoptionStatus.activeRequest.requestDate)}
          </Text>
          <Text style={styles.statusMessage}>
            The shelter will contact you directly via email to begin the adoption process.
          </Text>

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewRequestStatus}
            >
              <Text style={styles.primaryButtonText}>View Request Status</Text>
            </TouchableOpacity>

            {adoptionStatus.activeRequest.canCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRequest}
              >
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    } else if (timeUntilNextRequest) {

      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.statusTitle}>Request Cooldown</Text>
          </View>
          
          <Text style={styles.cooldownText}>
            Next adoption request available in {timeUntilNextRequest} {timeUntilNextRequest === 1 ? 'day' : 'days'}
          </Text>
          <Text style={styles.statusMessage}>
            This waiting period helps ensure each adoption request receives proper attention.
          </Text>
        </View>
      );
    } else {
      
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            
            <Text style={styles.statusTitle}>Ready to Adopt</Text>
          </View>
          
          <Text style={styles.statusMessage}>
            Start your real adoption journey by selecting a pet you've supported.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewEligiblePets}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              View Eligible Pets
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
 
      <TouchableOpacity 
        onPress={handleBack} 
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back to profile"
      >
        <Image
          source={require('../../assets/images/backB.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>


      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>Real Adoption</Text>
        <Text style={styles.subtitle}>From virtual support to forever home</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#AB886D']}
            tintColor="#AB886D"
          />
        }
      >

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>Important Rules</Text>
          </View>
          <Text style={styles.noticeText}>
            • You can only have <Text style={styles.boldText}>ONE active adoption request</Text> at a time{'\n'}
            • Minimum requirements: <Text style={styles.boldText}>5 PawPoints + 100% profile completion</Text>{'\n'}
            • After submitting a request, you must wait 1 week before making another{'\n'}
            • You can cancel within 24 hours and reapply after 3 days{'\n'}
            • Pets with pending requests by others are temporarily unavailable
          </Text>
        </View>

 
        <View style={styles.processCard}>
          <Text style={styles.processTitle}>How Real Adoption Works</Text>
          
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select Your Pet</Text>
              <Text style={styles.stepDescription}>Choose from pets you've supported with donations</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Submit Request</Text>
              <Text style={styles.stepDescription}>We'll send your details and donation history to the shelter</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Shelter Contact</Text>
              <Text style={styles.stepDescription}>The shelter will contact you directly to begin their adoption process</Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Complete Adoption</Text>
              <Text style={styles.stepDescription}>Follow the shelter's requirements (application, visit, home check, etc.)</Text>
            </View>
          </View>
        </View>


        <StatusCard />

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
    height: 140, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsItalic',
    color: '#797979',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  noticeCard: {
    backgroundColor: '#493628', 
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
  },
  noticeHeader: {
    marginBottom: SPACING.MEDIUM,
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1', 
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#E4E0E1', 
    lineHeight: 20,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: 'PoppinsBold',
    color: '#AB886D',
  },
  requirementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementsTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  requirementDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.MEDIUM,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginLeft: SPACING.SMALL,
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.SMALL,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  statusPetName: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.SMALL,
  },
  statusMessage: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 20,
    marginBottom: SPACING.LARGE,
  },
  eligibleText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#2E7D32',
    marginBottom: SPACING.SMALL,
  },
  cooldownText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#D32F2F',
    marginBottom: SPACING.SMALL,
  },
  statusButtons: {
    gap: SPACING.SMALL,
  },
  primaryButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  disabledButton: {
    backgroundColor: '#D6C0B3',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#797979',
  },
  cancelButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6B6B',
  },
  processCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  processTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.LARGE,
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: SPACING.LARGE,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#493628',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default RealAdoptionProcessPage;