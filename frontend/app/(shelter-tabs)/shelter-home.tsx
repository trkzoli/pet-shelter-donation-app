import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import ShelterNavBar from '../../components/navigation/shelterNavBar';

const animals = [
  { id: '1', name: 'Buddy', breed: 'Chihuahua', donations: 120, type: 'Dogs', image: require('../../assets/images/ds1.jpg') },
  { id: '2', name: 'Max', breed: 'Rottweiler', donations: 250, type: 'Dogs', image: require('../../assets/images/ds2.jpg') },
  { id: '3', name: 'Bella', breed: 'German Shepherd', donations: 180, type: 'Dogs', image: require('../../assets/images/ds3.jpg') },
  { id: '4', name: 'Lucy', breed: 'Beagle', donations: 140, type: 'Dogs', image: require('../../assets/images/ds4.jpg') },
  { id: '5', name: 'Whiskers', breed: 'Persian Cat', donations: 95, type: 'Cats', image: require('../../assets/images/cs1.jpg') },
  { id: '6', name: 'Snowball', breed: 'Angora Cat', donations: 110, type: 'Cats', image: require('../../assets/images/cs2.jpg') },
  { id: '7', name: 'Nibbles', breed: 'Syrian Hamster', donations: 50, type: 'Hamsters', image: require('../../assets/images/hs1.jpg') },
];

const ShelterHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState(animals);
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    const filtered = animals.filter((animal) => {
      const matchesSearch =
        animal.name.toLowerCase().includes(text.toLowerCase()) ||
        animal.breed.toLowerCase().includes(text.toLowerCase());

      const matchesFilter =
        activeFilter === 'All' || animal.type === activeFilter;

      return matchesSearch && matchesFilter;
    });

    setFilteredAnimals(filtered);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Shelter Dashboard</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search by pet name or breed..."
            placeholderTextColor="#797979"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <View style={styles.searchIconWrapper}>
            <Image
              source={require('../../assets/images/search.png')}
              style={styles.searchIcon}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {['All', 'Dogs', 'Cats', 'Hamsters'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButtonTab,
                filter === activeFilter && styles.activeFilter,
              ]}
              onPress={() => {
                setActiveFilter(filter);
                setSearchQuery('');
                const filtered = animals.filter((animal) =>
                  filter === 'All' ? true : animal.type === filter
                );
                setFilteredAnimals(filtered);
              }}
            >
              <Text
                style={[
                  styles.filterTextTab,
                  filter === activeFilter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animal List */}
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.animalCard}>
              <Image source={item.image} style={styles.animalImage} />
              <View style={styles.cardContent}>
                <Text style={styles.animalName}>{item.name}</Text>
                <Text style={styles.animalBreed}>{item.breed}</Text>
                <Text style={styles.animalDonations}>
                  Donations: ${item.donations}
                </Text>
                <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() =>
                        router.push({
                        pathname: '/shelter-pets-manage',
                        params: {
                            name: item.name,
                            breed: item.breed,
                            donations: item.donations,
                            image: Image.resolveAssetSource(item.image).uri,
                        },
                        })
                    }
                    >
                    <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Navigation Bar */}
        <ShelterNavBar />
      </View>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: height * 0.05,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    paddingHorizontal: 10,
  },
  searchIconWrapper: {
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#797979',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  filterButtonTab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#1F2029',
  },
  filterTextTab: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  activeFilterText: {
    color: '#EDEDED',
    fontFamily: 'PoppinsBold',
  },
  listContent: {
    paddingBottom: 100,
  },
  animalCard: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  animalImage: {
    width: '45%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 5,
  },
  animalBreed: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 5,
  },
  animalDonations: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#704F38',
    marginBottom: 10,
  },
  manageButton: {
    backgroundColor: '#704F38',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
});

export default ShelterHome;
