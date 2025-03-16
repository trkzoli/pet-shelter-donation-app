import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const DetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, breed, sex, image } = params;
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.background, { width, height }]}>
      <View style={[styles.container, { paddingTop: height * 0.05 }]}>
        

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          {/* Pet Image */}
          <View style={styles.petImageContainer}>
            <Image
              source={image ? image : require('../assets/images/logo1brown.png')}
              style={[styles.petImage, { width: width * 0.6, height: 250 }]}
            />
          </View>

          {/* Pet Name */}
          <Text style={styles.petName}>{String(name)?.toUpperCase()}</Text>

          {/* Pet Info */}
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoTitle}>Breed:</Text> {breed}
            </Text>
          </View>
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoTitle}>Gender:</Text> {sex}
            </Text>
          </View>
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoTitle}>Age:</Text> 2 years
            </Text>
          </View>
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoTitle}>Location:</Text> Happy Tails Shelter, 1234 Doggo St., Petland
            </Text>
          </View>

          {/* Story */}
          <Text style={styles.sectionTitle}>Story</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </Text>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>
            This pet is a loving companion who enjoys long walks, playtime, and cuddles.
            They are the perfect addition to any family looking for a furry friend!
          </Text>

          {/* Gallery */}
          <Text style={styles.sectionTitle}>Gallery</Text>
          <FlatList
            data={[
              require('../assets/images/placeholder.png'),
              require('../assets/images/placeholder.png'),
              require('../assets/images/placeholder.png'),
              require('../assets/images/placeholder.png'),
              require('../assets/images/placeholder.png'),
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={item} style={styles.additionalImage} />
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.imageRow}
          />
        </ScrollView>

        {/* Donate Button */}
        <View>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/donate')}>
            <Text style={styles.actionButtonText}>DONATE</Text>
          </TouchableOpacity>
        </View>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#797979',
  },
  petImageContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
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
    color: '#2C3930',
  },
  petInfoTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#2C3930',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginTop: 15,
    color: '#2C3930',
    marginHorizontal: 20,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#2C3930',
    marginHorizontal: 20,
  },
  imageRow: {
    marginVertical: 20,
    alignItems: 'center',
    marginBottom: 100,
    marginHorizontal: 20,
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  actionButton: {
    backgroundColor: '#AB886D',
    borderRadius: 20,
    width: '90%',
    height: 60,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
});

export default DetailsPage;
