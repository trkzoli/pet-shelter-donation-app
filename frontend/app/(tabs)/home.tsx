import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { setTabsUI } from '../../config/systemUI';
import { FilterDropdownModal } from '../../components/modals';
import { BannerCard } from '../../components/banner';
import DonorPetCard from '../../components/pet/DonorPetCard';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FilterType = 'All' | 'Dogs' | 'Cats' | 'Hamsters' | 'Rabbits' | 'Fish' | 'Birds' | 'Reptiles' | 'Guinea Pigs' | 'Ferrets';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 16,
  BORDER_RADIUS: 20,
  CARD_SPACING: 6,
  SEARCH_BAR_HEIGHT: 45,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  GRAY_DARK: '#797979',
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.055,
  SEARCH_TEXT: 0.035,
  CARD_TITLE: 0.042,
  CARD_SUBTITLE: 0.035,
} as const;


interface Pet {
  id: string;
  name: string;
  breed: string;
  image: any;
  type: FilterType;
}


interface BannerData {
  id: string;
  type: 'banner';
  shelterName: string;
  urgentNeed: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
}

const HomePage: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    setTabsUI();
  }, []);
  

  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const searchTextFontSize = width * FONT_RATIOS.SEARCH_TEXT;
  const cardTitleFontSize = width * FONT_RATIOS.CARD_TITLE;
  const cardSubtitleFontSize = width * FONT_RATIOS.CARD_SUBTITLE;
  
  
  const availableWidth = width - (DESIGN_CONSTANTS.HORIZONTAL_PADDING * 2);
  const cardWidth = (availableWidth - DESIGN_CONSTANTS.CARD_SPACING) / 2;
  const cardHeight = cardWidth * 1.35;
  
  
  const fetchPetsAndBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      
      const token = await AsyncStorage.getItem('token');

      console.log('HOME PAGE: Token found, length:', token?.length || 0);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('HOME PAGE: Fetching pets from', `${API_BASE_URL}/pets`);
      
      const petsRes = await axios.get(`${API_BASE_URL}/pets`, { headers });
      console.log('HOME PAGE: Pets response:', petsRes.data);
      
      const mappedPets = petsRes.data.pets?.map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        image: { uri: pet.mainImage },
        type: pet.type === 'dog' ? 'Dogs' : pet.type === 'cat' ? 'Cats' : 'Other',
      })) || [];
      console.log('HOME PAGE: Mapped pets:', mappedPets.length);
      setPets(mappedPets);
      
      console.log('HOME PAGE: Fetching campaigns from', `${API_BASE_URL}/campaigns`);
      
      const bannersRes = await axios.get(`${API_BASE_URL}/campaigns`, { headers });
      console.log('HOME PAGE: Campaigns response:', bannersRes.data);
      
      const mappedBanners = bannersRes.data.campaigns?.map((banner: any) => ({
        id: banner.id,
        type: 'banner',
        shelterName: banner.shelterName,
        urgentNeed: banner.title,
        description: banner.description,
        targetAmount: banner.goalAmount,
        currentAmount: banner.currentAmount,
        priority: banner.priority,
        image: banner.image,
      })) || [];
      console.log('🔍 HOME PAGE: Mapped banners:', mappedBanners.length);
      setBanners(mappedBanners);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
      console.error('Error message:', err?.message);
      
      let errorMessage = 'Failed to load pets or banners. Please try again.';
      if (err?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err?.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPetsAndBanners();
  }, [fetchPetsAndBanners]);
  
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = searchQuery === '' || 
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || pet.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, pets]);
  
  const mixedContent = useMemo(() => {
    const result: (Pet | BannerData)[] = [];
    let bannerIndex = 0;
    filteredPets.forEach((pet, index) => {
  
      if (index > 0 && index % 6 === 0 && bannerIndex < banners.length) {
        result.push(banners[bannerIndex]);
        bannerIndex++;
      }
      result.push(pet);
    });
   
    while (bannerIndex < banners.length) {
      result.push(banners[bannerIndex]);
      bannerIndex++;
    }
    return result;
  }, [filteredPets, banners]);
  

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);
  
  const handleFilterPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);
  
  const handleFilterSelect = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setFilterModalVisible(false);
  }, []);
  

  const handlePetPress = useCallback((petId: string) => {
    router.push(`/pet/${petId}` as any);
  }, [router]);
  
  const handleBannerPress = useCallback((bannerId: string) => {
    router.push(`/banner/${bannerId}` as any);
  }, [router]);
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPetsAndBanners();
  }, [fetchPetsAndBanners]);
  
  
  const renderItem = useCallback(({ item }: { item: Pet | BannerData }) => {
    if (item.type === 'banner') {

      return (
        <BannerCard 
          item={item}
          width={cardWidth}
          height={cardHeight}
          onPress={() => handleBannerPress(item.id)}
        />
      );
    }

    return (
      <DonorPetCard
        pet={item}
        width={cardWidth}
        height={cardHeight}
        onPress={handlePetPress}
        cardTitleFontSize={cardTitleFontSize}
        cardSubtitleFontSize={cardSubtitleFontSize}
      />
    );
  }, [
    cardWidth, 
    cardHeight, 
    handleBannerPress, 
    handlePetPress,
    cardTitleFontSize,
    cardSubtitleFontSize
  ]);
  
  const keyExtractor = useCallback((item: Pet | BannerData) => item.id, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainContent, { paddingTop: height * 0.05 }]}>
        {/* Header */}
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Find Your Perfect Pet
        </Text>
        
        {/* Search  */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.GRAY_DARK} style={styles.searchIcon} />
            <TextInput
              placeholder="Search pets by name or breed..."
              placeholderTextColor={COLORS.GRAY_DARK}
              style={[styles.searchInput, { fontSize: searchTextFontSize }]}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.GRAY_DARK} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
              style={styles.filterButton}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color={COLORS.GRAY_DARK} />
            </TouchableOpacity>
        </View>
       
        {activeFilter !== 'All' && (
          <View style={styles.activeFilterContainer}>
            <Text style={[styles.activeFilterText, { fontSize: searchTextFontSize }]}>
              Showing: {activeFilter}
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter('All')} style={styles.clearFilterButton}>
              <Ionicons name="close" size={16} color={COLORS.GRAY_DARK} />
            </TouchableOpacity>
          </View>
        )}
        
       
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY_BROWN} />
          </View>
        ) : (
          <FlatList
            data={mixedContent}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.PRIMARY_BROWN]}
                tintColor={COLORS.PRIMARY_BROWN}
              />
            }
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>
      
      
      <FilterDropdownModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activeFilter={activeFilter}
        onFilterSelect={handleFilterSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: 20,
 
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.EXTRA_LARGE,
    textAlign: 'center',
  },
  
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
    gap: SPACING.MEDIUM,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.MEDIUM,
    height: DESIGN_CONSTANTS.SEARCH_BAR_HEIGHT,
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
  searchIcon: {
    marginRight: SPACING.SMALL,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING.SMALL,
  },
  filterButton: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    height: DESIGN_CONSTANTS.SEARCH_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
  
 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gridContainer: {
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
  },
 
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BROWN,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: SPACING.MEDIUM,
    alignSelf: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  activeFilterText: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.CARD_BACKGROUND,
    marginRight: SPACING.SMALL,
  },
  clearFilterButton: {
    padding: 2,
  },
});

export default HomePage;