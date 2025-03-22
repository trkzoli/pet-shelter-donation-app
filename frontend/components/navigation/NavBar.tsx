import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const containerWidth = width * 0.95;
  const dynamicWrapperSize = containerWidth * 0.1;     
  const dynamicActiveWrapperSize = containerWidth * 0.13; 
  const dynamicIconSize = containerWidth * 0.08;         
  const bottomNavHeight = dynamicWrapperSize * 1.75;     

  const styles = StyleSheet.create({
    bottomNav: {
      backgroundColor: '#493628',
      borderRadius: 100,
      width: containerWidth,
      height: bottomNavHeight,
      position: 'absolute',
      bottom: insets.bottom + 10,
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
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    activeNavIconWrapper: {
      backgroundColor: '#AB886D',

    },
    navIcon: {
      resizeMode: 'contain',
      tintColor: '#E4E0E1',
    },
  });

  // Return the active size if the route is active, else the normal size
  const getWrapperSize = (routeName: string) =>
    pathname === routeName ? dynamicActiveWrapperSize : dynamicWrapperSize;

  return (
    <View style={styles.bottomNav}>
      {/* Home Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/home' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/home'),
              height: getWrapperSize('/home'),
              borderRadius: getWrapperSize('/home') / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/home.png')}
            style={[styles.navIcon, { width: dynamicIconSize, height: dynamicIconSize }]}
          />
        </View>
      </TouchableOpacity>

      {/* Pets Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/owned-pets')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/owned-pets' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/owned-pets'),
              height: getWrapperSize('/owned-pets'),
              borderRadius: getWrapperSize('/owned-pets') / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/pets.png')}
            style={[styles.navIcon, { width: dynamicIconSize, height: dynamicIconSize }]}
          />
        </View>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/profile' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/profile'),
              height: getWrapperSize('/profile'),
              borderRadius: getWrapperSize('/profile') / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/profile.png')}
            style={[styles.navIcon, { width: dynamicIconSize, height: dynamicIconSize }]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
