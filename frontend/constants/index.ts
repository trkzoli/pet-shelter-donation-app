export * from './Colors';
export * from './Typography';
export * from './Spacing';
export * from './Shadows';

import { COLORS } from './Colors';
import { FONT_FAMILIES, FONT_SIZES } from './Typography';
import { DESIGN_CONSTANTS, SPACING } from './Spacing';
import { SHADOWS } from './Shadows';

export const COMMON_STYLES = {
  // Standard card style
  card: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    ...SHADOWS.MEDIUM,
  },
  
  // Standard button style
  primaryButton: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: COLORS.PRIMARY_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...SHADOWS.MEDIUM,
  },
  
  // Standard input style
  textInput: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: FONT_FAMILIES.PRIMARY,
    color: COLORS.PRIMARY_BROWN,
    borderBottomWidth: 1,
  },
} as const;

export const API_BASE_URL = 'http://192.168.1.104:3000'; 