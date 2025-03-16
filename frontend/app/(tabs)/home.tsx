import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import NavBar from '../../components/navigation/NavBar';

const animals = [
  { id: '1', name: 'Buddy', breed: 'Chihuahua', sex: 'Male', type: 'Dogs', image: require('../../assets/images/ds1.jpg') },
  { id: '2', name: 'Max', breed: 'Rottweiler', sex: 'Male', type: 'Dogs', image: require('../../assets/images/ds2.jpg') },
  { id: '3', name: 'Bella', breed: 'German Shepherd', sex: 'Female', type: 'Dogs', image: require('../../assets/images/ds3.jpg') },
  { id: '4', name: 'Lucy', breed: 'Beagle', sex: 'Female', type: 'Dogs', image: require('../../assets/images/ds4.jpg') },
  { id: '5', name: 'Charlie', breed: 'Labrador', sex: 'Male', type: 'Dogs', image: require('../../assets/images/ds5.jpg') },
  { id: '6', name: 'Whiskers', breed: 'Persian', sex: 'Male', type: 'Cats', image: require('../../assets/images/cs1.jpg') },
  { id: '7', name: 'Snowball', breed: 'Angora', sex: 'Female', type: 'Cats', image: require('../../assets/images/cs2.jpg') },
  { id: '8', name: 'Nibbles', breed: 'Syrian', sex: 'Male', type: 'Hamsters', image: require('../../assets/images/hs1.jpg') },
];

const HomePage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState(animals);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = animals.filter((animal) => {
      const matchesSearch =
        animal.name.toLowerCase().includes(text.toLowerCase()) ||
        animal.breed.toLowerCase().includes(text.toLowerCase())
      const matchesFilter = activeFilter === 'All' || animal.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
    setFilteredAnimals(filtered);
  };

  return (
    <View style={[styles.background, { width, height }]}>
      <View style={[styles.container, { paddingTop: height * 0.05 }]}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search by name, breed, or gender ..."
            placeholderTextColor="#797979"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <View style={styles.filterButton}>
            <Image source={require('../../assets/images/search.png')} style={{ width: 25, height: 25, tintColor: '#797979' }} />
          </View>
        </View>

        <View style={styles.filters}>
          {['All', 'Dogs', 'Cats', 'Hamsters'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButtonTab, filter === activeFilter && styles.activeFilter]}
              onPress={() => {
                setActiveFilter(filter);
                setSearchQuery('');
                const filtered = animals.filter((animal) =>
                  filter === 'All' ? true : animal.type === filter
                );
                setFilteredAnimals(filtered);
              }}
            >
              <Text style={[styles.filterTextTab, filter === activeFilter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
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
              <Image source={item.image} style={[styles.cardImage, { height: width * 0.4 }]} />
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{item.name}</Text>
                
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.grid}
        />

        <NavBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    backgroundColor: '#E4E0E1',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    padding: 8,
  },
  filterButton: {
    paddingRight: 10,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    width: '100%',
  },
  filterButtonTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#3F4F44',
  },
  filterTextTab: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  activeFilterText: {
    color: '#E4E0E1',
    fontFamily: 'PoppinsBold',
  },
  grid: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E4E0E1',
    maxWidth: '48%',
  },
  cardImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(63, 79, 68, 0.6)',
    padding: 5,
  },
  overlayText: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    alignSelf: 'center',
  },
});

export default HomePage;
