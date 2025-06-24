import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 40,
  CARD_ASPECT_RATIO: 0.6,
  IMAGE_SIZE_RATIO: 0.8,
  SPACING_RATIO: 0.1,
  CARD_GAP: 20,
  TITLE_MARGIN: 30,
} as const;

const FONT_RATIOS = {
  TITLE: 0.09,
  OPTION_TEXT: 0.06, 
} as const;

const ChooseSignup: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  
  const handleBackPress = useCallback(() => {
    router.push('/welcome');
    return true;
  }, [router]);

  const handlePetOwnerPress = useCallback(() => {
    router.replace('/signup');
  }, [router]);

  const handleShelterPress = useCallback(() => {
    router.replace('/signup-shelter');
  }, [router]);


  useEffect(() => {
    const onBackPress = () => {
      router.push('/welcome');
      return true; 
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);


  const availableWidth = width - DESIGN_CONSTANTS.HORIZONTAL_PADDING;
  const cardWidth = availableWidth;
  const cardHeight = cardWidth * DESIGN_CONSTANTS.CARD_ASPECT_RATIO;
  const imageSize = cardHeight * DESIGN_CONSTANTS.IMAGE_SIZE_RATIO;
  const dynamicSpacing = cardHeight * DESIGN_CONSTANTS.SPACING_RATIO;
  

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const optionTextFontSize = width * FONT_RATIOS.OPTION_TEXT;

  return (
    <SafeAreaView style={styles.safeArea}>
 
      <TouchableOpacity 
        onPress={handleBackPress} 
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back to welcome screen"
      >
        <Image
          source={require('../../assets/images/backB.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={[styles.container, { width: availableWidth }]}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>
          Who are you?
        </Text>

        <View style={styles.optionsContainer}>
   
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              { width: cardWidth, height: cardHeight }
            ]}
            onPress={handlePetOwnerPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign up as Pet Owner"
            accessibilityHint="Register to adopt and support pets virtually"
          >
            <View style={styles.optionContentOwner}>
              <Image
                source={require('../../assets/images/AOwner2.png')}
                style={[
                  styles.optionIcon, 
                  { width: imageSize, height: imageSize }
                ]}
                accessibilityLabel="Pet owner illustration"
              />
              <Text 
                style={[
                  styles.optionText, 
                  { 
                    marginLeft: dynamicSpacing,
                    fontSize: optionTextFontSize,
                  }
                ]}
              >
                Donor
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.optionCard, 
              { 
                width: cardWidth, 
                height: cardHeight, 
                marginTop: DESIGN_CONSTANTS.CARD_GAP 
              }
            ]}
            onPress={handleShelterPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign up as Animal Shelter"
            accessibilityHint="Register to manage shelter and showcase pets"
          >
            <View style={styles.optionContentShelter}>
              <Image
                source={require('../../assets/images/AShelter2.png')}
                style={[
                  styles.optionIcon, 
                  { width: imageSize, height: imageSize }
                ]}
                accessibilityLabel="Animal shelter illustration"
              />
              <Text 
                style={[
                  styles.optionText, 
                  { 
                    marginRight: dynamicSpacing,
                    fontSize: optionTextFontSize,
                  }
                ]}
              >
                Shelter Admin
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E4E0E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#797979',
    resizeMode: 'contain',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: DESIGN_CONSTANTS.TITLE_MARGIN,
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

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default ChooseSignup;