import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ImageBackground,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');



const ShelterPetsManage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    name: initialName,
    breed: initialBreed,
    gender: initialGender = 'Unknown',
    donations,
    image,
    story = 'No story provided.',
    description = 'No description provided.',
    additionalMedia = [],
  } = params;

  const [vaccinationCost, setVaccinationCost] = useState('');
  const [deparasitizationCost, setDeparasitizationCost] = useState('');
  const [otherMedicalCost, setOtherMedicalCost] = useState('');

  const [totalDonationGoal, setTotalDonationGoal] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState([
    require('../assets/images/placeholder.png'),
    require('../assets/images/placeholder.png'),
    require('../assets/images/placeholder.png'),
    require('../assets/images/placeholder.png'),
    require('../assets/images/placeholder.png'),
  ]);
  
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const [editableName, setEditableName] = useState(initialName);
  const [editableBreed, setEditableBreed] = useState(initialBreed);
  const [editableGender, setEditableGender] = useState(initialGender);
  const [editableStory, setEditableStory] = useState(story);
  const [editableDescription, setEditableDescription] = useState(description);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | { uri: string } | null>(null);
  
  const calculateTotalGoal = () => {
    const total =
        parseInt(vaccinationCost || '0') +
        parseInt(deparasitizationCost || '0') +
        parseInt(otherMedicalCost || '0');
    setTotalDonationGoal(total);
    };

  const toggleDetails = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
  };

  const removeMedia = (index: number) => {
    const updatedMedia = [...uploadedMedia];
    updatedMedia.splice(index, 1);
    setUploadedMedia(updatedMedia);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    // Logic to save changes
  };

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Pet Image */}
        <View style={styles.imageContainer}>
            <Image
                source={image ? { uri: image } : require('../assets/images/placeholder.png')}
                style={styles.petImage}
            />
          <TouchableOpacity style={styles.changePictureButton}>
            <Text style={styles.changePictureText}>Change Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Details */}
        <View style={[styles.detailsContainer, isDetailsExpanded && styles.detailsExpanded]}>
          <TouchableOpacity onPress={toggleDetails} style={styles.detailsHeader}>
            <Text style={styles.petName}>{editableName}</Text>
            <Text style={styles.petBreed}>{editableBreed}</Text>
            <Text style={styles.petBreed}>{editableGender}</Text>
            <Text style={styles.petDonations}>Total Donations This Month: ${donations}</Text>
            <Text style={styles.expandDetailsText}>
              {isDetailsExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
            </Text>
          </TouchableOpacity>

          {isDetailsExpanded && (
            <View>
              <Text style={styles.petBreed}>Story</Text>
              <Text style={styles.plainText}>{editableStory}</Text>

              <Text style={styles.petBreed}>Description</Text>
              <Text style={styles.plainText}>{editableDescription}</Text>

              {/* Edit Button */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
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
                <Text style={styles.totalGoalText}>Monthly Donation Goal: ${totalDonationGoal}</Text>
                <TouchableOpacity style={styles.calculateButton} onPress={calculateTotalGoal}>
                <Text style={styles.calculateButtonText}>Recalculate</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.mediaContainer}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <FlatList
            data={uploadedMedia}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => setSelectedImage(typeof item === 'number' ? item : { uri: item } )}
                    >
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
        <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
                // Logic to save changes (send data to an API or update state)
                console.log('Changes saved:', {
                name: editableName,
                breed: editableBreed,
                gender: editableGender,
                story: editableStory,
                description: editableDescription,
                vaccinationCost,
                deparasitizationCost,
                otherMedicalCost,
                totalDonationGoal,
                uploadedMedia,
                });
                router.push('/shelter-home');
            }}
            >
            <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
      </ScrollView>

      {/* Modal for Editing */}
      <Modal
        animationType="slide"
        transparent
        visible={isEditing}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Pet Details</Text>

            <TextInput
              placeholder="Name"
              style={styles.modalInput}
              value={editableName}
              onChangeText={setEditableName}
            />
            <TextInput
              placeholder="Breed"
              style={styles.modalInput}
              value={editableBreed}
              onChangeText={setEditableBreed}
            />
            <TextInput
              placeholder="Gender"
              style={styles.modalInput}
              value={editableGender}
              onChangeText={setEditableGender}
            />
            <TextInput
              placeholder="Story"
              style={[styles.modalInput, { height: 80 }]}
              multiline
              value={editableStory}
              onChangeText={setEditableStory}
            />
            <TextInput
              placeholder="Description"
              style={[styles.modalInput, { height: 80 }]}
              multiline
              value={editableDescription}
              onChangeText={setEditableDescription}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleEditSave}>
                <Text style={styles.modalSaveText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
        >
        <View style={styles.modalContainer}>
            <Image
            source={typeof selectedImage === 'number' ? selectedImage : selectedImage}
            style={styles.enlargedImage}
            />
            <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setSelectedImage(null)}
            >
            <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
        </Modal>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petImage: {
    width: width * 0.4,
    height: width * 0.5,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  changePictureButton: {
    marginTop: 10,
    backgroundColor: '#1F2029',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  changePictureText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  detailsContainer: {
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    marginBottom: 20,
  },
  detailsExpanded: {
    paddingBottom: 30,
  },
  detailsHeader: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  petBreed: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  petDonations: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#704F38',
    marginBottom: 10,
  },
  expandDetailsText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  editableInput: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    borderWidth: 1,
    borderColor: '#797979',
  },
  healthContainer: {
    backgroundColor: '#EDEDED',
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
  totalGoalContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalGoalText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#704F38',
  },
  calculateButton: {
    backgroundColor: '#1F2029',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  calculateButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  mediaContainer: {
    marginBottom: 20,
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
    gap: 10,
  },
  addMediaButton: {
    backgroundColor: '#1F2029',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    
  },
  addMediaButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
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
    color: '#EDEDED',
  },
  
  enlargedImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#1F2029',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#704F38',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF3B3B',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginBottom: 15,
    color: '#1F2029',
    textAlign: 'center',
  },
  modalInput: {
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 15,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  modalSaveButton: {
    backgroundColor: '#1F2029',
    borderRadius: 15,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  modalSaveText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  plainText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#1F2029',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#EDEDED',
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'PoppinsBold',
        color: '#1F2029',
    },
});

export default ShelterPetsManage;
