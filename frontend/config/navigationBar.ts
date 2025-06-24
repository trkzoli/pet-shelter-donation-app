import { Platform, AppState } from 'react-native';
import * as SystemUI from 'expo-system-ui';

// Navigation bar 
export const NAVIGATION_BAR_CONFIG = {
  backgroundColor: '#E4E0E1', 
  defaultColor: '#E4E0E1',    
  tabsColor: '#493628',       
  splashColor: '#E4E0E1',
  settingsColor: '#493628', 
} as const;

let navigationBarColorSet = false;
let appStateListener: any = null;

const setNavigationBarColor = async (color: string = NAVIGATION_BAR_CONFIG.defaultColor) => {
  if (Platform.OS === 'android') {
    try {
      await SystemUI.setBackgroundColorAsync(color);
      navigationBarColorSet = true;
      return true;
    } catch (error) {
      console.warn('Could not set navigation bar color:', error);
      return false;
    }
  }
  return true; 
};

export const initializeNavigationBar = async () => {
  if (Platform.OS !== 'android') return;

  await setNavigationBarColor();
  
  if (!appStateListener) {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && navigationBarColorSet) {
        setNavigationBarColor();
      }
    };
    
    appStateListener = AppState.addEventListener('change', handleAppStateChange);
  }
};

export const forceSetNavigationBarColor = async (color?: string) => {
  return await setNavigationBarColor(color);
};

export const setNavigationBarForScreen = async (screenType: 'default' | 'splash' | 'modal' | 'tabs' | 'settings' = 'default') => {
  const colorMap = {
    default: NAVIGATION_BAR_CONFIG.defaultColor,
    splash: NAVIGATION_BAR_CONFIG.splashColor,
    modal: NAVIGATION_BAR_CONFIG.defaultColor,
    tabs: NAVIGATION_BAR_CONFIG.tabsColor,
    settings: NAVIGATION_BAR_CONFIG.defaultColor,
  };
  
  return await setNavigationBarColor(colorMap[screenType]);
};

export const cleanupNavigationBar = () => {
  if (appStateListener) {
    appStateListener.remove();
    appStateListener = null;
  }
};