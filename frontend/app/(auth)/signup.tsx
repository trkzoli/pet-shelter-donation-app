import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const horizontalPadding = 20 * 2;
  const availableWidth = width - horizontalPadding;

  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>

        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/images/AOwner2.png')}
            style={[
              styles.topImage,
              { width: width * 0.7, height: width * 0.7 },
            ]}
          />
        </View>
        <View style={styles.bottomContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              placeholder="Name"
              placeholderTextColor="#6B6B6B"
              style={[styles.input, { width: availableWidth * 0.9 }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#6B6B6B"
              style={[styles.input, { width: availableWidth * 0.9 }]}
            />
            <TextInput
              placeholder="Create Password"
              placeholderTextColor="#6B6B6B"
              secureTextEntry
              style={[styles.input, { width: availableWidth * 0.9 }]}
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#6B6B6B"
              secureTextEntry
              style={[styles.input, { width: availableWidth * 0.9 }]}
            />

            <TouchableOpacity
              style={[styles.signupButton, { width: availableWidth * 0.9 }]}
              onPress={() => {/* your sign up handler */}}
            >
              <Text
                style={[styles.signupButtonText, { fontSize: availableWidth * 0.045 }]}
              >
                SIGN UP
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.termsText,
                { width: availableWidth * 0.8, fontSize: availableWidth * 0.03 },
              ]}
            >
              By Signing Up, you agree to our{' '}
              <Text style={styles.linkText}>Terms & Privacy Policy</Text>
            </Text>

            <Text style={[styles.orText, { fontSize: availableWidth * 0.035 }]}>
              - Or Sign Up with -
            </Text>

            <View style={[styles.socialButtonsContainer, { width: availableWidth * 0.8 }]}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../assets/images/gl1.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../assets/images/fb1.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require('../../assets/images/x1.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.loginText, { fontSize: availableWidth * 0.035 }]}>
              Already have an account?{' '}
              <Text style={styles.linkText} onPress={() => router.push('/login')}>
                Login
              </Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
  
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E4E0E1',
  },
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  topImage: {
    resizeMode: 'contain',
    marginVertical: 10,
  },
  bottomContainer: {
    flex: 0.7,
    backgroundColor: '#E4E0E1',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 50,
  },
  input: {
    height: 50,
    backgroundColor: '#E4E0E1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    borderBottomWidth: 1,
    borderColor: '#797979',
  },
  signupButton: {
    height: 50,
    backgroundColor: '#AB886D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 15,
    paddingVertical: 12.5,
  },
  signupButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  termsText: {
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
    color: '#1F2029',
    marginBottom: 10,
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  orText: {
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 10,
    marginTop: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  loginText: {
    marginTop: 10,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
});

export default SignUpScreen;
