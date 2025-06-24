import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [imagesLoaded, setImagesLoaded] = useState({
    side1: false,
    center: false,
    side2: false,
  });

  const handleSignUp = useCallback(() => {
    router.replace('/choose-signup');
  }, [router]);

  const handleLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const handleImageLoad = useCallback((imageKey: keyof typeof imagesLoaded) => {
    setImagesLoaded(prev => ({ ...prev, [imageKey]: true }));
  }, []);

  const HORIZONTAL_PADDING = 40;
  const availableWidth = width - HORIZONTAL_PADDING;
  const sideImageWidth = availableWidth * 0.30;
  const sideImageHeight = availableWidth * 0.40;
  const middleImageWidth = availableWidth * 0.35;
  const middleImageHeight = availableWidth * 0.45;
  
  const titleFontSize = width * 0.06;
  const descriptionFontSize = width * 0.04;
  const buttonFontSize = width * 0.04;
  const buttonHeight = height * 0.07;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
           
            <View style={[styles.imageRow, { width: availableWidth }]}>
              {/* Side Image 1 */}
              <View style={[styles.imageContainer, { width: sideImageWidth, height: sideImageHeight }]}>
                <Image
                  source={require('../../assets/images/ph1.jpg')}
                  style={[
                    styles.sideImage,
                    { 
                      width: sideImageWidth, 
                      height: sideImageHeight,
                      opacity: imagesLoaded.side1 ? 1 : 0,
                    },
                  ]}
                  onLoad={() => handleImageLoad('side1')}
                  resizeMode="cover"
                />
              </View>

              {/* Center Image */}
              <View style={[styles.imageContainer, { width: middleImageWidth, height: middleImageHeight }]}>
                <Image
                  source={require('../../assets/images/tmh1.jpg')}
                  style={[
                    styles.middleImage,
                    { 
                      width: middleImageWidth, 
                      height: middleImageHeight,
                      opacity: imagesLoaded.center ? 1 : 0,
                    },
                  ]}
                  onLoad={() => handleImageLoad('center')}
                  resizeMode="cover"
                />
              </View>

              {/* Side Image 2 */}
              <View style={[styles.imageContainer, { width: sideImageWidth, height: sideImageHeight }]}>
                <Image
                  source={require('../../assets/images/ph2.jpg')}
                  style={[
                    styles.sideImage,
                    { 
                      width: sideImageWidth, 
                      height: sideImageHeight,
                      opacity: imagesLoaded.side2 ? 1 : 0,
                    },
                  ]}
                  onLoad={() => handleImageLoad('side2')}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
              <Text style={styles.highlightedWord}>Adopt</Text> a furry friend virtually
            </Text>

            {/* Description */}
            <Text style={[styles.description, { fontSize: descriptionFontSize }]}>
             
            </Text>

            {/* CTA Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.signupButton, 
                  { width: availableWidth, height: buttonHeight }
                ]}
                onPress={handleSignUp}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign up for Pawner"
              >
                <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
                  SIGN UP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { width: availableWidth, height: buttonHeight }
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Log in to existing account"
              >
                <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
                  LOG IN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#E4E0E1', 
    borderRadius: 20,
    overflow: 'hidden',
  },
  sideImage: {
    borderRadius: 20,
    position: 'absolute',
  },
  middleImage: {
    borderRadius: 20,
    position: 'absolute',
  },
  title: {
    fontFamily: 'PoppinsSemiBold',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 15,
  },
  highlightedWord: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  description: {
    fontFamily: 'PoppinsItalic',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 40,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  signupButton: {
    backgroundColor: '#AB886D',
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loginButton: {
    backgroundColor: '#D6C0B3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
});

export default WelcomeScreen;



