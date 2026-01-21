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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { setTabsUI } from '../../config/systemUI';
import { FilterDropdownModal } from '../../components/modals';
import ShelterPetCard from '../../components/pet/ShelterPetCard';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


type FilterType = 'All' | 'Dogs' | 'Cats'; 


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 16,
  BORDER_RADIUS: 20,
  SEARCH_BAR_HEIGHT: 45,
  CARD_SPACING: 6, 
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
  CARD_BODY: 0.032,
  BUTTON_TEXT: 0.038,
} as const;


interface ShelterPet {
  id: string;
  name: string;
  breed: string;
  type: FilterType;
  donations: number;
  donorCount: number;
  image: any;
}

const ShelterHomePage: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pets, setPets] = useState<ShelterPet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTabsUI();
  }, []);


  const fetchPets = useCallback(async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
       
        console.log('FRONTEND: No token found, showing empty state for new user');
        setPets([]);
        return;
      }
      
      const res = await axios.get(`${API_BASE_URL}/pets/shelter/my-pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      console.log('FRONTEND: Raw backend response:', JSON.stringify(res.data, null, 2));
      
      const mappedPets: ShelterPet[] = res.data.map((pet: any) => {
        console.log(`FRONTEND: Mapping pet ${pet.id}:`, {
          name: pet.name,
          breed: pet.breed,
          type: pet.type,
          currentMonthDonations: pet.currentMonthDonations,
          adoptionRequestsCount: pet.adoptionRequestsCount,
          status: pet.status,
          mainImage: pet.mainImage
        });
        
        return {
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          type: pet.type === 'dog' ? 'Dogs' : pet.type === 'cat' ? 'Cats' : 'Other',
          donations: pet.currentMonthDonations ?? 0, 
          donorCount: pet.adoptionRequestsCount ?? 0, 
          image: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
        };
      });
      
      console.log('FRONTEND: Mapped pets:', mappedPets);
      setPets(mappedPets);
    } catch (err: any) {
      console.error('FRONTEND: Error fetching pets:', err);
      
     
      if (err.response?.status === 401) {
        setPets([]);
       
      } else if (err.message === 'Not authenticated') {
        setPets([]);
      } else {
        
        setError('Unable to load pets. Please check your connection and try again.');
      }
    }
  }, []);


  useEffect(() => {
    fetchPets();
  }, [fetchPets]);


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const searchTextFontSize = width * FONT_RATIOS.SEARCH_TEXT;
  const cardTitleFontSize = width * FONT_RATIOS.CARD_TITLE;
  const cardSubtitleFontSize = width * FONT_RATIOS.CARD_SUBTITLE;
  const cardBodyFontSize = width * FONT_RATIOS.CARD_BODY;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const filteredPets = useMemo(() => {
    let filtered = pets;
    if (activeFilter !== 'All') {
      filtered = filtered.filter(pet => pet.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [searchQuery, activeFilter, pets]);


  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterPress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleFilterSelect = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setModalVisible(false);
  }, []);

  const handlePetManage = useCallback((pet: ShelterPet) => {
    router.push(`/manage-pet/${pet.id}` as any);
  }, [router]);
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);
  
  
  const renderPetCard = useCallback(({ item: pet }: { item: ShelterPet }) => (
    <ShelterPetCard
      pet={pet}
      onPress={handlePetManage}
      cardTitleFontSize={cardTitleFontSize}
      cardSubtitleFontSize={cardSubtitleFontSize}
      cardBodyFontSize={cardBodyFontSize}
      buttonTextFontSize={buttonTextFontSize}
    />
  ), [handlePetManage, cardTitleFontSize, cardSubtitleFontSize, cardBodyFontSize, buttonTextFontSize]);

  
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={80} color={COLORS.LIGHT_BROWN} />
      <Text style={[styles.emptyTitle, { fontSize: cardTitleFontSize }]}>
        No Pets Found
      </Text>
      <Text style={[styles.emptySubtitle, { fontSize: cardBodyFontSize }]}>
        {searchQuery || activeFilter !== 'All' 
          ? 'Try adjusting your search or filter' 
          : 'Start by adding your first pet to the shelter'}
      </Text>
      {!searchQuery && activeFilter === 'All' && (
        <TouchableOpacity 
          style={styles.addPetButton}
          onPress={() => router.push('/shelter-pets-add')}
        >
          <Text style={[styles.addPetButtonText, { fontSize: buttonTextFontSize }]}>
            Add Your First Pet
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, activeFilter, cardTitleFontSize, cardBodyFontSize, buttonTextFontSize, router]);
  
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={[styles.mainContent, { paddingTop: height * 0.05 }]}>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          My Shelter Dashboard
        </Text>

        
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
      </View>

      {error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

   
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        renderItem={renderPetCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredPets.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.LIGHT_BROWN]}
            tintColor={COLORS.LIGHT_BROWN}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: DESIGN_CONSTANTS.CARD_SPACING }} />}
        
      />

      <FilterDropdownModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.MEDIUM,
  },
  

  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    marginBottom: SPACING.EXTRA_LARGE,
  },
  
  
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.MEDIUM,
    height: DESIGN_CONSTANTS.SEARCH_BAR_HEIGHT,
  },
  searchIcon: {
    marginRight: SPACING.SMALL,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
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
  
  
  listContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: 140,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.EXTRA_LARGE * 3,
  },
  emptyTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.LARGE,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    lineHeight: 20,
  },
  addPetButton: {
    backgroundColor: COLORS.PRIMARY_BROWN,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginTop: SPACING.EXTRA_LARGE,
  },
  addPetButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 140,
  },
});

export default ShelterHomePage;

