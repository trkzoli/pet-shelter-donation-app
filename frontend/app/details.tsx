import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const DetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { id, name, breed, sex, image } = params;

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.petImageContainer}>
            <Image
              source={image ? image : require('../assets/images/logo1brown.png')}
              style={styles.petImage}
            />
          </View>

          <Text style={styles.petName}>{String(name)?.toUpperCase()}</Text>
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>Breed: {breed}</Text>
            <Text style={styles.petInfoText}>Sex: {sex}</Text>
          </View>
          <View style={styles.petInfoRow}>
            <Text style={styles.petInfoText}>Age: 2 years</Text>
            <Text style={styles.petInfoText}>Gender: Male</Text>
          </View>

          <Text style={styles.sectionTitle}>Shelter Name</Text>
          <Text style={styles.sectionText}>Happy Tails Shelter</Text>

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>1234 Doggo St., Petland</Text>

          <Text style={styles.sectionTitle}>Story</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </Text>

          <FlatList
            data={[
                require('../assets/images/placeholder.png'),
                require('../assets/images/placeholder.png'),
                require('../assets/images/placeholder.png'),
                require('../assets/images/placeholder.png'),
                require('../assets/images/placeholder.png'),
            ]}
            horizontal
            renderItem={({ item }) => (
              <Image source={item} style={styles.additionalImage} />
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.imageRow}
          />
        </ScrollView>

        <View>
          <TouchableOpacity style={styles.actionButton}
            onPress={() => router.push('/donate')}>
            <Text style={styles.actionButtonText}>DONATE / ADOPT</Text>
          </TouchableOpacity>
        </View>
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
    scrollContent: {
        flexGrow: 1,
        
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        color: '#1F2029',
        zIndex: 10,
    },
      backButtonText: {
        fontSize: 24,
        fontFamily: 'PoppinsBold',
        color: '#1F2029',
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
        borderColor: '#704F38',
        resizeMode: 'cover',
        elevation: 5,
      },
      petName: {
        fontSize: 28,
        fontFamily: 'PoppinsBold',
        textAlign: 'center',
        color: '#1F2029',
      },
      petInfoRow: {
        fontSize: 16,
        fontFamily: 'PoppinsRegular',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        
      },
      petInfoText: {
        fontSize: 16,
        color: '#1F2029',
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
        marginTop: -10,
        marginBottom: 5,
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
        backgroundColor: '#704F38',
        borderRadius: 50,
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
        color: '#EDEDED',
    },
});

export default DetailsPage;
