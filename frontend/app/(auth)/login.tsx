import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Hardcoded users
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
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/logo1brown.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>Welcome Back!</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#6B6B6B"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require('../../assets/images/gl1.png')}
            style={styles.googleIcon}
          />
        </TouchableOpacity>
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
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    color: '#1F2029',
  },
  backText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: width * 0.80,
    backgroundColor: '#EDEDED',
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
    width: width * 0.80,
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
  loginButton: {
    width: width * 0.80,
    height: 50,
    backgroundColor: '#704F38',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 15,
    paddingVertical: 12.5,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.80,
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
});

export default LoginScreen;
