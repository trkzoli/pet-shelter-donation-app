import { initializeStatusBar } from './statusBar';
import { initializeNavigationBar, setNavigationBarForScreen } from './navigationBar';

// all system UI components 
export const initializeSystemUI = async () => {
  initializeStatusBar();
  
  // Initialize navigation bar 
  await initializeNavigationBar();
};

// For auth pages
export const setAuthUI = async () => {
  await setNavigationBarForScreen('default');
};

// For tab pages: 
export const setTabsUI = async () => {
  await setNavigationBarForScreen('tabs'); 

};


export { 
  initializeStatusBar, 
  applyStatusBarConfig,
  APP_STATUS_BAR_CONFIG,
  SPECIAL_STATUS_BAR_CONFIGS 
} from './statusBar';

export { 
  initializeNavigationBar,
  forceSetNavigationBarColor,
  setNavigationBarForScreen,
  NAVIGATION_BAR_CONFIG 
} from './navigationBar';