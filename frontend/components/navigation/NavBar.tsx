import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomNav}>
      {/* Home Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
        <View style={[styles.navIconWrapper, pathname === '/home' && styles.activeNavIconWrapper]}>
          <Image source={require('../../assets/images/home.png')} style={styles.navIcon} />
        </View>
      </TouchableOpacity>

      {/* Pets Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/owned-pets')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/owned-pets' && styles.activeNavIconWrapper,
          ]}
        >
          <Image source={require('../../assets/images/pets.png')} style={styles.navIcon} />
        </View>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/profile' && styles.activeNavIconWrapper,
          ]}
        >
          <Image source={require('../../assets/images/profile.png')} style={styles.navIcon} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#1F2029',
    borderRadius: 50,
    width: '90%',
    height: 70,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeNavIconWrapper: {
    backgroundColor: '#704F38',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
  },
  navIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#EDEDED',
  },
});

export default NavigationBar;
