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
import { useLocalSearchParams, useRouter } from 'expo-router';

const ShelterPetsManage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

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
    // Logic to save changes if needed
  };

  return (
    <View style={[styles.background, { width, height }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: height * 0.05 }]} showsVerticalScrollIndicator={false} >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image
            source={image ? { uri: image } : require('../assets/images/placeholder.png')}
            style={[styles.petImage, { width: width * 0.4, height: width * 0.5 }]}
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
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() =>
                  setSelectedImage(
                    typeof item === 'number' ? item : { uri: item }
                  )
                }
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

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
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
              value={
                Array.isArray(editableName)
                  ? editableName.join(', ')
                  : editableName ?? ''
              }
              onChangeText={setEditableName}
            />
            <TextInput
              placeholder="Breed"
              style={styles.modalInput}
              value={
                Array.isArray(editableBreed)
                  ? editableBreed.join(', ')
                  : editableBreed ?? ''
              }
              onChangeText={setEditableBreed}
            />
            <TextInput
              placeholder="Gender"
              style={styles.modalInput}
              value={
                Array.isArray(editableGender)
                  ? editableGender.join(', ')
                  : editableGender ?? ''
              }
              onChangeText={setEditableGender}
            />
            <TextInput
              placeholder="Story"
              style={[styles.modalInput, { height: 80 }]}
              multiline
              value={
                Array.isArray(editableStory)
                  ? editableStory.join(', ')
                  : editableStory ?? ''
              }
              onChangeText={setEditableStory}
            />
            <TextInput
              placeholder="Description"
              style={[styles.modalInput, { height: 80 }]}
              multiline
              value={
                Array.isArray(editableDescription)
                  ? editableDescription.join(', ')
                  : editableDescription ?? ''
              }
              onChangeText={setEditableDescription}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleEditSave}
              >
                <Text style={styles.modalSaveText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Enlarged Image */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <Image
            source={
              selectedImage
                ? typeof selectedImage === 'number'
                  ? selectedImage
                  : { uri: (selectedImage as { uri: string }).uri }
                : require('../assets/images/placeholder.png')
            }
            style={[styles.enlargedImage, { width: width * 0.8, height: width * 0.8 }]}
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    color: '#797979',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 40,
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
  detailsExpanded: {
    paddingBottom: 30,
  },
  detailsHeader: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  petBreed: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  petDonations: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 10,
  },
  expandDetailsText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  plainText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#AB886D',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#E4E0E1',
    fontFamily: 'PoppinsBold',
    fontSize: 14,
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
    color: '#493628',
  },
  calculateButton: {
    backgroundColor: '#AB886D',
    borderRadius: 20,
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
    gap: 10,
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
  enlargedImage: {
    borderRadius: 20,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#AB886D',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  actionsContainer: {
    alignItems: 'center',
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
    color: '#E4E0E1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#3F4F44',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginBottom: 15,
    color: '#E4E0E1',
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
    color: '#E4E0E1',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#D6C0B3',
    borderRadius: 15,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  modalSaveButton: {
    backgroundColor: '#AB886D',
    borderRadius: 15,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#3F4F44',
  },
  modalSaveText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
 
});

export default ShelterPetsManage;
