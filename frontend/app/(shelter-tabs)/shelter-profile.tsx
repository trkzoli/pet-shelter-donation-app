import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageBackground,
} from 'react-native';
import ShelterNavBar from '../../components/navigation/shelterNavBar';
import SettingsModal from '../../components/Settings';

const { width, height } = Dimensions.get('window');

const managedPets = [
  { id: '1', name: 'Buddy', image: require('../../assets/images/ds1.jpg') },
  { id: '2', name: 'Max', image: require('../../assets/images/ds2.jpg') },
  { id: '3', name: 'Bella', image: require('../../assets/images/ds3.jpg') },
];

const ShelterProfile: React.FC = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleSettingsModal = () => {
    setSettingsVisible(!settingsVisible);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} onPress={toggleSettingsModal}>
            <Image source={require('../../assets/images/settings.png')} style={styles.settingsIcon} />
          </TouchableOpacity>

          {/* Shelter Information */}
          <View style={styles.profileSection}>
            <Image source={require('../../assets/images/pphr.png')} style={styles.profileImage} />
            <Text style={styles.profileName}>Happy Tails Shelter</Text>
            <Text style={styles.profileSubtitle}>1234 Pet Street, Petland</Text>
            <Text style={styles.profileContact}>Phone: +1 (555) 123-4567</Text>
          </View>

          {/* Activity Summary */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Shelter Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>$12,000</Text>
                <Text style={styles.statLabel}>Donations This Month</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statLabel}>Pets Available</Text>
              </View>
            </View>
          </View>

          {/* Managed Pets */}
          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Managed Pets</Text>
            <FlatList
              data={managedPets}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.petCard}>
                  <Image source={item.image} style={styles.petImage} />
                  <Text style={styles.petName}>{item.name}</Text>
                </View>
              )}
              contentContainerStyle={styles.petList}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Donation History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add New Pet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <SettingsModal visible={settingsVisible} onClose={toggleSettingsModal} />

        {/* Bottom Navigation Bar */}
        <ShelterNavBar />
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
    marginTop: height * 0.05,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  settingsButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  profileSubtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  profileContact: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  statsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderColor: '#797979',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#704F38',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  petsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 10,
  },
  petList: {
    flexDirection: 'row',
  },
  petCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  petName: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  actionsSection: {
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#797979',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default ShelterProfile;
