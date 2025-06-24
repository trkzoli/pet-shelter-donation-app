import React, { createContext, useContext, ReactNode } from 'react';
import { useFonts } from 'expo-font';

export const APP_FONTS = {
  Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
  PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
  PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  PoppinsSemiBoldItalic: require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
  PoppinsItalic: require('../assets/fonts/Poppins-Italic.ttf'),
} as const;

interface FontContextType {
  fontsLoaded: boolean;
  fontError: Error | null;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);

  return (
    <FontContext.Provider value={{ fontsLoaded, fontError }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFontContext = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFontContext must be used within a FontProvider');
  }
  return context;
};

export const useAppFonts = () => {
  const { fontsLoaded, fontError } = useFontContext();
  
  if (fontError) {
    console.warn('Font loading failed:', fontError);
  }
  
  return fontsLoaded || fontError !== null;
};