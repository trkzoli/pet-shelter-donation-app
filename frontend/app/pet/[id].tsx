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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExpandableSection } from '../../components/ui';
import GallerySection from '../../components/ui/GallerySection';
import { setTabsUI } from '../../config/systemUI';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 20,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 55,
  HEADER_HEIGHT: 100,
  PROGRESS_BAR_HEIGHT: 25,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.06,
  PET_NAME: 0.08,
  SECTION_TITLE: 0.045,
  INFO_TEXT: 0.04,
  BUTTON_TEXT: 0.045,
  LABEL_TEXT: 0.032,
} as const;

interface PetDetails {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  type: string; 
  
  shelter: {
    id: string;
    name: string;
    location: string;
    country: string;
    contact: string;
    email: string;
  };
  
  story: string;
  description: string;
  adoption_fee: number;
  
  images: {
    main: any; 
    gallery: any[];
  };

  medical_info: {
    vaccinated: boolean;
    dewormed: boolean;
    spayed_neutered: boolean;
  };
  

  monthly_goals: {
    vaccination_deworming: number;
    food_nutrition: number;
    medical_care: number;
    other_expenses: number;
    total: number;
  };
  
  donations: {
    current_month: number;
    total_amount: number;
    donor_count: number;
    goal_progress: number; 
  };

  published_at: string; 
  is_available: boolean;
  status: 'published' | 'adopted' | 'removed';
}

// Mock data
const MOCK_PETS_DATABASE: { [key: string]: PetDetails } = {
  '1': {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'Male',
    type: 'Dog',
    shelter: {
      id: 'shelter_001',
      name: 'Happy Tails Animal Shelter',
      location: 'New York',
      country: 'United States',
      contact: '+1 (555) 123-4567',
      email: 'contact@happytails.org',
    },
    story: 'Max was found wandering the streets as a young puppy, scared and alone. Thanks to the dedicated care at Happy Tails Shelter, he has blossomed into a confident, loving dog who brings joy to everyone he meets. Max loves playing fetch, going on long walks, and is especially gentle with children.',
    description: 'Max is a medium-sized Golden Retriever with a beautiful golden coat that shines in the sunlight. He has an athletic build and loves to stay active. Max is incredibly social and gets along well with other dogs, cats, and children of all ages.',
    adoption_fee: 250,
    images: {
      main: require('../../assets/images/ds5.jpg'),
      gallery: [
        require('../../assets/images/ds1.jpg'),
        require('../../assets/images/ds2.jpg'),
        require('../../assets/images/ds3.jpg'),
        require('../../assets/images/ds4.jpg'),
      ],
    },
    medical_info: {
      vaccinated: true,
      dewormed: true,
      spayed_neutered: false,
    },
    monthly_goals: {
      vaccination_deworming: 50,
      food_nutrition: 80,
      medical_care: 120,
      other_expenses: 30,
      total: 280,
    },
    donations: {
      current_month: 185,
      total_amount: 340,
      donor_count: 12,
      goal_progress: 66, 
    },
    published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    is_available: true,
    status: 'published',
  },
  '2': {
    id: '2',
    name: 'Luna',
    breed: 'Persian Cat',
    age: '1 year',
    gender: 'Female',
    type: 'Cat',
    shelter: {
      id: 'shelter_002',
      name: 'Feline Friends Sanctuary',
      location: 'California',
      country: 'United States',
      contact: '+1 (555) 234-5678',
      email: 'info@felinefriends.org',
    },
    story: 'Luna came to us as a tiny kitten when her mother was unable to care for her. She has been bottle-fed and hand-raised by our dedicated volunteers, making her incredibly social and affectionate toward humans.',
    description: 'Luna is a stunning Persian cat with long, fluffy fur that requires daily grooming. She has bright blue eyes and a sweet, gentle personality. Luna is an indoor cat who enjoys climbing cat trees and watching birds through the window.',
    adoption_fee: 200,
    images: {
      main: require('../../assets/images/ds2.jpg'),
      gallery: [
        require('../../assets/images/ds2.jpg'),
        require('../../assets/images/ds1.jpg'),
        require('../../assets/images/ds3.jpg'),
      ],
    },
    medical_info: {
      vaccinated: true,
      dewormed: false,
      spayed_neutered: true,
    },
    monthly_goals: {
      vaccination_deworming: 40,
      food_nutrition: 60,
      medical_care: 90,
      other_expenses: 25,
      total: 215,
    },
    donations: {
      current_month: 142,
      total_amount: 280,
      donor_count: 8,
      goal_progress: 66, 
    },
    published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    is_available: true,
    status: 'published',
  },

};

