import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import ShelterSettingsModal from '../../components/modals/ShelterSettingsModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { setTabsUI } from '../../config/systemUI';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 15,
  BORDER_RADIUS: 15,
  PROFILE_IMAGE_SIZE: 100,
  BUTTON_HEIGHT: 55,
  HEADER_HEIGHT: 80,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.042,
  SECTION_TITLE: 0.036,
  BODY_TEXT: 0.032,
  BUTTON_TEXT: 0.034,
  INFO_TEXT: 0.03,
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

const ShelterProfilePage: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shelterData, setShelterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchShelterProfile = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setShelterData(null);
        setLoading(false);
        return;
      }
      
      const res = await axios.get(`${API_BASE_URL}/shelters/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShelterData(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('SHELTER PROFILE: Error fetching profile:', err);
      
    
      if (err.response?.status === 401) {
        setShelterData(null);
        setLoading(false);
        
      } else if (err.message === 'Not authenticated') {
       
        console.log('SHELTER PROFILE: No authentication token, showing default state');
        setShelterData(null);
        setLoading(false);
      } else {
        
        setError('Unable to load profile. Please check your connection and try again.');
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    fetchShelterProfile();
  }, [fetchShelterProfile]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        setTabsUI();
      }
    }, [])
  );


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const profileImageSize = Math.min(width * 0.25, DESIGN_CONSTANTS.PROFILE_IMAGE_SIZE);
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const bodyFontSize = width * FONT_RATIOS.BODY_TEXT;

  const profileCompletion = useMemo(() => {
    if (!shelterData) return 0;

    const requiredShelterFields = [
      'shelterName',
      'description',
      'petSpecialization',
      'licenseNumber',
      'yearEstablished',
      'contactPerson',
    ];
    const requiredUserFields = ['email', 'phone', 'street', 'city', 'state', 'zip', 'country'];

    const petSpecialization = String(shelterData.petSpecialization || '').toLowerCase();
    const contactPerson = String(shelterData.contactPerson || '').toLowerCase();
    const licenseNumber = String(shelterData.licenseNumber || '');
    const yearEstablished = Number(shelterData.yearEstablished || 0);
    const shelterName = String(shelterData.shelterName || '');
    const userName = String(shelterData.user?.name || '');

    const isDefaultShelterProfile =
      (!shelterData.description || shelterData.description === '') &&
      (petSpecialization === 'both' || petSpecialization === '') &&
      licenseNumber.startsWith('TEMP-') &&
      yearEstablished === 2000 &&
      contactPerson === 'to be completed';

    const isShelterFieldFilled = (field: string) => {
      const value = shelterData[field];
      if (value === null || value === undefined || value === '') return false;
      if (!isDefaultShelterProfile) return true;

      if (field === 'shelterName' && shelterName === userName) return false;
      if (field === 'petSpecialization' && (petSpecialization === 'both' || petSpecialization === '')) return false;
      if (field === 'licenseNumber' && licenseNumber.startsWith('TEMP-')) return false;
      if (field === 'yearEstablished' && yearEstablished === 2000) return false;
      if (field === 'contactPerson' && contactPerson === 'to be completed') return false;
      return true;
    };

    const filledShelterFields = requiredShelterFields.filter(isShelterFieldFilled);

    const filledUserFields = requiredUserFields.filter((field) => {
      const value = shelterData.user?.[field];
      return value !== null && value !== undefined && value !== '';
    });

    const totalRequired = requiredShelterFields.length + requiredUserFields.length;
    const totalFilled = filledShelterFields.length + filledUserFields.length;
    return Math.round((totalFilled / totalRequired) * 100);
  }, [shelterData]);

  const isProfileComplete = profileCompletion >= 100;

  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchShelterProfile();
    setRefreshing(false);
  }, [fetchShelterProfile]);

  const handleEditProfile = useCallback(() => {
    router.push('/shelter/profile/edit');
  }, [router]);

  const handleViewCampaignsPress = useCallback(() => {
    router.push('/shelter/campaigns');
  }, [router]);

  const handleCreateBannerPress = useCallback(() => {
    router.push('/shelter/banners/create');
  }, [router]);

  const handleProfileImagePress = useCallback(async () => {
  
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permission Denied',
        message: 'Permission to access media library is required.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) {
      if (Platform.OS === 'android') {
        setTabsUI();
      }
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        throw new Error('No image data available');
      }

      const fileName = asset.fileName || asset.uri.split('/').pop() || `profile-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

      const formData = new FormData();
      formData.append(
        'image',
        {
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        } as any
      );

      const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const res = { data: await response.json() };
     
      setShelterData((prev: any) => ({ 
        ...prev, 
        user: { 
          ...prev?.user, 
          profileImage: res.data.imageUrl 
        } 
      }));
      showAlert({
        title: 'Profile Updated',
        message: 'Your profile picture has been updated.',
        type: 'success',
        buttonText: 'OK',
      });
    } catch (err: any) {
      showAlert({
        title: 'Upload Failed',
        message: err?.response?.data?.message || 'Failed to upload profile picture. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      if (Platform.OS === 'android') {
        setTabsUI();
      }
    }
  }, [showAlert]);



  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: height * 0.05 }]}>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setSettingsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={28} color="#797979" />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Shelter Profile
        </Text>
        

        <View style={styles.headerPlaceholder} />
      </View>

      {error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
      
      {loading && !error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#493628', textAlign: 'center' }}>Loading profile...</Text>
        </View>
      )}
      


      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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

        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={shelterData?.user?.profileImage ? { uri: shelterData.user.profileImage } : require('../../assets/images/pphr.png')}
              style={[styles.profileImage, { width: profileImageSize, height: profileImageSize }]}
            />
            <TouchableOpacity style={styles.profileImageOverlay} onPress={handleProfileImagePress}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { fontSize: sectionTitleFontSize }]}>
            {shelterData?.shelterName || shelterData?.user?.name || 'Shelter'}
          </Text>
          <Text style={[styles.profileEmail, { fontSize: bodyFontSize }]}>
            {shelterData?.user?.email || ''}
          </Text>
        </View>

        <View style={styles.overviewContainer}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Shelter Overview
          </Text>
          
          <View style={styles.statsGrid}>

            <View style={[styles.statCard, styles.adoptionsCard]}>
              <View style={styles.statContent}>
                
                <View style={styles.statTextContainer}>
                  <Text style={[styles.statValue, styles.statValueDark]}>
                    {shelterData?.adoptionsCompleted || 0}
                  </Text>
                  <Text style={[styles.statLabel, styles.statLabelDark]}>
                    Completed Adoptions 
                  </Text>
                </View>
              </View>
            </View>


            <View style={[styles.statCard, styles.petsCard]}>
              <View style={styles.statContent}>
                
                <View style={styles.statTextContainer}>
                  <Text style={[styles.statValue, styles.statValueDark]}>
                    {shelterData?.currentPublishedPets || 0}
                  </Text>
                  <Text style={[styles.statLabel, styles.statLabelDark]}>
                    Current Published Pets
                  </Text>
                </View>
              </View>
            </View>
          </View>

         
          <View style={[
            styles.verificationContainer,
            isProfileComplete ? styles.verificationContainerComplete : styles.verificationContainerIncomplete
          ]}>
            <View style={styles.verificationContent}>
              <View style={[
                styles.verificationIcon,
                isProfileComplete ? styles.verificationIconComplete : styles.verificationIconIncomplete
              ]}>
                <Ionicons 
                  name={isProfileComplete ? "shield-checkmark" : "shield-outline"} 
                  size={24} 
                  color={isProfileComplete ? "#51CF66" : "#797979"} 
                />
              </View>
              <View style={styles.verificationTextContainer}>
                <Text style={[
                  styles.verificationTitle, 
                  { fontSize: sectionTitleFontSize },
                  isProfileComplete ? styles.verificationTitleComplete : styles.verificationTitleIncomplete
                ]}>
                  {isProfileComplete ? "Verified Shelter" : "Get Verified"}
                </Text>
                <Text style={[
                  styles.verificationSubtitle, 
                  { fontSize: bodyFontSize },
                  isProfileComplete ? styles.verificationSubtitleComplete : styles.verificationSubtitleIncomplete
                ]}>
                  {isProfileComplete 
                    ? "Your shelter is verified and can add pets to Pawner" 
                    : "Complete your profile to be able to add pets to Pawner and create campaigns"
                  }
                </Text>
              </View>
              <View style={[
                styles.verificationBadge,
                isProfileComplete ? styles.verificationBadgeComplete : styles.verificationBadgeIncomplete
              ]}>
                <Text style={[
                  styles.verificationBadgeText,
                  isProfileComplete ? styles.verificationBadgeTextComplete : styles.verificationBadgeTextIncomplete
                ]}>
                  {isProfileComplete ? "Verified" : `${profileCompletion}%`}
                </Text>
              </View>
            </View>
          </View>

          {/* Donations Card */}
          <View style={styles.donationCard}>
            <View style={styles.donationContent}>
              <View style={styles.donationIcon}>
                <Ionicons name="gift" size={24} color="#493628" />
              </View>
              <View style={styles.donationTextContainer}>
                <Text style={[styles.donationAmount, { fontSize: sectionTitleFontSize }]}>
                  ${shelterData?.totalDonationsReceived?.toLocaleString() || ''}
                </Text>
                <Text style={[styles.donationLabel, { fontSize: bodyFontSize }]}>
                  Total donations received
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Other Actions
          </Text>

          {/* Create Banner Campaign */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateBannerPress}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="megaphone-outline" size={24} color="#493628" />
              <View style={styles.actionButtonTextContainer}>
                <Text style={[styles.actionButtonTitle, { fontSize: sectionTitleFontSize }]}>
                  Create Banner Campaign
                </Text>
                <Text style={[styles.actionButtonSubtitle, { fontSize: bodyFontSize }]}>
                  Promote urgent needs and special campaigns to donors
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Campaign Progress */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewCampaignsPress}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="analytics-outline" size={24} color="#493628" />
              <View style={styles.actionButtonTextContainer}>
                <Text style={[styles.actionButtonTitle, { fontSize: sectionTitleFontSize }]}>
                  Campaign Progress
                </Text>
                <Text style={[styles.actionButtonSubtitle, { fontSize: bodyFontSize }]}>
                  Track your banner campaigns and donation progress
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Shelter Settings Modal */}
      <ShelterSettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        shelterData={shelterData}
      />

      {/* Alert Modal */}
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.SMALL,
    backgroundColor: '#E4E0E1',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.LARGE,
  },
  
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.EXTRA_LARGE,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.MEDIUM,
  },
  profileImage: {
    borderRadius: DESIGN_CONSTANTS.PROFILE_IMAGE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#AB886D',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
  },
  
  overviewContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.LARGE,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  statCard: {
    flex: 1,
    padding: SPACING.LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
  },
  adoptionsCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  petsCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTextContainer: {
    marginLeft: SPACING.SMALL,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginBottom: 2,
  },
  statValueDark: {
    color: '#493628',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
  },
  statLabelDark: {
    color: '#797979',
  },
  
  verificationContainer: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    alignItems: 'center',
  },
  verificationContainerComplete: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#51CF66',
  },
  verificationContainerIncomplete: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD43B',
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.EXTRA_LARGE,
  },
  verificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.LARGE,
  },
  verificationIconComplete: {
    backgroundColor: '#E8F5E8',
  },
  verificationIconIncomplete: {
    backgroundColor: '#F8F9FA',
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontFamily: 'PoppinsBold',
    marginBottom: 2,
  },
  verificationTitleComplete: {
    color: '#51CF66',
  },
  verificationTitleIncomplete: {
    color: '#493628',
  },
  verificationSubtitle: {
    fontFamily: 'PoppinsRegular',
    lineHeight: 18,
  },
  verificationSubtitleComplete: {
    color: '#51CF66',
  },
  verificationSubtitleIncomplete: {
    color: '#797979',
  },
  verificationBadge: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 12,
    marginLeft: SPACING.SMALL,
  },
  verificationBadgeComplete: {
    backgroundColor: '#493628',
  },
  verificationBadgeIncomplete: {
    backgroundColor: '#FFD43B',
  },
  verificationBadgeText: {
    fontSize: 11,
    fontFamily: 'PoppinsBold',
  },
  verificationBadgeTextComplete: {
    color: '#797979',
  },
  verificationBadgeTextIncomplete: {
    color: '#493628',
  },
  
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  donationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.EXTRA_LARGE,
  },
  donationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.LARGE,
  },
  donationTextContainer: {
    flex: 1,
  },
  donationAmount: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  donationLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  
  actionsContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.EXTRA_LARGE,
  },
  
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.LARGE,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.EXTRA_LARGE,
  },
  actionButtonTextContainer: {
    flex: 1,
    marginLeft: SPACING.LARGE,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    lineHeight: 18,
  },
  
  bottomSpacing: {
    height: 140,
      },
});

export default ShelterProfilePage;

