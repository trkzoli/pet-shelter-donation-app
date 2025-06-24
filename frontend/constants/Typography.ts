import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const FONT_FAMILIES = {
  PRIMARY: 'PoppinsRegular',
  BOLD: 'PoppinsBold',
  SEMI_BOLD: 'PoppinsSemiBold',
  ITALIC: 'PoppinsItalic',
  DECORATIVE: 'Pacifico',
} as const;

export const FONT_SIZES = {
  // Responsive font sizes
  HEADING_LARGE: width * 0.08,
  HEADING_MEDIUM: width * 0.06,
  HEADING_SMALL: width * 0.045,
  BODY_LARGE: width * 0.04,
  BODY_MEDIUM: width * 0.035,
  BODY_SMALL: width * 0.032,
  CAPTION: width * 0.028,
} as const;

export const getResponsiveFontSize = (multiplier: number) => width * multiplier;