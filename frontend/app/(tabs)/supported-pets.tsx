import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExpandableSection, SuccessStoryCard } from '../../components/ui';
import GallerySection from '../../components/ui/GallerySection';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 10,
  BORDER_RADIUS: 20,
  PROGRESS_BAR_HEIGHT: 25,
  INDICATOR_SIZE: 12,
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
  PET_NAME: 0.08,
  SECTION_TITLE: 0.045,
  INFO_TEXT: 0.04,
  LABEL_TEXT: 0.032,
} as const;


interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  category: string;
  description: string;
  story: string;
  mainImage: string;
  galleryImages: string[];
  adoptionFee: number;
  totalDonationsReceived: number;
  currentMonthDonations: number;
  monthlyGoals: MonthlyGoals;
  currentMonthProgress?: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
    total: number;
    percentage: number;
  };
  status: string;
  vaccinated: boolean;
  dewormed: boolean;
  spayedNeutered: boolean;
  shelter: ShelterInfo;
}

interface MonthlyGoals {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
}

interface ShelterInfo {
  id: string;
  shelterName: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
}

interface SuccessStory {
  id: string;
  type: 'adopter_success' | 'supporter_success' | 'adopted_internal' | 'adopted_external' | 'deceased' | 'error';
  originalPetId: string;
  title?: string;
  message: string;
  petName: string;
  petImage: string | { uri: string };
  adoptionDate: string;
  shelterName: string;
  userContribution: number;
  adopter?: {
    name: string;
    city: string;
  };
  pawPointsEarned: number;
  createdAt: string;
  affectedUserIds?: string[];
  notificationsSent?: { [userId: string]: boolean };
  canDismiss: boolean;
}

