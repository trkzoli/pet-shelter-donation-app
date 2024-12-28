import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const ChooseSignup: React.FC = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Who are you?</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/signup-shelter')}
          >
            <Image
              source={require('../assets/images/ps2.png')}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Shelter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/signup')}
          >
            <Image
              source={require('../assets/images/pa2.png')}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Adopter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10, 
  },
  backText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginTop: 80, 
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    gap: 20,
  },
  optionCard: {
    width: width * 0.4,
    backgroundColor: '#704F38',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    width: 60,
    height: 60,
    tintColor: '#EDEDED',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
    textAlign: 'center',
  },
});

export default ChooseSignup;
