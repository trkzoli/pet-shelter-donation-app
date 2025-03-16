import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import NavBar from '../../components/navigation/NavBar';
import SettingsModal from '../../components/Settings';

const ownedPets = [
  { id: '1', name: 'Rex', image: require('../../assets/images/placeholder.png') },
  { id: '2', name: 'Bella', image: require('../../assets/images/placeholder.png') },
  { id: '3', name: 'Max', image: require('../../assets/images/placeholder.png') },
  { id: '4', name: 'Luna', image: require('../../assets/images/placeholder.png') },
  { id: '5', name: 'Charlie', image: require('../../assets/images/placeholder.png') },
];

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleSettingsModal = () => {
    setSettingsVisible(!settingsVisible);
  };

  return (
    <View style={[styles.background, { width, height }]}>
      <View style={[styles.container, { marginTop: height * 0.05 }]}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} onPress={toggleSettingsModal}>
            <Image
              source={require('../../assets/images/settings.png')}
              style={styles.settingsIcon}
            />
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/pphr.png')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileSubtitle}>Owned pets</Text>

          {/* Horizontal Scrollable List of Pets */}
          <FlatList
            data={ownedPets}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.petItem}>
                <Image source={item.image} style={styles.petImage} />
                <Text style={styles.petName}>{item.name}</Text>
              </View>
            )}
            contentContainerStyle={styles.petList}
          />
        </View>

        {/* Scrollable Info Section */}
        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Information</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PetTokens</Text>
                <Text style={styles.infoValue}>0.0 PTK</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Donations Total Value</Text>
                <Text style={styles.infoValue}>0.0 USD</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Previous Donations</Text>
              <Image
                source={require('../../assets/images/aright.png')}
                style={styles.actionButtonIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Token Manager</Text>
              <Image
                source={require('../../assets/images/LogoWhite.png')}
                style={styles.actionButtonIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Favorite Projects</Text>
              <Image
                source={require('../../assets/images/fav.png')}
                style={styles.actionButtonIcon}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <SettingsModal visible={settingsVisible} onClose={toggleSettingsModal} />

        {/* Bottom Navigation Bar */}
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
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#797979',
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
    color: '#493628',
  },
  profileSubtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  petList: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  petItem: {
    alignItems: 'center',
    marginHorizontal: 10,
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
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 10,
  },
  infoBox: {
    borderColor: '#797979',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#AB886D',
  },
  buttonsSection: {
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#797979',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  actionButtonIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#AB886D',
  },
});

export default ProfilePage;
