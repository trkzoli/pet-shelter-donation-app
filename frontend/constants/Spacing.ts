import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
  MASSIVE: 32,
} as const;

export const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  INPUT_HEIGHT: 50,
  BUTTON_HEIGHT: 50,
  BORDER_RADIUS: 15,
  SMALL_BORDER_RADIUS: 8,
  LARGE_BORDER_RADIUS: 20,
  BACK_BUTTON_TOP: 50,
  
  getAvailableWidth: () => width - 40,
  getCardWidth: (percentage: number = 0.9) => (width - 40) * percentage,
} as const;