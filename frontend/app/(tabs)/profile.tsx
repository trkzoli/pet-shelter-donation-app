import React, { useState, useCallback, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import SettingsModal from '../../components/modals/SettingsModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

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
  HEADER_TITLE: 0.055,
  SECTION_TITLE: 0.045,
  BODY_TEXT: 0.035,
} as const;


const MOCK_USER_DATA = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profileImage: require('../../assets/images/pphr.png'),
  pawPoints: 12,
  totalDonated: 345.50,
  profileCompleteness: 90,
  donationCount: 18,
  joinDate: '2024-02-15',
  lastDonation: '2024-06-01',
} as const;


const PAW_POINTS_CONFIG = {
  POINTS_PER_25_DOLLARS: 1,
  REAL_ADOPTION_MIN_POINTS: 5,
  REAL_ADOPTION_MIN_PROFILE: 100,
} as const;

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [pawPoints, setPawPoints] = useState<number>(0);
  const [totalDonated, setTotalDonated] = useState<number>(0);


  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const [profileRes, pawPointsRes, donationStatsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/users/pawpoints`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/donations/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUserData(profileRes.data);
      setPawPoints(pawPointsRes.data.balance ?? 0);
      setTotalDonated(donationStatsRes.data.totalDonated ?? pawPointsRes.data.totalDonated ?? 0);
    } catch (err: any) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);





  
  const isRealAdoptionEligible = 
    pawPoints >= PAW_POINTS_CONFIG.REAL_ADOPTION_MIN_POINTS &&
    (userData?.profileCompleteness ?? 0) >= PAW_POINTS_CONFIG.REAL_ADOPTION_MIN_PROFILE;


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const profileImageSize = Math.min(width * 0.25, DESIGN_CONSTANTS.PROFILE_IMAGE_SIZE);
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const bodyFontSize = width * FONT_RATIOS.BODY_TEXT;

  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}/users/recalculate-profile`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile recalculation triggered');
      }
    } catch (err) {
      console.log('Profile recalculation failed, proceeding with normal refresh');
    } finally {
      
      await fetchProfile();
    }
  }, [fetchProfile]);

  const toggleSettingsModal = useCallback(() => {
    setSettingsVisible(prev => !prev);
  }, []);

  const handleRealAdoptionPress = useCallback(() => {
    if (!isRealAdoptionEligible) {
      showAlert({
        title: 'Real Adoption Requirements',
        message: 'You need 5 PawPoints and 100% complete profile to unlock this feature.',
        type: 'info',
        buttonText: 'Got it'
      });
      return;
    }

    router.push('/adoption/process');
  }, [isRealAdoptionEligible, router, showAlert]);

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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (result.canceled) return;
    
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
  
      setUserData((prev: any) => ({ 
        ...prev, 
        profileImage: res.data.imageUrl 
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
        message: err?.response?.data?.message || err.message || 'Failed to upload profile picture. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    }
  }, [showAlert]);


  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={[styles.header, { paddingTop: height * 0.05 }]}>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={toggleSettingsModal}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={28} color="#797979" />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Your Profile
        </Text>
        
      
        <View style={styles.headerPlaceholder} />
      </View>

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
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleProfileImagePress}
            activeOpacity={0.8}
          >
            <Image
              source={userData?.profileImage ? { uri: userData.profileImage } : MOCK_USER_DATA.profileImage}
              style={[styles.profileImage, { width: profileImageSize, height: profileImageSize }]}
            />
            <View style={styles.profileImageOverlay}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.profileName, { fontSize: sectionTitleFontSize * 1.2 }]}>
            {userData?.name || MOCK_USER_DATA.name}
          </Text>
          
          <Text style={styles.profileEmail}>
            {userData?.email || MOCK_USER_DATA.email}
          </Text>
        </View>

 
        <View style={styles.overviewContainer}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Overview
          </Text>
          
          <View style={styles.statsGrid}>
       
            <View style={[styles.statCard, styles.pawPointsCard]}>
              <View style={styles.statCardHeader}>
                <Image 
                  source={require('../../assets/images/LogoWhite.png')} 
                  style={styles.pawPointsIcon}
                />
                <Text style={styles.pawPointsLabel}>PawPoints</Text>
              </View>
              <Text style={styles.pawPointsValue}>{pawPoints}</Text>
            </View>

          
            <View style={[styles.statCard, styles.donationCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="heart" size={24} color="#AB886D" />
                <Text style={styles.donationLabel}>Total Donated</Text>
              </View>
              <Text style={styles.donationValue}>
                {formatCurrency(totalDonated)}
              </Text>
            </View>
          </View>
        </View>

   
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isRealAdoptionEligible && styles.actionButtonDisabled
            ]}
            onPress={handleRealAdoptionPress}
            disabled={false} // Always clickable to show requirements
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <View style={styles.actionButtonIconContainer}>
                <Ionicons 
                  name="home-outline" 
                  size={22} 
                  color={isRealAdoptionEligible ? '#AB886D' : '#CCCCCC'} 
                />
              </View>
              <View style={styles.actionButtonTextContainer}>
                <Text style={[
                  styles.actionButtonTitle, 
                  !isRealAdoptionEligible && styles.actionButtonTitleDisabled
                ]}>
                  Start Real Adoption
                </Text>
                {!isRealAdoptionEligible && (
                  <Text style={[styles.actionButtonSubtitle, styles.actionButtonSubtitleDisabled]}>
                    You need 5 PawPoints and 100% complete profile to unlock this feature
                  </Text>
                )}
                {isRealAdoptionEligible && (
                  <Text style={styles.actionButtonSubtitle}>
                    Begin the real adoption process
                  </Text>
                )}
              </View>
              <View style={styles.actionButtonBadge}>
                <Text style={styles.actionButtonBadgeText}>
                  {isRealAdoptionEligible ? "Available" : "Locked"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>


      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        userData={userData}
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
    fontSize: 14,
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
  },
  statCard: {
    flex: 1,
    padding: SPACING.LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  pawPointsCard: {
    backgroundColor: '#493628',
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  pawPointsIcon: {
    width: 20,
    height: 20,
    tintColor: '#AB886D',
    marginRight: 6,
  },
  pawPointsLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#AB886D',
  },
  pawPointsValue: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    marginBottom: 2,
    textAlign: 'center',
  },
  pawPointsSubtext: {
    fontSize: 10,
    fontFamily: 'PoppinsRegular',
    color: '#AB886D',
  },
  donationLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#AB886D',
  },
  donationValue: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 2,
    textAlign: 'center',
  },

  actionsContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LARGE,
    minHeight: DESIGN_CONSTANTS.BUTTON_HEIGHT,
  },
  actionButtonIconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  actionButtonTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
    marginBottom: 2,
  },
  actionButtonTitleDisabled: {
    color: '#CCCCCC',
  },
  actionButtonSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    lineHeight: 18,
  },
  actionButtonSubtitleDisabled: {
    color: '#CCCCCC',
  },
  actionButtonBadge: {
    backgroundColor: '#AB886D',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: SPACING.SMALL,
  },
  actionButtonBadgeText: {
    fontSize: 11,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfilePage;

