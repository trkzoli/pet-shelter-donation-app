import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  ImageBackground,
  ScrollView,
} from 'react-native';
import NavBar from '../components/navigation/NavBar';

const { width, height } = Dimensions.get('window');

// Mock data for owned pets
const ownedPets = [
  {
    id: '1',
    name: 'Rex',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'Male',
    donations: 70,
    health: {
      vaccination: 100,
      deparasitization: 80,
    },
    story: 'Rex was rescued from a shelter. He is active and loves to play!',
    location: 'Happy Tails Shelter, 1234 Doggo St., Petland',
    additionalImages: [
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
    ],
    image: require('../assets/images/placeholder.png'),
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Labrador',
    age: '3 years',
    gender: 'Female',
    donations: 40,
    health: {
      vaccination: 90,
      deparasitization: 70,
    },
    story: 'Bella is a loving dog who enjoys cuddles and walks.',
    location: 'Safe Haven Shelter, 5678 Puppy Rd., Dogville',
    additionalImages: [
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
      require('../assets/images/placeholder.png'),
    ],
    image: require('../assets/images/placeholder.png'),
  },
];

const OwnedPetsPage: React.FC = () => {
  const renderPetDetails = (pet: typeof ownedPets[0]) => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Pet Image */}
      <View style={styles.petImageContainer}>
        <Image source={pet.image} style={styles.petImage} />
      </View>

      {/* Pet Name */}
      <Text style={styles.petName}>{pet.name.toUpperCase()}</Text>

      {/* Pet Info */}
      <View style={styles.petInfoRow}>
        <Text style={styles.petInfoText}>
          <Text style={styles.petInfoTitle}>Breed:</Text> {pet.breed}
        </Text>
      </View>
      <View style={styles.petInfoRow}>
        <Text style={styles.petInfoText}>
          <Text style={styles.petInfoTitle}>Age:</Text> {pet.age}
        </Text>
      </View>
      <View style={styles.petInfoRow}>
        <Text style={styles.petInfoText}>
          <Text style={styles.petInfoTitle}>Gender:</Text> {pet.gender}
        </Text>
      </View>
      <View style={styles.petInfoRow}>
        <Text style={styles.petInfoText}>
          <Text style={styles.petInfoTitle}>Location:</Text> {pet.location}
        </Text>
      </View>

      {/* Monthly Donation Status */}
      <Text style={styles.sectionTitle}>Monthly Donation Status</Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarFill, { width: `${pet.donations}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>{pet.donations}%</Text>
      </View>

      {/* Health Status */}
      <Text style={styles.sectionTitle}>Health Status</Text>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressBarLabel}>Vaccination</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarFill, { width: `${pet.health.vaccination}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>{pet.health.vaccination}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressBarLabel}>Deparasitization</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarFill, { width: `${pet.health.deparasitization}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {pet.health.deparasitization}%
        </Text>
      </View>

      {/* Story */}
      <Text style={styles.sectionTitle}>Story</Text>
      <Text style={styles.sectionText}>{pet.story}</Text>

      {/* Gallery */}
      <Text style={styles.sectionTitle}>Gallery</Text>
      <View style={styles.galleryContainer}>
        {pet.additionalImages.map((image, index) => (
          <Image key={index} source={image} style={styles.additionalImage} />
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <FlatList
          data={ownedPets}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.petCard}>{renderPetDetails(item)}</View>
          )}
        />

        {/* NavBar Integration */}
        <NavBar />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: height * 0.05,
  },
  petCard: {
    width: width,
    height: height,
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  petImageContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  petImage: {
    width: width * 0.6,
    height: 250,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  petName: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 10,
  },
  petInfoRow: {
    marginHorizontal: 20,
    marginVertical: 5,
  },
  petInfoText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  petInfoTitle: {
    fontFamily: 'PoppinsBold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginTop: 5,
    color: '#1F2029',
    marginHorizontal: 20,
  },
  sectionText: {
    fontSize: 16,
    color: '#1F2029',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  progressBarContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  progressBarLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#797979',
    backgroundColor: '#EDEDED',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#704F38',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#797979',
    textAlign: 'right',
    marginTop: 5,
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 150,
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    margin: 5,
  },
});

export default OwnedPetsPage;
