import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import NavBar from '../../components/navigation/NavBar';
import { useRouter } from 'expo-router';

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
      otherMedications: 60,
    },
    story: 'Rex was rescued from a shelter. He is active and loves to play!',
    description:
      'Rex is a medium-sized dog with a golden coat. He is friendly, energetic, and loves to be around people. He enjoys fetch and long walks.',
    location: 'Happy Tails Shelter, 1234 Doggo St., Petland',
    additionalImages: [
      require('../../assets/images/placeholder.png'),
      require('../../assets/images/placeholder.png'),
      require('../../assets/images/placeholder.png'),
    ],
    image: require('../../assets/images/ds5.jpg'),
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Labrador',
    age: '3 years',
    gender: 'Female',
    donations: 40,
    health: {
      vaccination: 80,
      deparasitization: 70,
      otherMedications: 50,
    },
    story: 'Bella is a loving dog who enjoys cuddles and walks.',
    description:
      'Bella is a large-sized Labrador with a shiny black coat. She is gentle, loyal, and perfect for a family. She enjoys swimming and playing with kids.',
    location: 'Safe Haven Shelter, 5678 Puppy Rd., Dogville',
    additionalImages: [
      require('../../assets/images/placeholder.png'),
      require('../../assets/images/placeholder.png'),
    ],
    image: require('../../assets/images/ds2.jpg'),
  },
];

const getHeatmapColor = (percentage: number) => {
  if (percentage <= 50) {
    const red = 255;
    const green = Math.floor((percentage / 50) * 255);
    return `rgb(${red}, ${green}, 0)`;
  } else {
    const green = 255;
    const red = Math.floor((1 - (percentage - 50) / 50) * 255);
    return `rgb(${red}, ${green}, 0)`;
  }
};

const OwnedPetsPage: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const renderPetDetails = (pet: typeof ownedPets[0]) => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Pet Image */}
      <View style={styles.petImageContainer}>
        <Image
          source={pet.image}
          style={[
            styles.petImage,
            { width: width * 0.6, height: 250 },
          ]}
        />
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
            style={[
              styles.progressBarFill,
              {
                width: `${pet.donations}%`,
                backgroundColor: getHeatmapColor(pet.donations),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {pet.donations}%
        </Text>
      </View>

      {/* Donate Button */}
      <View style={styles.donationButtonContainer}>
        <TouchableOpacity
          style={[styles.donationButton,  {width: width * 0.5 , height: width * 0.15},] }
          onPress={() => router.push('/donate')}
        >
          <Image
            source={require('../../assets/images/donate.png')}
            style={styles.donationButtonImage}
          />
        </TouchableOpacity>
      </View>

      {/* Health Status */}
      <Text style={styles.sectionTitle}>Health Status</Text>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressBarLabel}>Vaccination</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${pet.health.vaccination}%`,
                backgroundColor: getHeatmapColor(pet.health.vaccination),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {pet.health.vaccination}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressBarLabel}>Deparasitization</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${pet.health.deparasitization}%`,
                backgroundColor: getHeatmapColor(pet.health.deparasitization),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {pet.health.deparasitization}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressBarLabel}>Other Medications</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${pet.health.otherMedications}%`,
                backgroundColor: getHeatmapColor(pet.health.otherMedications),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {pet.health.otherMedications}%
        </Text>
      </View>

      {/* Story */}
      <Text style={styles.sectionTitle}>Story</Text>
      <Text style={styles.sectionText}>{pet.story}</Text>

      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.sectionText}>{pet.description}</Text>

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
    <View style={[styles.background, { width, height }]}>
      <View style={styles.container}>
        {/* Scroll Indicator */}
        <View style={styles.scrollIndicatorContainer}>
          {ownedPets.map((_, index) => (
            <View
              key={index}
              style={[
                styles.scrollIndicator,
                index === activeIndex && styles.activeScrollIndicator,
              ]}
            />
          ))}
        </View>

        {/* Horizontal Scrollable Pets */}
        <FlatList
          data={ownedPets}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.petCard, { width, height }]}>
              {renderPetDetails(item)}
            </View>
          )}
        />

        {/* NavBar Integration */}
        <NavBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 20,
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  scrollIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#797979',
    backgroundColor: '#E4E0E1',
    marginHorizontal: 5,
  },
  activeScrollIndicator: {
    backgroundColor: '#AB886D',
    borderWidth: 1,
    borderColor: '#AB886D',
    borderRadius: 10,
    width: 13,
    height: 13,
  },
  petCard: {
    paddingHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  petImageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  petImage: {
    borderRadius: 25,
    resizeMode: 'cover',
  },
  petName: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    color: '#AB886D',
  },
  petInfoRow: {
    marginHorizontal: 20,
    marginVertical: -4,
  },
  petInfoText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  petInfoTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#1F2029',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginTop: 15,
    color: '#1F2029',
    marginHorizontal: 20,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginHorizontal: 20,
  },
  progressBarContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  progressBarLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  progressBar: {
    height: 25,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#797979',
    backgroundColor: '#E4E0E1',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#797979',
    textAlign: 'right',
    marginTop: 5,
  },
  donationButtonContainer: {
    alignItems: 'center',
  },
  donationButton: {
    borderRadius: 30,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donationButtonImage: {
    width: 50,
    height: 50,
    tintColor: '#E4E0E1',
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
