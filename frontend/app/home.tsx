import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import NavBar from '../components/navigation/NavBar';

const animals = [
  { id: '1', name: 'Buddy', breed: 'Chihuahua', sex: 'Male', type: 'Dogs', image: require('../assets/images/ds1.jpg') },
  { id: '2', name: 'Max', breed: 'Rottweiler', sex: 'Male', type: 'Dogs', image: require('../assets/images/ds2.jpg') },
  { id: '3', name: 'Bella', breed: 'German Shepherd', sex: 'Female', type: 'Dogs', image: require('../assets/images/ds3.jpg') },
  { id: '4', name: 'Lucy', breed: 'Beagle', sex: 'Female', type: 'Dogs', image: require('../assets/images/ds4.jpg') },
  { id: '5', name: 'Charlie', breed: 'Labrador', sex: 'Male', type: 'Dogs', image: require('../assets/images/ds5.jpg') },
  { id: '6', name: 'Whiskers', breed: 'Persian', sex: 'Male', type: 'Cats', image: require('../assets/images/cs1.jpg') },
  { id: '7', name: 'Snowball', breed: 'Angora', sex: 'Female', type: 'Cats', image: require('../assets/images/cs2.jpg') },
  { id: '8', name: 'Nibbles', breed: 'Syrian', sex: 'Male', type: 'Hamsters', image: require('../assets/images/hs1.jpg') },
];

const { height } = Dimensions.get('window');

const HomePage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // Detect the current route

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState(animals);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    const filtered = animals.filter((animal) => {
      const matchesSearch =
        animal.name.toLowerCase().includes(text.toLowerCase()) ||
        animal.breed.toLowerCase().includes(text.toLowerCase()) ||
        animal.sex.toLowerCase().includes(text.toLowerCase());

      const matchesFilter =
        activeFilter === 'All' || animal.type === activeFilter;

      return matchesSearch && matchesFilter;
    });

    setFilteredAnimals(filtered);
  };

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search by name, breed, or gender ..."
            placeholderTextColor="#797979"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <View style={styles.filterButton}>
            <Image source={require('../assets/images/search.png')} style={{ width: 25, height: 25 }} />
          </View>
        </View>

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

        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{item.name}</Text>
                <Text style={styles.overlayText}>{item.breed}</Text>
                <Text style={styles.overlayText}>{item.sex}</Text>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    router.push({
                      pathname: '/details',
                      params: {
                        id: item.id,
                        name: item.name,
                        breed: item.breed,
                        sex: item.sex,
                        image: item.image,
                      },
                    })
                  }
                >
                  <Text style={styles.detailButtonText}>🦴</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.grid}
        />
        <NavBar />
        
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  filterButton: {
    paddingRight: 10,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  filterButtonTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
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
    color: '#FFFFFF',
    fontFamily: 'PoppinsBold',
  },
  grid: {
    paddingHorizontal: 5,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EDEDED',
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: width * 0.4,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    padding: 10,
  },
  overlayText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#EDEDED',
  },
  detailButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#1F2029',
    padding: 5,
    borderRadius: 20,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#EDEDED',
  },
});

export default HomePage;
