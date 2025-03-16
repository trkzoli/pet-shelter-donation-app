import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const ChooseSignup: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  

  const horizontalPadding = 20 * 2;
  const availableWidth = width - horizontalPadding;
  
  const cardWidth = availableWidth;
  const cardHeight = cardWidth * 0.6; 
  const imageSize = cardHeight * 0.8;
  
  const dynamicSpacing = cardHeight * 0.1;
  
  return (
    <SafeAreaView style={[styles.background, { width, height }]}>
      <View style={[styles.container, { width: availableWidth }]}>
        <Text style={styles.title}>Who are you?</Text>

        <View style={styles.optionsContainer}>

          <TouchableOpacity 
            style={[styles.optionCard, { width: cardWidth, height: cardHeight }]}
            onPress={() => router.push('/signup')}
          >
            <View style={styles.optionContentOwner}>
              <Image
                source={require('../../assets/images/AOwner2.png')}
                style={[styles.optionIcon, { width: imageSize, height: imageSize }]}
              />
              <Text style={[styles.optionText, { marginLeft: dynamicSpacing }]}>
                Pet Owner
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, { width: cardWidth, height: cardHeight, marginTop: 20 }]}
            onPress={() => router.push('/signup-shelter')}
          >
            <View style={styles.optionContentShelter}>
              <Image
                source={require('../../assets/images/AShelter2.png')}
                style={[styles.optionIcon, { width: imageSize, height: imageSize }]}
              />
              <Text style={[styles.optionText, { marginRight: dynamicSpacing }]}>
                Animal Shelter
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 36,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginTop: 30,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: { 
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#D6C0B3',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  optionContentOwner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionContentShelter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  optionIcon: {
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
});

export default ChooseSignup;
