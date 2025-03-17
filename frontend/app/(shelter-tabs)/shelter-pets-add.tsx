import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import ShelterNavBar from '../../components/navigation/shelterNavBar';

const ShelterPetsAdd: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [story, setStory] = useState('');
  const [description, setDescription] = useState('');
  const [vaccinationCost, setVaccinationCost] = useState('');
  const [deparasitizationCost, setDeparasitizationCost] = useState('');
  const [otherMedicalCost, setOtherMedicalCost] = useState('');
  const [totalDonationGoal, setTotalDonationGoal] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [selectedImage, setSelectedImage] = useState<number | { uri: string } | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const calculateTotalGoal = () => {
    const total =
      parseInt(vaccinationCost || '0') +
      parseInt(deparasitizationCost || '0') +
      parseInt(otherMedicalCost || '0');
    setTotalDonationGoal(total);
  };

  const handleSavePet = () => {
    if (!name || !breed || !gender) {
      setErrorModalVisible(true);
      return;
    }
    console.log('New Pet Added:', {
      name,
      breed,
      gender,
      story,
      description,
      vaccinationCost,
      deparasitizationCost,
      otherMedicalCost,
      totalDonationGoal,
      uploadedMedia,
    });
    router.push('/shelter-home');
  };

  return (
    <View style={[styles.background, { width, height }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/placeholder.png')}
            style={[
              styles.petImage,
              { width: width * 0.4, height: width * 0.5 },
            ]}
          />
          <TouchableOpacity style={styles.changePictureButton}>
            <Text style={styles.changePictureText}>Add Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Details */}
        <View style={styles.detailsContainer}>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Breed"
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
          />
          <TextInput
            placeholder="Gender"
            style={styles.input}
            value={gender}
            onChangeText={setGender}
          />
          <TextInput
            placeholder="Story"
            style={[styles.input, { height: 80 }]}
            multiline
            value={story}
            onChangeText={setStory}
          />
          <TextInput
            placeholder="Description"
            style={[styles.input, { height: 80 }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Health Costs */}
        <View style={styles.healthContainer}>
          <Text style={styles.healthTitle}>Health Costs</Text>
          <TextInput
            placeholder="Vaccination Cost"
            style={styles.input}
            keyboardType="numeric"
            value={vaccinationCost}
            onChangeText={setVaccinationCost}
          />
          <TextInput
            placeholder="Deparasitization Cost"
            style={styles.input}
            keyboardType="numeric"
            value={deparasitizationCost}
            onChangeText={setDeparasitizationCost}
          />
          <TextInput
            placeholder="Other Medical Cost"
            style={styles.input}
            keyboardType="numeric"
            value={otherMedicalCost}
            onChangeText={setOtherMedicalCost}
          />
          <View style={styles.totalGoalContainer}>
            <Text style={styles.totalGoalText}>
              Monthly Donation Goal: ${totalDonationGoal}
            </Text>
            <TouchableOpacity style={styles.calculateButton} onPress={calculateTotalGoal}>
              <Text style={styles.calculateButtonText}>Recalculate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.mediaContainer}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <FlatList
            data={uploadedMedia}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedImage(item)}>
                <Image source={item} style={styles.mediaImage} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.imageRow}
          />
          <View style={styles.mediaActions}>
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={() => console.log('Add image functionality here')}
            >
              <Text style={styles.addMediaButtonText}>Add Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => console.log('Remove image functionality here')}
            >
              <Text style={styles.removeMediaButtonText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePet}>
          <Text style={styles.saveButtonText}>Save Pet</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Custom Error Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { width: width * 0.8 }]}>
            <Text style={styles.modalText}>
              Please fill in all required fields (Name, Breed, Gender).
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>     
      {/* Navigation Bar */}
      <ShelterNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1', // Plain background color
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50, 
    paddingBottom: 150,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#797979',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petImage: {
    borderRadius: 20,
    resizeMode: 'cover',
  },
  changePictureButton: {
    marginTop: 10,
    backgroundColor: '#AB886D',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  changePictureText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  detailsContainer: {
    backgroundColor: '#E4E0E1',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    borderWidth: 1,
    borderColor: '#797979',
  },
  healthContainer: {
    backgroundColor: '#E4E0E1',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },
  healthTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalGoalContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalGoalText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  calculateButton: {
    backgroundColor: '#AB886D',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  calculateButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  mediaContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  imageRow: {
    marginVertical: 20,
    alignItems: 'center',
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addMediaButton: {
    backgroundColor: '#3F4F44',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  addMediaButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  removeMediaButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  removeMediaButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#AB886D',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#3F4F44',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#E4E0E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#AB886D',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
});

export default ShelterPetsAdd;
 