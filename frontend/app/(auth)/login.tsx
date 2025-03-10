import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const horizontalPadding = 20 * 2;
  const availableWidth = width - horizontalPadding;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [fontsLoaded] = useFonts({
    Pacifico: require('../../assets/fonts/Pacifico-Regular.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = () => {
    const users = {
      shelter: { email: "shelter@example.com", password: "shelter123" },
      adopter: { email: "adopter@example.com", password: "adopter123" },
    };

    if (email === users.shelter.email && password === users.shelter.password) {
      router.push('/shelter-home');
    } else if (email === users.adopter.email && password === users.adopter.password) {
      router.push('/home');
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { width, height }]}>
      <View style={styles.mainContainer}>
       
        <View style={[styles.topContainer, { flex: 0.25 }]}>
          <Text style={[styles.topTitle, { fontSize: availableWidth * 0.08 }]}>
            Hello, Welcome Back!
          </Text>
        </View>

      
        <View style={[styles.bottomContainer, { flex: 0.75 }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.inputScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                placeholder="Email"
                placeholderTextColor="#6B6B6B"
                style={[styles.input, { width: availableWidth * 0.9 }]}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6B6B6B"
                secureTextEntry
                style={[styles.input, { width: availableWidth * 0.9 }]}
                value={password}
                onChangeText={setPassword}
              />
              <View style={[styles.optionsRow, { width: availableWidth * 0.9 }]}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.fixedFooter}>
              <TouchableOpacity
                style={[styles.loginButton, { width: availableWidth * 0.9 }]}
                onPress={handleLogin}
              >
                <Text
                  style={[styles.loginButtonText, { fontSize: availableWidth * 0.045 }]}
                >
                  LOG IN
                </Text>
              </TouchableOpacity>
              <View style={[styles.divider, { width: availableWidth * 0.9 }]}>
                <View style={styles.line} />
                <Text style={[styles.orText, { fontSize: availableWidth * 0.035 }]}>
                  or
                </Text>
                <View style={styles.line} />
              </View>
              <TouchableOpacity style={styles.googleButton}>
                <Image
                  source={require('../../assets/images/gl1.png')}
                  style={styles.googleIcon}
                />
              </TouchableOpacity>
              <Text style={[styles.bottomLoginText, { fontSize: availableWidth * 0.035 }]}>
                Already have an account?{' '}
                <Text style={styles.linkText} onPress={() => router.push('/signup')}>
                  Sign Up
                </Text>
              </Text>
            </View>
          </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  topTitle: {
    fontFamily: 'Pacifico',
    color: '#1F2029',
  },
  bottomContainer: {
    backgroundColor: '#E4E0E1',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    elevation: 10,
  },
  inputScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#E4E0E1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    borderWidth: 1,
    borderColor: '#797979',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#704F38',
    borderColor: '#704F38',
  },
  rememberText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  fixedFooter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#704F38',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 15,
    paddingVertical: 12.5,
  },
  loginButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDEDED',
  },
  orText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#6B6B6B',
    marginHorizontal: 10,
  },
  googleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  googleIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  bottomLoginText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginTop: 10,
  },
  linkText: {
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default LoginScreen;
