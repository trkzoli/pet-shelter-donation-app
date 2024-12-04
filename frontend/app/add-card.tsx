import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const AddCardPage: React.FC = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Add Card</Text>

          {/* Card Image */}
          <View style={styles.cardContainer}>
            <Image
              source={require('../assets/images/ccard.png')}
              style={styles.cardImage}
            />
          </View>

          {/* Payment Information Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor="#797979"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Name on Card"
              placeholderTextColor="#797979"
            />
            <View style={styles.doubleInputContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                placeholderTextColor="#797979"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                placeholderTextColor="#797979"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Save & Continue Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    marginTop: 70,
    
    color: '#1F2029',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardImage: {
    height: 150,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#704F38',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#704F38',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
});

export default AddCardPage;
