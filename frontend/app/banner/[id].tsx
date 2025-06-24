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
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BannerDetailCard } from '../../components/banner';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 50,
  HEADER_HEIGHT: 120,
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
  DONATE_ORANGE: '#FF8C42',
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
};

interface BannerDetailPageProps {}

const BannerDetailPage: React.FC<BannerDetailPageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  const [bannerData, setBannerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('No campaign ID');
        
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          return;
        }

        console.log('BANNER DETAIL: Fetching campaign details for ID:', id);
        const res = await axios.get(`${API_BASE_URL}/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('BANNER DETAIL: API response:', res.data);
        

        console.log('BANNER AMOUNTS DEBUG:');
        console.log('goalAmount:', res.data.goalAmount, 'type:', typeof res.data.goalAmount);
        console.log('currentAmount:', res.data.currentAmount, 'type:', typeof res.data.currentAmount);
        
        setBannerData(res.data);
      } catch (err: any) {
        console.error('BANNER DETAIL: Error fetching campaign:', err);
        setError(err?.response?.status === 404 ? 'Campaign not found' : 'Failed to load campaign details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  const titleFontSize = width * 0.055;
  const bodyFontSize = width * 0.035;
  const buttonFontSize = width * 0.04;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDonate = useCallback(() => {
    if (!bannerData) return;

    router.push({
      pathname: '/payment/donate',
      params: {
        type: 'campaign',
        bannerId: bannerData.id,
        shelterName: bannerData.shelterName,
        title: bannerData.title,
        targetAmount: bannerData.goalAmount.toString(),
        currentAmount: bannerData.currentAmount.toString(),
        urgencyLevel: bannerData.urgencyLevel,
      },
    });
  }, [bannerData, router]);

  if (!bannerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
              Campaign Not Found
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.GRAY_LIGHT} />
          <Text style={[styles.errorTitle, { fontSize: titleFontSize }]}>
            Campaign Not Found
          </Text>
          <Text style={[styles.errorText, { fontSize: bodyFontSize }]}>
            This campaign may have been removed or does not exist.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return COLORS.ERROR_RED;
      case 'high': return COLORS.DONATE_ORANGE;
      case 'moderate': return COLORS.SUCCESS_GREEN;
      default: return COLORS.GRAY_DARK;
    }
  };

  const urgencyColor = getUrgencyColor(bannerData.urgencyLevel);
  const progressPercentage = Math.min((bannerData.currentAmount / bannerData.goalAmount) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={{ width: 28, height: 28, tintColor: COLORS.GRAY_DARK }}
            />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { fontSize: titleFontSize }]} numberOfLines={1}>
            Campaign Details
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>


      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        


        <BannerDetailCard 
          campaign={{
            id: bannerData.id,
            shelterName: bannerData.shelterName || 'Unknown Shelter',
            title: bannerData.title || 'Campaign Title',
            description: bannerData.description || 'No description available',
            image: bannerData.image || undefined,
            targetAmount: typeof bannerData.goalAmount === 'number' ? bannerData.goalAmount : 0,
            currentAmount: typeof bannerData.currentAmount === 'number' ? bannerData.currentAmount : 0,
            purpose: bannerData.purpose || '',
          }}
        />

        

        <TouchableOpacity
          style={styles.donateButton}
          onPress={handleDonate}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Donate to ${bannerData.title} campaign`}
        >
          
          <Text style={[styles.donateButtonText, { fontSize: buttonFontSize }]}>
            Donate Now
          </Text>
        
        </TouchableOpacity>


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
    backgroundColor: COLORS.BACKGROUND,
  },
  

  header: {
    height: DESIGN_CONSTANTS.HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: SPACING.SMALL,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  headerSpacer: {
    width: 40,
  },
  

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.HUGE,
  },
  

  statusSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  urgencyText: {
    fontFamily: 'PoppinsSemiBold',
    marginLeft: SPACING.SMALL,
    fontSize: 12,
  },
  daysRemaining: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  statLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  

  infoSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.EXTRA_LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
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
  infoTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.MEDIUM,
  },
  infoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 22,
    marginBottom: SPACING.LARGE,
  },
  impactList: {
    gap: SPACING.MEDIUM,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginLeft: SPACING.MEDIUM,
    flex: 1,
    lineHeight: 20,
  },
  

  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT + 10, 
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.EXTRA_LARGE,
    gap: SPACING.MEDIUM,
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
  donateButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  errorTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: SPACING.EXTRA_LARGE,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    paddingVertical: SPACING.LARGE,
  },
  errorButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
    fontSize: 16,
  },
  
 
  bottomSpacing: {
    height: 40,
  },
});

export default BannerDetailPage;