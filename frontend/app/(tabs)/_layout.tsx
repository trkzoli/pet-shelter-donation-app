import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Image, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setTabsUI } from '../../config/systemUI';

const TAB_CONSTANTS = {
  HEIGHT: 70,
  BORDER_RADIUS: 50,
  ICON_SIZE: 24,
  ACTIVE_ICON_SIZE: 28,
  HORIZONTAL_PADDING: 20,
} as const;


interface TabConfig {
  name: string;
  title: string;
  icon: any;
  focusedIcon: any;
}

const TAB_CONFIG: readonly TabConfig[] = [
  {
    name: 'home',
    title: 'Home',
    icon: require('../../assets/images/home.png'),
    focusedIcon: require('../../assets/images/home.png'),
  },
  {
    name: 'supported-pets',
    title: 'My Pets',
    icon: require('../../assets/images/pets.png'),
    focusedIcon: require('../../assets/images/pets.png'),
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: require('../../assets/images/profile.png'),
    focusedIcon: require('../../assets/images/profile.png'),
  },
] as const;


interface TabBarIconProps {
  source: any;
  focused: boolean;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ source, focused, size }) => {
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

const TabBarButton: React.FC<TabBarButtonProps> = ({ 
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


const handleTabPress = (originalOnPress?: (event: any) => void) => (event: any) => {
  
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

export default function TabsLayout() {
  const insets = useSafeAreaInsets();


  useEffect(() => {
    setTabsUI();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#493628',
          borderTopWidth: 0,
          height: TAB_CONSTANTS.HEIGHT + insets.bottom,
          paddingHorizontal: TAB_CONSTANTS.HORIZONTAL_PADDING,
          borderTopLeftRadius: TAB_CONSTANTS.BORDER_RADIUS,
          borderTopRightRadius: TAB_CONSTANTS.BORDER_RADIUS,
          
          
          position: 'absolute',
          
        },
        tabBarActiveTintColor: '#E4E0E1',
        tabBarInactiveTintColor: '#AB886D',
        tabBarLabelStyle: {
          fontFamily: 'PoppinsSemiBold',
          fontSize: 10,
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        animation: 'shift',
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={focused ? tab.focusedIcon : tab.icon}
                focused={focused}
              />
            ),
            tabBarButton: (props) => (
              <TabBarButton
                {...props}
                onPress={handleTabPress(props.onPress)}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}