const SupportedPetsPage: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
 
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedStoryIds, setDismissedStoryIds] = useState<string[]>([]);
  

  const flatListRef = useRef<FlatList>(null);

  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const petNameFontSize = width * FONT_RATIOS.PET_NAME;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const infoTextFontSize = width * FONT_RATIOS.INFO_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;


  const allPetData = useMemo(() => {
    const petData = pets.map(pet => ({ ...pet, type: 'pet' as const }));
  
    const storyData = successStories
      .filter(story => !dismissedStoryIds.includes(story.id))
      .map(story => ({ ...story, type: 'success' as const }));
    return [...petData, ...storyData];
  }, [pets, successStories, dismissedStoryIds]);

  const totalCount = allPetData.length;

 
  const fetchSupportedPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
  
        setPets([]);
        setSuccessStories([]);
        setLoading(false);
        return;
      }
      
      const [petsResponse, successResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/donations/supported-pets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/donations/success-stories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
   
      const petsData: Pet[] = petsResponse.data.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          breed: item.breed || 'Unknown',
          age: item.age?.toString() || 'Unknown',
          gender: item.gender || 'Unknown',
          vaccinated: item.vaccinated || false,
          dewormed: item.dewormed || false,
          spayedNeutered: item.spayedNeutered || false,
          adoptionFee: Number(item.adoptionFee) || 0,
          totalDonationsReceived: Number(item.totalDonationsReceived) || 0,
          currentMonthDonations: Number(item.currentMonthDonations) || 0,
          monthlyGoals: {
            vaccination: item.monthlyGoals?.vaccination || 0,
            food: item.monthlyGoals?.food || 0,
            medical: item.monthlyGoals?.medical || 0,
            other: item.monthlyGoals?.other || 0,
          },
          currentMonthProgress: item.currentMonthProgress ? {
            vaccination: item.currentMonthProgress.vaccination || 0,
            food: item.currentMonthProgress.food || 0,
            medical: item.currentMonthProgress.medical || 0,
            other: item.currentMonthProgress.other || 0,
            total: item.currentMonthProgress.total || 0,
            percentage: item.currentMonthProgress.percentage || 0,
          } : undefined,
          status: item.status || 'Unknown',
          description: item.description || `${item.name} is a wonderful ${item.gender?.toLowerCase() || 'pet'} looking for a loving home.`,
          story: item.story || `${item.name} has been supported by generous donors like you and is making great progress!`,
          shelter: {
            id: item.shelter?.id || 'Unknown',
            shelterName: item.shelter?.shelterName || 'Unknown Shelter',
            city: item.shelter?.location?.split(', ')[0] || item.shelter?.city || 'Location not available',
            state: item.shelter?.location?.split(', ')[1] || item.shelter?.state || 'Location not available',
            country: item.shelter?.location?.split(', ')[2] || item.shelter?.country || 'Unknown',
            phone: item.shelter?.contact || item.shelter?.phone || item.shelter?.phoneNumber || item.shelter?.contactPhone || 'Contact not available',
            email: item.shelter?.email || item.shelter?.contactEmail || 'Contact not available',
          },
          mainImage: item.mainImage || '',
          galleryImages: (item.additionalImages || []).map((img: string) => img),
        };
      });
      
      const storiesData: SuccessStory[] = successResponse.data.map((story: any) => ({
        id: story.id,
        type: story.type || 'supporter_success',
        originalPetId: story.originalPetId || story.petId || story.id,
        title: story.title,
        message: story.message,
        petName: story.petName,
        petImage: story.petImage,
        adoptionDate: story.adoptionDate || story.createdAt,
        shelterName: story.shelterName || 'Unknown Shelter',
        userContribution: story.userContribution || 0,
        adopter: story.adopter,
        pawPointsEarned: story.pawPointsEarned,
        createdAt: story.createdAt,
        affectedUserIds: story.affectedUserIds || [],
        notificationsSent: story.notificationsSent || {},
        canDismiss: story.canDismiss !== false,
      }));
      
      setPets(petsData);
      setSuccessStories(storiesData);
    } catch (err: any) {
      setError('Failed to load supported pets. Please try again.');
      console.error('Error fetching supported pets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const userRes = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return userRes.data.id;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadDismissedStoryIds = async () => {
      try {
        const userId = await getUserId();
        if (!userId) return;
        
        const userKey = `dismissedStoryIds_${userId}`;
        const stored = await AsyncStorage.getItem(userKey);
        if (stored) {
          setDismissedStoryIds(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load dismissed story IDs:', error);
      }
    };
    
    loadDismissedStoryIds();
    fetchSupportedPets();
  }, [fetchSupportedPets, getUserId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSupportedPets();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchSupportedPets]);

  const handlePetChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleDonatePress = useCallback((pet: Pet) => {
    router.push({
      pathname: '/payment/donate',
      params: {
        petId: pet.id,
        petName: pet.name,
        shelterName: pet.shelter.shelterName,
      },
    });
  }, [router]);

  const handleSectionToggle = useCallback((petId: string, sectionKey: string, isExpanded: boolean) => {
    console.log(`Pet ${petId} section ${sectionKey} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
  }, []);

  const handleDismissStory = useCallback(async (storyId: string) => {
    const newDismissedIds = [...dismissedStoryIds, storyId];
    setDismissedStoryIds(newDismissedIds);
    
    try {
      const userId = await getUserId();
      if (!userId) return;
      
      const userKey = `dismissedStoryIds_${userId}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(newDismissedIds));
    } catch (error) {
      console.error('Failed to save dismissed story IDs:', error);
    }
  }, [dismissedStoryIds, getUserId]);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#51CF66';
    if (percentage >= 60) return '#FFD43B';
    if (percentage >= 40) return '#FF8C42';
    return '#FF6B6B'; 
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ProgressBar: React.FC<{
    label: string;
    current: number;
    goal: number;
    labelTextFontSize?: number;
  }> = ({ label, current, goal, labelTextFontSize = 12 }) => {

    const safeCurrent = Number(current) || 0;
    const safeGoal = Number(goal) || 0;
    const percentage = safeGoal > 0 ? Math.min((safeCurrent / safeGoal) * 100, 100) : 0;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarHeader, { marginBottom: 6 }]}>
          <Text style={[styles.progressBarLabel, { fontSize: labelTextFontSize }]}>
            {label}
          </Text>
          <Text style={[styles.progressAmount, { fontSize: labelTextFontSize }]}>
            ${safeCurrent.toFixed(0)}/${safeGoal.toFixed(0)}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { 
                width: `${percentage}%`,
                backgroundColor: getProgressColor(percentage)
              }
            ]}
          />
        </View>
      </View>
    );
  };

  const PetDetailsContent: React.FC<{
    pet: Pet;
    onDonate: (pet: Pet) => void;
    onAdopt: (pet: Pet) => void;
  }> = ({ pet, onDonate, onAdopt }) => (
    <ScrollView
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
      keyboardShouldPersistTaps="handled"
    >

      <View style={styles.petImageContainer}>
        {pet.mainImage ? (
          <Image
            source={{ uri: pet.mainImage }}
            style={[styles.petImage, { width: width * 0.7, height: width * 0.7 }]}
          />
        ) : (
          <View style={[styles.petImage, styles.placeholderImage, { width: width * 0.7, height: width * 0.7 }]}>
            <Ionicons name="image-outline" size={80} color="#AB886D" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

    
      <Text style={[styles.petName, { fontSize: petNameFontSize }]}>
        {(pet.name || 'Unknown Pet').toUpperCase()}
      </Text>

      
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{formatCurrency(pet.adoptionFee)}</Text>
          <Text style={styles.quickStatLabel}>Adoption Fee</Text>
        </View>
      </View>

      
      <View style={styles.staticSection}>
        <Text style={[styles.staticSectionTitle, { fontSize: sectionTitleFontSize }]}>
          Care Progress
        </Text>
        <View style={styles.staticSectionContent}>
          
          <View style={styles.monthlyGoalProgressContainer}>
            <ProgressBar
              label="Monthly Goal Progress"
              current={Number(pet.currentMonthProgress?.total) || Number(pet.currentMonthDonations) || 0}
              goal={(Number(pet.monthlyGoals.vaccination) || 0) + (Number(pet.monthlyGoals.food) || 0) + (Number(pet.monthlyGoals.medical) || 0) + (Number(pet.monthlyGoals.other) || 0)}
            />
            <TouchableOpacity
              style={[styles.donationButton, { width: width * 0.6 }]}
              onPress={() => onDonate(pet)}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={24} color="#E4E0E1" style={{ marginRight: 8 }} />
              <Text style={styles.donationButtonText}>Support {pet.name}</Text>
            </TouchableOpacity>
          </View>
          
   
          <ProgressBar
            label="Vaccination & Deworming"
            current={Number(pet.currentMonthProgress?.vaccination) || 0}
            goal={Number(pet.monthlyGoals.vaccination) || 0}
          />
          <ProgressBar
            label="Food & Nutrition"
            current={Number(pet.currentMonthProgress?.food) || 0}
            goal={Number(pet.monthlyGoals.food) || 0}
          />
          <ProgressBar
            label="Medical Care"
            current={Number(pet.currentMonthProgress?.medical) || 0}
            goal={Number(pet.monthlyGoals.medical) || 0}
          />
          <ProgressBar
            label="Other Expenses"
            current={Number(pet.currentMonthProgress?.other) || 0}
            goal={Number(pet.monthlyGoals.other) || 0}
          />
          
          
          
      
          
        </View>
      </View>


      <ExpandableSection 
        title="General Information" 
        sectionKey="general-info" 
        petId={pet.id} 
        defaultExpanded={false}
        canClose={true}
        onToggle={handleSectionToggle}
        titleFontSize={sectionTitleFontSize}
      >
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Breed:</Text>
            <Text style={styles.infoValue}>{pet.breed}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>{pet.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{pet.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vaccinated & Dewormed:</Text>
            <Text style={[styles.infoValue, { color: (pet.vaccinated && pet.dewormed) ? '#51CF66' : '#FF6B6B' }]}>
              {(pet.vaccinated && pet.dewormed) ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Spayed/Neutered:</Text>
            <Text style={[styles.infoValue, { color: pet.spayedNeutered ? '#51CF66' : '#FF6B6B' }]}>
              {pet.spayedNeutered ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shelter:</Text>
            <Text style={styles.infoValue}>{pet.shelter.shelterName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>
              {pet.shelter?.city && pet.shelter?.state && pet.shelter?.country
                ? `${pet.shelter.city}, ${pet.shelter.state}, ${pet.shelter.country}`
                : pet.shelter?.city && pet.shelter?.state
                ? `${pet.shelter.city}, ${pet.shelter.state}`
                : pet.shelter?.city || 'Location not available'
              }
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{pet.shelter.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{pet.shelter.email}</Text>
          </View>
        </View>
      </ExpandableSection>

      
      <ExpandableSection 
        title="Description" 
        sectionKey="description" 
        petId={pet.id} 
        defaultExpanded={false}
        canClose={true}
        onToggle={handleSectionToggle}
        titleFontSize={sectionTitleFontSize}
      >
        <Text style={[styles.sectionText, { fontSize: infoTextFontSize }]}>
          {pet.description}
        </Text>
      </ExpandableSection>


      <ExpandableSection 
        title="Story" 
        sectionKey="story" 
        petId={pet.id} 
        defaultExpanded={false}
        canClose={true}
        onToggle={handleSectionToggle}
        titleFontSize={sectionTitleFontSize}
      >
        <Text style={[styles.sectionText, { fontSize: infoTextFontSize }]}>
          {pet.story}
        </Text>
      </ExpandableSection>

      
      <ExpandableSection 
        title="Gallery" 
        sectionKey="gallery" 
        petId={pet.id} 
        defaultExpanded={false}
        canClose={true}
        onToggle={handleSectionToggle}
        titleFontSize={sectionTitleFontSize}
      >
        <GallerySection 
          images={pet.galleryImages}
          petName={pet.name || 'Pet'}
        />
      </ExpandableSection>
    </ScrollView>
  );

  
  const SuccessStoryContent = React.memo<{ story: SuccessStory }>(({ story }) => (
    <View style={styles.successStoryContainer}>
      <SuccessStoryCard
        story={story}
        onDismiss={handleDismissStory}
        cardWidth={width * 0.85}
        cardHeight={width * 1.2}
      />
    </View>
  ));

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={[styles.header, { paddingTop: height * 0.05 }]}>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          My Virtual Pets
        </Text>
        <Text style={styles.headerSubtitle}>
          {totalCount} pet{totalCount > 1 ? 's' : ''} in your care
        </Text>
      </View>

   
      {loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your supported pets...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchSupportedPets} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

    
      {!loading && !error && totalCount === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyStateText}>
            You haven't supported any pets yet.{'\n'}
            Make your first donation to start building your virtual pet family!
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/home')} 
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Pets</Text>
          </TouchableOpacity>
        </View>
      )}


      {!loading && !error && totalCount > 0 && (
        <>
       
          <View style={styles.scrollIndicatorContainer}>
            {allPetData.map((item, index) => (
              <TouchableOpacity
                key={`indicator-${item.id}-${index}`}
                style={[
                  styles.scrollIndicator,
                  index === activeIndex && styles.activeScrollIndicator,
                ]}
                onPress={() => {
                  setActiveIndex(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
              />
            ))}
          </View>

          
          <FlatList
            ref={flatListRef}
            data={allPetData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              handlePetChange(index);
            }}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            renderItem={({ item }) => (
              <View style={{ width, paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING }}>
                {item.type === 'pet' ? (
                  <PetDetailsContent
                    pet={item}
                    onDonate={handleDonatePress}
                    onAdopt={handleDonatePress}
                  />
                ) : (
                  <SuccessStoryContent story={item} />
                )}
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  
  
  header: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.SMALL,
    backgroundColor: '#E4E0E1',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
  },
  
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.SMALL,
    gap: SPACING.SMALL,
    backgroundColor: '#E4E0E1',
  },
  scrollIndicator: {
    width: DESIGN_CONSTANTS.INDICATOR_SIZE,
    height: DESIGN_CONSTANTS.INDICATOR_SIZE,
    borderRadius: DESIGN_CONSTANTS.INDICATOR_SIZE / 2,
    backgroundColor: '#D6C0B3',
    borderWidth: 1,
    borderColor: '#AB886D',
  },
  activeScrollIndicator: {
    backgroundColor: '#493628',
    borderColor: '#493628',
  },
  
  
  scrollContent: {
    paddingBottom: 120, 
  },
  successStoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  petImageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.LARGE,
  },
  petImage: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    resizeMode: 'cover',
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
  petName: {
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    color: '#493628',
    marginBottom: SPACING.LARGE,
  },
  

  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.EXTRA_LARGE,
    paddingHorizontal: SPACING.MEDIUM,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
  },
  

  staticSection: {
    marginBottom: SPACING.LARGE,
  },
  staticSectionTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#D6C0B3',
  },
  staticSectionContent: {
    paddingTop: SPACING.MEDIUM,
  },

  progressBarContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
  },
  progressAmount: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  progressBarTrack: {
    height: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT,
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: '#E4E0E1',
    borderWidth: 1,
    borderColor: '#D6C0B3',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
  },
  
  
  monthlyGoalProgressContainer: {
    marginBottom: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    
    
  },
  monthlyGoalInfo: {
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
    padding: SPACING.MEDIUM,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  monthlyGoalText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  
   donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AB886D',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    alignSelf: 'center',
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
  donationButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  

  sectionText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 22,
  },
  
  
  infoGrid: {
    gap: SPACING.SMALL,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.MEDIUM,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6B6B',
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    backgroundColor: '#AB886D',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  browseButton: {
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    backgroundColor: '#AB886D',
  },
  browseButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
});

export default SupportedPetsPage;