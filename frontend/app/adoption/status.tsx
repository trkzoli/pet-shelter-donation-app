import React, { useState, useCallback, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal, LogoutModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 16,
  BORDER_RADIUS: 15,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 50,
  ICON_SIZE: 80,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petImage: any;
  shelterName: string;
  shelterEmail: string;
  shelterPhone: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  canCancel: boolean; 
  estimatedResponseTime: string;
  lastUpdate: string;
  statusHistory: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
}

const AdoptionStatusPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  
  
  const [adoptionRequest, setAdoptionRequest] = useState<AdoptionRequest | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isNewRequest, setIsNewRequest] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  
  const successAnimation = useState(new Animated.Value(0))[0];

 
  const titleFontSize = width * 0.055;


  const fetchAdoptionRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API_BASE_URL}/adoptions/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const petIdParam = params.petId as string | undefined;
      const backendRequest = res.data && res.data.length > 0
        ? (petIdParam
          ? res.data.find((req: any) => req.petId === petIdParam) || res.data[0]
          : res.data[0])
        : null;
      
      if (backendRequest) {

        try {
          const petRes = await axios.get(`${API_BASE_URL}/pets/${backendRequest.petId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const petData = petRes.data;
          
          let shelterName = 'Unknown Shelter';
          let shelterEmail = 'Not available';
          let shelterPhone = 'Not available';
          
          if (petData.shelter) {
            shelterName = petData.shelter.shelterName || 'Unknown Shelter';
            
  
            if (petData.shelter.user) {
              shelterEmail = petData.shelter.user.email || 'Not available';
              shelterPhone = petData.shelter.user.phone || 'Not available';
            } else {
              
              try {
                const supportedPetsRes = await axios.get(`${API_BASE_URL}/donations/supported-pets`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                const supportedPet = supportedPetsRes.data.find((pet: any) => pet.id === backendRequest.petId);
                if (supportedPet && supportedPet.shelter) {
                  shelterEmail = supportedPet.shelter.email || shelterEmail;
                  shelterPhone = supportedPet.shelter.contact || shelterPhone;
                }
              } catch (supportedPetsError) {

              }
            }
          }
 
          const transformedRequest: AdoptionRequest = {
            id: backendRequest.id,
            petId: backendRequest.petId,
            petName: backendRequest.pet?.name || 'Unknown Pet',
            petImage: backendRequest.pet?.mainImage 
              ? { uri: backendRequest.pet.mainImage }
              : require('../../assets/images/placeholder.png'),
            shelterName: shelterName,
            shelterEmail: shelterEmail,
            shelterPhone: shelterPhone,
            requestDate: backendRequest.createdAt,
            status: backendRequest.status,
            canCancel: backendRequest.canBeCancelled,
            estimatedResponseTime: '2-3 business days',
            lastUpdate: backendRequest.updatedAt,
            statusHistory: [
              {
                status: backendRequest.status,
                date: backendRequest.createdAt,
                note: backendRequest.statusReason || undefined,
              },
            ],
          };
          
          setAdoptionRequest(transformedRequest);
        } catch (petError) {

          const transformedRequest: AdoptionRequest = {
            id: backendRequest.id,
            petId: backendRequest.petId,
            petName: backendRequest.pet?.name || 'Unknown Pet',
            petImage: backendRequest.pet?.mainImage 
              ? { uri: backendRequest.pet.mainImage }
              : require('../../assets/images/placeholder.png'),
            shelterName: 'Shelter information not available',
            shelterEmail: 'Not available',
            shelterPhone: 'Not available',
            requestDate: backendRequest.createdAt,
            status: backendRequest.status,
            canCancel: backendRequest.canBeCancelled,
            estimatedResponseTime: '2-3 business days',
            lastUpdate: backendRequest.updatedAt,
            statusHistory: [
              {
                status: backendRequest.status,
                date: backendRequest.createdAt,
                note: backendRequest.statusReason || undefined,
              },
            ],
          };
          
          setAdoptionRequest(transformedRequest);
        }
      } else {
        setAdoptionRequest(null);
      }
      
      setIsNewRequest(false);
    } catch (err: any) {
      setError('Failed to load adoption request status. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdoptionRequest();
  }, [fetchAdoptionRequest]);

  useEffect(() => {
    if (isNewRequest) {
      Animated.sequence([
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(successAnimation, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNewRequest, successAnimation]);


  const handleBack = useCallback(() => {
   
    router.push('/profile');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsNewRequest(false); 
    } catch (error) {
    
    } finally {
      setRefreshing(false);
    }
  }, []);


  const handleCancelRequest = useCallback(async () => {
    if (!adoptionRequest?.canCancel) {
      showAlert({
        title: 'Cannot Cancel',
        message: 'You can only cancel your adoption request within 24 hours of submission.',
        type: 'warning',
        buttonText: 'Understood',
      });
      return;
    }
    

    setShowCancelConfirmation(true);
  }, [adoptionRequest, showAlert]);


  const confirmCancelRequest = useCallback(async () => {
    if (!adoptionRequest) return;
    
    setLoading(true);
    setShowCancelConfirmation(false);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      await axios.put(
        `${API_BASE_URL}/adoptions/${adoptionRequest.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showAlert({
        title: 'Request Cancelled',
        message: 'Your adoption request has been cancelled. You can submit a new request in 3 days.',
        type: 'success',
        buttonText: 'OK',
      });
      
      setTimeout(() => {
        hideAlert();

        router.replace('/adoption/eligible-pets');
      }, 2000);
      
    } catch (err: any) {
      showAlert({
        title: 'Cancellation Failed',
        message: 'Could not cancel your adoption request. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  }, [adoptionRequest, showAlert, hideAlert, router]);


  const cancelCancelRequest = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  const handleContactShelter = useCallback(() => {
    showAlert({
      title: 'Contact Shelter',
      message: `Would you like to call ${adoptionRequest?.shelterName} at ${adoptionRequest?.shelterPhone}?`,
      type: 'info',
      buttonText: 'Call Now'
    });
  }, [adoptionRequest, showAlert]);

  const handleReturnToProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Text style={[styles.title, { fontSize: titleFontSize }]}>Request Status</Text>
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

        {isNewRequest && (
          <Animated.View 
            style={[
              styles.successContainer,
              {
                opacity: successAnimation,
                transform: [
                  {
                    scale: successAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={50} color="#51CF66" />
            </View>
            <Text style={styles.successTitle}>Request Sent Successfully!</Text>
            <Text style={styles.successMessage}>
              Your adoption request has been sent to {adoptionRequest?.shelterName}. 
              They will contact you directly within {adoptionRequest?.estimatedResponseTime}.
            </Text>
          </Animated.View>
        )}

 
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Adoption Request</Text>
          </View>

          <View style={styles.petInfo}>
            <Image source={adoptionRequest?.petImage} style={styles.petImage} />
            <View style={styles.petDetails}>
              <Text style={styles.petName}>{adoptionRequest?.petName}</Text>
              <Text style={styles.shelterName}>{adoptionRequest?.shelterName}</Text>
              <Text style={styles.requestDate}>
                Submitted on {adoptionRequest?.requestDate ? formatDate(adoptionRequest.requestDate) : 'Unknown date'}
              </Text>
              <Text style={styles.statusSimple}>
                Status: {adoptionRequest?.status?.toUpperCase() || 'PENDING'}
              </Text>
            </View>
          </View>
        </View>


        <View style={styles.shelterCard}>
          <Text style={styles.cardTitle}>Shelter Contact</Text>
          <Text style={styles.cardSubtitle}>
            You can contact the shelter directly if you have questions:
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="business-outline" size={18} color="#AB886D" />
              <Text style={styles.contactText}>{adoptionRequest?.shelterName}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={18} color="#AB886D" />
              <Text style={styles.contactText}>{adoptionRequest?.shelterPhone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={18} color="#AB886D" />
              <Text style={styles.contactText}>{adoptionRequest?.shelterEmail}</Text>
            </View>
          </View>
        </View>


        <View style={styles.actionsContainer}>
          {adoptionRequest?.canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRequest}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FF6B6B" />
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleReturnToProfile}
          >
            <Ionicons name="person-outline" size={20} color="#AB886D" />
            <Text style={styles.profileButtonText}>Return to Profile</Text>
          </TouchableOpacity>
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


      <LogoutModal
        visible={showCancelConfirmation}
        onConfirm={confirmCancelRequest}
        onCancel={cancelCancelRequest}
        title="Cancel Adoption Request"
        message={`Are you sure you want to cancel your adoption request for ${adoptionRequest?.petName}? You can submit a new request in 3 days.`}
        confirmText={loading ? 'Cancelling...' : 'Yes, Cancel'}
        cancelText="Keep Request"
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
    paddingBottom: SPACING.LARGE,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },


  successContainer: {
    alignItems: 'center',
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING * 2,
    paddingVertical: SPACING.EXTRA_LARGE,
  },
  successIcon: {
    width: DESIGN_CONSTANTS.ICON_SIZE,
    height: DESIGN_CONSTANTS.ICON_SIZE,
    borderRadius: DESIGN_CONSTANTS.ICON_SIZE / 2,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.LARGE,
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
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#1976D2',
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
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.MEDIUM,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#AB886D',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  statusSimple: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#AB886D',
    marginTop: 4,
  },
  statusDetails: {
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 20,
  },

  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: SPACING.LARGE,
  },
  contactInfo: {
    marginBottom: SPACING.LARGE,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginLeft: SPACING.MEDIUM,
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

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.LARGE,
  },
  futureTimelineItem: {
    opacity: 0.5,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#51CF66',
    marginRight: SPACING.MEDIUM,
    marginTop: 4,
  },
  futureTimelineDot: {
    backgroundColor: '#D0D0D0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#493628',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 2,
  },
  timelineNote: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 18,
  },
  futureTimelineText: {
    color: '#B0B0B0',
  },

  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginLeft: SPACING.SMALL,
  },
  infoItem: {
    marginBottom: SPACING.MEDIUM,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 18,
    marginLeft: SPACING.MEDIUM,
  },

  actionsContainer: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6B6B',
    marginLeft: SPACING.SMALL,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  profileButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    marginLeft: SPACING.SMALL,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default AdoptionStatusPage;
