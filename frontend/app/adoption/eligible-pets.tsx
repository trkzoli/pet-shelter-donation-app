import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { setTabsUI } from '../../config/systemUI';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design constants for consistency
const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  CARD_SPACING: 16,
  BORDER_RADIUS: 15,
  BACK_BUTTON_TOP: 50,
  BUTTON_HEIGHT: 45,
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


interface EligiblePet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  image: any;
  hasActiveRequest: boolean; 
  activeRequestUserId: string | null; 
  adoptionStatus: 'available' | 'pending_adoption' | 'adopted';
  shelter: {
    name: string;
    email: string;
    phone: string;
    address: string;
    adoptionRequirements: string[];
  };
  userDonationHistory: {
    totalAmount: number;
    donationCount: number;
    firstDonation: string;
    lastDonation: string;
  };
  description: string;
}

const EligiblePetsPage: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [eligiblePets, setEligiblePets] = useState<EligiblePet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEligiblePets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const res = await axios.get(`${API_BASE_URL}/adoptions/eligible-pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      
 
      const availablePets: EligiblePet[] = res.data.map((backendPet: any) => ({
        id: backendPet.id,
        name: backendPet.name,
        breed: backendPet.breed,
        age: backendPet.age,
        gender: backendPet.gender,
        image: backendPet.mainImage ? { uri: backendPet.mainImage } : require('../../assets/images/placeholder.png'),
        hasActiveRequest: false,
        activeRequestUserId: null,
        adoptionStatus: 'available' as const,
        shelter: {
          name: 'Shelter Name', 
          email: 'contact@shelter.com',
          phone: '+1234567890',
          address: 'Shelter Address',
          adoptionRequirements: ['Background check', 'Home visit'],
        },
        userDonationHistory: {
          totalAmount: backendPet.totalDonated || 0,
          donationCount: backendPet.donationCount || 0,
          firstDonation: backendPet.firstDonationDate || new Date().toISOString(),
          lastDonation: backendPet.lastDonationDate || new Date().toISOString(),
        },
        description: `${backendPet.breed} • ${backendPet.age} • ${backendPet.gender}`,
      }));
      
      
      try {
        const adoptionRes = await axios.get(`${API_BASE_URL}/adoptions/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        

        const requestedPets: EligiblePet[] = adoptionRes.data
          .filter((request: any) => request.status === 'pending') 
          .map((request: any) => ({
            id: request.petId,
            name: request.pet?.name || 'Unknown Pet',
            breed: request.pet?.breed || 'Unknown Breed',
            age: request.pet?.age || 'Unknown Age',
            gender: request.pet?.gender || 'Unknown',
            image: request.pet?.mainImage ? { uri: request.pet.mainImage } : require('../../assets/images/placeholder.png'),
            hasActiveRequest: true,
            activeRequestUserId: 'current_user',
            adoptionStatus: 'pending_adoption' as const,
            shelter: {
              name: 'Shelter Name',
              email: 'contact@shelter.com',
              phone: '+1234567890',
              address: 'Shelter Address',
              adoptionRequirements: ['Background check', 'Home visit'],
            },
            userDonationHistory: {
              totalAmount: 0,
              donationCount: 0,
              firstDonation: new Date().toISOString(),
              lastDonation: new Date().toISOString(),
            },
            description: `${request.pet?.breed || 'Unknown'} • ${request.pet?.age || 'Unknown'} • ${request.pet?.gender || 'Unknown'}`,
          }));
        
        
        const allPets = [...requestedPets, ...availablePets.filter(pet => 
          !requestedPets.some(reqPet => reqPet.id === pet.id)
        )];
        
        setEligiblePets(allPets);
        
      } catch (adoptionError) {
        setEligiblePets(availablePets);
      }
      
    } catch (err: any) {
      setError('Failed to load eligible pets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEligiblePets();
  }, [fetchEligiblePets]);

  useFocusEffect(
    useCallback(() => {
      fetchEligiblePets();
    }, [fetchEligiblePets])
  );


  const titleFontSize = Math.min(width * FONT_RATIOS.TITLE, 24); 
  const cardWidth = width - (DESIGN_CONSTANTS.HORIZONTAL_PADDING * 2);


  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEligiblePets();
  }, [fetchEligiblePets]);

  const handlePetSelect = useCallback((pet: EligiblePet) => {

    if (pet.hasActiveRequest) {
      if (pet.activeRequestUserId === 'current_user') {

        router.push('/adoption/status');
      } else {
        
      }
      return;
    }
    
    router.push(`/adoption/request/${pet.id}`);
  }, [router]);

  
  const getPetStatusInfo = useCallback((pet: EligiblePet) => {
    if (!pet.hasActiveRequest) {
      return {
        statusText: 'Available for adoption',
        buttonText: 'Request Adoption',
        buttonStyle: styles.requestButton,
        buttonTextStyle: styles.requestButtonText,
        disabled: false
      };
    }
    
    if (pet.activeRequestUserId === 'current_user') {
      return {
        statusText: 'Your adoption request pending',
        buttonText: 'View Status',
        buttonStyle: styles.statusButton,
        buttonTextStyle: styles.statusButtonText,
        disabled: false
      };
    }
    
    return {
      statusText: 'Another adoption request pending',
      buttonText: 'Not Available',
      buttonStyle: styles.requestButtonDisabled,
      buttonTextStyle: styles.requestButtonDisabledText,
      disabled: true
    };
  }, []);


  const PetCard = React.memo<{ pet: EligiblePet }>(({ pet }) => {
    const statusInfo = getPetStatusInfo(pet);
    
    return (
      <View style={[
        styles.petCard, 
        { width: cardWidth },
        pet.hasActiveRequest && pet.activeRequestUserId !== 'current_user' && styles.unavailablePetCard
      ]}>
        

        <View style={styles.petImageContainer}>
          <Image source={pet.image} style={styles.petImage} />
        </View>

       
        <Text style={styles.petName}>{pet.name}</Text>

    
        <Text style={styles.petStatus}>{statusInfo.statusText}</Text>

   
        <TouchableOpacity
          style={statusInfo.buttonStyle}
          onPress={() => handlePetSelect(pet)}
          activeOpacity={statusInfo.disabled ? 1 : 0.8}
          disabled={statusInfo.disabled}
        >
          <Text style={statusInfo.buttonTextStyle}>{statusInfo.buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  });

 
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require('../../assets/images/placeholder.png')}
        style={styles.emptyStateImage}
      />
      <Text style={styles.emptyStateTitle}>No Eligible Pets</Text>
      <Text style={styles.emptyStateText}>
        Start supporting pets with donations to become eligible for real adoption!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity 
        onPress={handleBack} 
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back to adoption process"
      >
        <Image
          source={require('../../assets/images/backB.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>Eligible Pets</Text>
        <Text style={styles.subtitle}>
          Pets you can adopt based on your support history
        </Text>
      </View>


      <FlatList
        data={eligiblePets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PetCard pet={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#AB886D']}
            tintColor="#AB886D"
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: DESIGN_CONSTANTS.CARD_SPACING }} />}
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
  listContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: 100,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
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
  unavailablePetCard: {
    opacity: 0.7,
    borderColor: '#D0D0D0',
  },
  petImageContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  petName: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL, 
    textAlign: 'center',
  },
  

  petStatus: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979', 
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
 
  requestButton: {
    width: '100%',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#AB886D',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
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
  requestButtonDisabled: {
    width: '100%',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#D6C0B3',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  requestButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  requestButtonDisabledText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#797979',
  },
  statusButton: {
    width: '100%',
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#493628',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateImage: {
    width: 80,
    height: 80,
    marginBottom: SPACING.LARGE,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: SPACING.SMALL,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default EligiblePetsPage;

