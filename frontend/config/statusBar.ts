import { StatusBar, Platform } from 'react-native';

// Global status bar configuration
export const APP_STATUS_BAR_CONFIG = {
  backgroundColor: '#E4E0E1', 
  barStyle: 'dark-content' as const, 
  translucent: false, 
  hidden: false, 
} as const;


export const initializeStatusBar = () => {
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor(APP_STATUS_BAR_CONFIG.backgroundColor, true);
  }
  StatusBar.setBarStyle(APP_STATUS_BAR_CONFIG.barStyle, true);
  StatusBar.setHidden(APP_STATUS_BAR_CONFIG.hidden, 'fade');
};

export const SPECIAL_STATUS_BAR_CONFIGS = {
  splash: {
    backgroundColor: '#E4E0E1',
    barStyle: 'dark-content' as const,
    translucent: true,
    hidden: false,
  },
  auth: {
    backgroundColor: '#E4E0E1',
    barStyle: 'dark-content' as const,
    translucent: false,
    hidden: false,
  },
  modal: {
    backgroundColor: '#E4E0E1',
    barStyle: 'dark-content' as const,
    translucent: false,
    hidden: false,
  },
  fullscreen: {
    backgroundColor: '#000000',
    barStyle: 'light-content' as const,
    translucent: true,
    hidden: true,
  },
} as const;


export const applyStatusBarConfig = (configType: keyof typeof SPECIAL_STATUS_BAR_CONFIGS) => {
  const config = SPECIAL_STATUS_BAR_CONFIGS[configType];
  
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor(config.backgroundColor, true);
  }
  StatusBar.setBarStyle(config.barStyle, true);
  StatusBar.setHidden(config.hidden, 'fade');
};