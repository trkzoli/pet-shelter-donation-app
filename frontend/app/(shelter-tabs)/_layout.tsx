import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Image, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setTabsUI } from '../../config/systemUI';
import { useState } from 'react';
import { Keyboard } from 'react-native';


const TAB_CONSTANTS = {
  HEIGHT: 70,
  BORDER_RADIUS: 50,
  ICON_SIZE: 24,
  ACTIVE_ICON_SIZE: 28,
  HORIZONTAL_PADDING: 20,
} as const;


interface ShelterTabConfig {
  name: string;
  title: string;
  icon: any;
  focusedIcon: any;
}

const SHELTER_TAB_CONFIG: readonly ShelterTabConfig[] = [
  {
    name: 'shelter-home',
    title: 'My Pets',
    icon: require('../../assets/images/pets.png'),
    focusedIcon: require('../../assets/images/pets.png'),
  },
  {
    name: 'shelter-pets-add',
    title: 'Add Pet',
    icon: require('../../assets/images/pa2.png'), 
    focusedIcon: require('../../assets/images/pa2.png'),
  },
  {
    name: 'shelter-profile',
    title: 'Profile',
    icon: require('../../assets/images/sprofile.png'),
    focusedIcon: require('../../assets/images/sprofile.png'),
  },
] as const;


interface TabBarIconProps {
  source: any;
  focused: boolean;
  size?: number;
}

const ShelterTabBarIcon: React.FC<TabBarIconProps> = ({ source, focused, size }) => {
  const iconSize = size || (focused ? TAB_CONSTANTS.ACTIVE_ICON_SIZE : TAB_CONSTANTS.ICON_SIZE);
  
  return (
    <Image
      source={source}
      style={{
        width: iconSize,
        height: iconSize,
        tintColor: focused ? '#E4E0E1' : '#AB886D',
        resizeMode: 'contain',
      }}
    />
  );
};


interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: (event: any) => void;
  style?: any;
  [key: string]: any; 
}

const ShelterTabBarButton: React.FC<TabBarButtonProps> = ({ 
  children, 
  onPress, 
  style,
  ...restProps 
}) => {
  return (
    <TouchableOpacity
      {...restProps}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        style,
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};


const handleShelterTabPress = (originalOnPress?: (event: any) => void) => (event: any) => {

  if (Platform.OS === 'ios') {
    try {
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback?.impactAsync?.(HapticFeedback.ImpactFeedbackStyle?.Light);
    } catch (error) {

      console.warn('Haptic feedback not available:', error);
    }
  }
  

  originalOnPress?.(event);
};

export default function ShelterTabsLayout() {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    setTabsUI();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
        backgroundColor: '#493628',
        borderTopWidth: 0,
        height: TAB_CONSTANTS.HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        paddingTop: 8,
        paddingHorizontal: TAB_CONSTANTS.HORIZONTAL_PADDING,
        borderTopLeftRadius: TAB_CONSTANTS.BORDER_RADIUS,
        borderTopRightRadius: TAB_CONSTANTS.BORDER_RADIUS,
        
        
        position: 'absolute',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          hide: {
            animation: 'timing',
            config: {
              duration: 200,
            },
          },
          show: {
            animation: 'timing',
            config: {
              duration: 200,
            },
          },
        },
        tabBarActiveTintColor: '#E4E0E1',
        tabBarInactiveTintColor: '#AB886D',
        tabBarLabelStyle: {
          fontFamily: 'PoppinsSemiBold',
          fontSize: 12,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        animation: 'shift',
      }}
    >
      {SHELTER_TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <ShelterTabBarIcon
                source={focused ? tab.focusedIcon : tab.icon}
                focused={focused}
              />
            ),
            tabBarButton: (props) => (
              <ShelterTabBarButton
                {...props}
                onPress={handleShelterTabPress(props.onPress)}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}