const PetDetailsPage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  

  const petId = params.id as string;

  const [refreshing, setRefreshing] = useState(false);
  const [petDetails, setPetDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTabsUI();
  }, []);

  const fetchPetDetails = useCallback(async () => {
    if (!petId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      console.log('PET DETAIL: Fetching pet details for ID:', petId);
      const response = await axios.get(`${API_BASE_URL}/pets/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('PET DETAIL: API response:', response.data);
      
      const apiData = response.data;
      const transformedData = {
        id: apiData.id,
        name: apiData.name,
        breed: apiData.breed,
        age: apiData.age,
        gender: apiData.gender,
        type: apiData.type,
        shelter: {
          id: apiData.shelter?.id,
          name: apiData.shelter?.shelterName,
          location: apiData.shelter?.location || 'Location not specified',
          country: '', 
          contact: apiData.shelter?.phone || 'Contact not available',
          email: apiData.shelter?.user?.email || apiData.shelter?.email || 'Contact via shelter',
        },
        story: apiData.story || 'No story available',
        description: apiData.description || 'No description available',
        adoption_fee: parseFloat(apiData.adoptionFee || '0'),
        images: {
          main: apiData.mainImage ? { uri: apiData.mainImage } : require('../../assets/images/placeholder.png'),
          gallery: apiData.additionalImages?.map((img: string) => ({ uri: img })) || [],
        },
        medical_info: {
          vaccinated: apiData.vaccinated || false,
          dewormed: apiData.dewormed || false,
          spayed_neutered: apiData.spayedNeutered || false,
        },
        monthly_goals: {
          vaccination_deworming: apiData.monthlyGoals?.vaccination || 0,
          food_nutrition: apiData.monthlyGoals?.food || 0,
          medical_care: apiData.monthlyGoals?.medical || 0,
          other_expenses: apiData.monthlyGoals?.other || 0,
          total: apiData.totalMonthlyGoal || 0,
        },
        donations: {

          current_month: parseFloat(apiData.currentMonthDonations || '0'),
          total_amount: parseFloat(apiData.totalDonationsReceived),
          donor_count: 0, 
          goal_progress: apiData.totalMonthlyGoal > 0 ? 
            Math.round((parseFloat(apiData.currentMonthDonations || '0') / apiData.totalMonthlyGoal) * 100) : 0,
        },
        published_at: apiData.publishedAt || apiData.createdAt,
        is_available: apiData.status === 'published',
        status: apiData.status,
      };
      
      console.log('PET DETAIL: Transformed data:', transformedData);
      setPetDetails(transformedData);
    } catch (err: any) {
      console.error('PET DETAIL: Error fetching pet:', err);
      setError(err?.response?.status === 404 ? 'Pet not found' : 'Failed to load pet details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const petNameFontSize = width * FONT_RATIOS.PET_NAME;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const infoTextFontSize = width * FONT_RATIOS.INFO_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    await fetchPetDetails();
  }, [fetchPetDetails]);

  const handleSupport = useCallback(() => {
    if (!petDetails) return;
    
    router.push({
      pathname: '/payment/donate',
      params: {
        petId: petDetails.id,
        petName: petDetails.name,
        shelterName: petDetails.shelter.name,
        shelterId: petDetails.shelter.id,
      },
    });
  }, [petDetails, router]);

  const handleSectionToggle = useCallback((petId: string, sectionKey: string, isExpanded: boolean) => {
    console.log(`Pet ${petId} section ${sectionKey} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
  }, []);


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

  const MonthlyGoalProgressBar = React.memo(() => {
    if (!petDetails) return null;
    
    return (
      <View style={styles.monthlyGoalProgressContainer}>
        <View style={styles.progressBarHeader}>
          <Text style={[styles.progressBarLabel, { fontSize: labelTextFontSize }]}>
            Monthly Care Goal
          </Text>
          <Text style={[styles.progressPercentage, { fontSize: labelTextFontSize }]}>
            ${Math.round(petDetails.donations.current_month)}/${petDetails.monthly_goals.total}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(petDetails.donations.goal_progress, 100)}%`,
                backgroundColor: getProgressColor(petDetails.donations.goal_progress),
              },
            ]}
          />
        </View>
        <View style={styles.goalDetails}>
         
        </View>
      </View>
    );
  });

  if (!petDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
            <Image source={require('../../assets/images/backB.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
            {loading ? 'Loading...' : 'Pet Not Found'}
          </Text>
        </View>
        <View style={styles.errorContainer}>
          {loading ? (
            <>
              <Text style={styles.errorTitle}>Loading Pet Details...</Text>
              <Text style={styles.errorText}>Please wait while we fetch the pet information.</Text>
            </>
          ) : (
            <>
              <Text style={styles.errorTitle}>Pet Not Found</Text>
              <Text style={styles.errorText}>
                {error || 'The requested pet could not be found. It may have been adopted or removed.'}
              </Text>
              <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
                <Text style={styles.errorButtonText}>Go Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.headerBackButton}
          accessibilityRole="button"
          accessibilityLabel="Go back to home screen"
        >
          <Image
            source={require('../../assets/images/backB.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Pet Details
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
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

        <View style={styles.petImageContainer}>
          <Image
            source={petDetails.images.main}
            style={[styles.petImage, { width: width * 0.7, height: width * 0.7 }]}
          />
        </View>

        <Text style={[styles.petName, { fontSize: petNameFontSize }]}>
          {petDetails.name.toUpperCase()}
        </Text>

        <MonthlyGoalProgressBar />

        <View style={styles.supportButtonContainer}>
          <TouchableOpacity
            style={[styles.supportButton, { width: width * 0.8 }]}
            onPress={handleSupport}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Support ${petDetails.name}`}
          >
            <Ionicons name="heart" size={24} color="#E4E0E1" style={{ marginRight: 8 }} />
            <Text style={[styles.supportButtonText, { fontSize: buttonTextFontSize }]}>
              Support {petDetails.name}
            </Text>
          </TouchableOpacity>
        </View>

        <ExpandableSection 
          title="General Information" 
          sectionKey="general-info" 
          petId={petDetails.id} 
          defaultExpanded={false}
          canClose={true}
          onToggle={handleSectionToggle}
          titleFontSize={sectionTitleFontSize}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Breed:</Text>
              <Text style={styles.infoValue}>{petDetails.breed}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{petDetails.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{petDetails.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vaccinated & Dewormed:</Text>
              <Text style={[styles.infoValue, { color: (petDetails.medical_info.vaccinated && petDetails.medical_info.dewormed) ? '#51CF66' : '#FF6B6B' }]}>
                {(petDetails.medical_info.vaccinated && petDetails.medical_info.dewormed) ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Spayed/Neutered:</Text>
              <Text style={[styles.infoValue, { color: petDetails.medical_info.spayed_neutered ? '#51CF66' : '#FF6B6B' }]}>
                {petDetails.medical_info.spayed_neutered ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adoption Fee:</Text>
              <Text style={styles.infoValue}>${petDetails.adoption_fee}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shelter:</Text>
              <Text style={styles.infoValue}>{petDetails.shelter.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{petDetails.shelter.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{petDetails.shelter.contact}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{petDetails.shelter.email}</Text>
            </View>
          </View>
        </ExpandableSection>

        <ExpandableSection 
          title="Description" 
          sectionKey="description" 
          petId={petDetails.id} 
          defaultExpanded={false}
          canClose={true}
          onToggle={handleSectionToggle}
          titleFontSize={sectionTitleFontSize}
        >
          <Text style={[styles.sectionText, { fontSize: infoTextFontSize }]}>
            {petDetails.description}
          </Text>
        </ExpandableSection>

        <ExpandableSection 
          title="Story" 
          sectionKey="story" 
          petId={petDetails.id} 
          defaultExpanded={false}
          canClose={true}
          onToggle={handleSectionToggle}
          titleFontSize={sectionTitleFontSize}
        >
          <Text style={[styles.sectionText, { fontSize: infoTextFontSize }]}>
            {petDetails.story}
          </Text>
        </ExpandableSection>

        <ExpandableSection 
          title="Gallery" 
          sectionKey="gallery" 
          petId={petDetails.id} 
          defaultExpanded={false}
          canClose={true}
          onToggle={handleSectionToggle}
          titleFontSize={sectionTitleFontSize}
        >
          <GallerySection 
            images={petDetails.images.gallery}
            petName={petDetails.name}
          />
        </ExpandableSection>


        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },

  header: {
    height: DESIGN_CONSTANTS.HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
    borderBottomWidth: 1,
    borderBottomColor: '#D6C0B3',
  },
  headerBackButton: {
    padding: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#797979',
    resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44, 
  },
  

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.LARGE,
    paddingBottom: 120,
  },

  petImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  petImage: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    resizeMode: 'cover',
  },
  
  petName: {
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    color: '#493628',
    marginBottom: SPACING.EXTRA_LARGE,
  },
  
  monthlyGoalProgressContainer: {
    marginBottom: SPACING.SMALL,
    padding: SPACING.LARGE,
    
    
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  progressBarLabel: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  progressPercentage: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  progressBar: {
    height: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT,
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: '#E4E0E1',
    borderWidth: 1,
    borderColor: '#D6C0B3',
    overflow: 'hidden',
    marginBottom: SPACING.SMALL,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
  },
  goalDetails: {
    alignItems: 'center',
  },

  supportButtonContainer: {
    alignItems: 'center',
    marginBottom: SPACING.EXTRA_LARGE,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  supportButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
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

  sectionText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 22,
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
    height: 20,
  },
});

export default PetDetailsPage;

