import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ShelterNavBar: React.FC = () => {
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
      backgroundColor: 'rgba(73, 54, 40, 0.9)',
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

  const getWrapperSize = (routeName: string) =>
    pathname === routeName ? dynamicActiveWrapperSize : dynamicWrapperSize;

  return (
    <View style={styles.bottomNav}>
      {/* Shelter Home Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/shelter-home')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/shelter-home' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/shelter-home'),
              height: getWrapperSize('/shelter-home'),
              borderRadius: getWrapperSize('/shelter-home') / 2,
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
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/shelter-pets-add')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/shelter-pets-add' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/shelter-pets-add'),
              height: getWrapperSize('/shelter-pets-add'),
              borderRadius: getWrapperSize('/shelter-pets-add') / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/pets.png')}
            style={[styles.navIcon, { width: dynamicIconSize, height: dynamicIconSize }]}
          />
        </View>
      </TouchableOpacity>

      {/* Shelter Profile Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/shelter-profile')}>
        <View
          style={[
            styles.navIconWrapper,
            pathname === '/shelter-profile' && styles.activeNavIconWrapper,
            {
              width: getWrapperSize('/shelter-profile'),
              height: getWrapperSize('/shelter-profile'),
              borderRadius: getWrapperSize('/shelter-profile') / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/sprofile.png')}
            style={[styles.navIcon, { width: dynamicIconSize, height: dynamicIconSize }]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ShelterNavBar;
