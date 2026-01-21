import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BannerDetailCard } from '../../components/banner';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  HEADER_HEIGHT: 120,
  PROGRESS_BAR_HEIGHT: 8,
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
  WARNING_YELLOW: '#FFD43B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
};

interface Campaign {
  id: string;
  title: string;
  description: string;
  purpose: string;
  targetAmount: number;
  currentAmount: number;
  image: any;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired';
  daysRemaining: number;
}

interface CampaignProgressPageProps {}

const CampaignProgressPage: React.FC<CampaignProgressPageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headerTitleFontSize = width * 0.05;
  const titleFontSize = width * 0.045;
  const bodyFontSize = width * 0.035;
  const labelFontSize = width * 0.032;

  const fetchCampaigns = useCallback(async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {

        throw new Error('Not authenticated');
      }
      
    
      
      const res = await axios.get(`${API_BASE_URL}/campaigns/shelter/my-campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      

      if (!res.data || !Array.isArray(res.data.campaigns)) {
        console.error('CAMPAIGNS DEBUG:', res.data);
        throw new Error('Invalid response format from server');
      }
      
    
      
  
      const mapped: Campaign[] = res.data.campaigns.map((c: any) => {
        console.log('CAMPAIGNS DEBUG:', {
          id: c.id,
          title: c.title,
          image: c.image,
          imageType: typeof c.image,
          imageStringified: JSON.stringify(c.image)
        });
        
        const mappedCampaign = {
          id: c.id,
          title: c.title,
          description: c.description,
          purpose: c.title, 
          targetAmount: c.goalAmount, 
          currentAmount: c.currentAmount,
          image: c.image || require('../../assets/images/placeholder.png'), 
          createdAt: c.createdAt,
          expiresAt: c.endsAt,
          status: c.status,
          daysRemaining: c.daysRemaining, 
        };
        
        console.log('CAMPAIGNS DEBUG:', {
          originalImage: c.image,
          mappedImage: mappedCampaign.image,
          mappedImageType: typeof mappedCampaign.image
        });
        
        return mappedCampaign;
      });
      
      
      setCampaigns(mapped);
      
    } catch (err: any) {
      
      
      // Set more specific error messages
      if (err?.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err?.response?.status === 403) {
        setError('Access denied. Make sure you are logged in as a shelter user.');
      } else if (err?.response?.status === 404) {
        setError('Campaign service not found. Please contact support.');
      } else if (err.message === 'Not authenticated') {
        setError('Please log in to view your campaigns.');
      } else {
        setError('Failed to load campaigns. Please try again.');
      }
    }
  }, []);


  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const { activeCampaigns, completedCampaigns } = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'active');
    const completed = campaigns.filter(c => c.status === 'completed' || c.status === 'expired');
    return { activeCampaigns: active, completedCampaigns: completed };
  }, [campaigns]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  }, [fetchCampaigns]);


  const formatCurrency = useCallback((amount: number): string => {
    return `$${amount.toLocaleString()}`;
  }, []);

  const getDaysRemainingText = useCallback((days: number, status: string): string => {
    if (status === 'completed') return 'Completed';
    if (status === 'expired') return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  }, []);

  const renderCampaignCard = useCallback((campaign: Campaign) => {
    

    return (
      <View key={campaign.id} style={styles.campaignContainer}>
        <BannerDetailCard 
          campaign={{
            id: campaign.id,
            shelterName: 'Happy Tails Animal Shelter', 
            title: campaign.title,
            description: campaign.description,
            image: campaign.image, 
            targetAmount: campaign.targetAmount,
            currentAmount: campaign.currentAmount,
            purpose: campaign.purpose,
          }}
        />


        <View style={styles.campaignInfoOverlay}>
          <View style={styles.campaignHeader}>
            
            
            <View style={styles.timeContainer}>
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={campaign.status === 'active' ? COLORS.GRAY_DARK : COLORS.SUCCESS_GREEN} 
              />
              <Text style={[
                styles.timeText, 
                { 
                  fontSize: labelFontSize,
                  color: campaign.status === 'active' ? COLORS.GRAY_DARK : COLORS.SUCCESS_GREEN 
                }
              ]}>
                {getDaysRemainingText(campaign.daysRemaining, campaign.status)}
              </Text>
            </View>
          </View>


            
            
         
        </View>
      </View>
    );
  }, [getDaysRemainingText, labelFontSize]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Campaign Progress
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.PRIMARY_BROWN}
            colors={[COLORS.PRIMARY_BROWN]}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.summaryContainer}>
          
          
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { fontSize: width * 0.055 }]}>
              {formatCurrency(activeCampaigns.reduce((sum, c) => sum + c.currentAmount, 0))}
            </Text>
            <Text style={[styles.summaryLabel, { fontSize: bodyFontSize }]}>Total Raised</Text>
          </View>
        </View>

        {activeCampaigns.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Active Campaigns
            </Text>
            {activeCampaigns.map(renderCampaignCard)}
          </>
        )}

        {completedCampaigns.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Completed Campaigns
            </Text>
            {completedCampaigns.map(renderCampaignCard)}
          </>
        )}

        {activeCampaigns.length === 0 && completedCampaigns.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.GRAY_LIGHT} />
            <Text style={[styles.emptyTitle, { fontSize: titleFontSize }]}>
              No Campaigns Yet
            </Text>
            <Text style={[styles.emptyText, { fontSize: bodyFontSize }]}>
              Create your first banner campaign to start raising funds for your shelter's needs.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  backIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.GRAY_DARK,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.EXTRA_LARGE,
  },
  
  summaryContainer: {
    flexDirection: 'row',
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
    alignItems: 'center',
  },
  summaryNumber: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.LARGE,
    marginTop: SPACING.MEDIUM,
  },
  
  campaignContainer: {
    position: 'relative',
    marginBottom: SPACING.LARGE,
  },
  
  campaignInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: SPACING.LARGE,
    backgroundColor: 'transparent',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 12,
  },
  timeText: {
    fontFamily: 'PoppinsRegular',
  },
 
  statsRow: {
    position: 'absolute',
    bottom: SPACING.LARGE,
    left: SPACING.LARGE,
    right: SPACING.LARGE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 12,
  },
  donorText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.TINY,
  },
  completedText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: COLORS.SUCCESS_GREEN,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
  },
  emptyText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.EXTRA_LARGE,
  },

  bottomSpacing: {
    height: 140,
  },
});

export default CampaignProgressPage;


