import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

const DESIGN_CONSTANTS = {
  BORDER_RADIUS: 15,
  CARD_SPACING: 10,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
} as const;

const COLORS = {
  CARD_BACKGROUND: '#FFFFFF',
  PRIMARY_BROWN: '#493628',
  PRIORITY_BORDER: '#FF8C42', 
  BORDER_LIGHT: '#E0E0E0',
} as const;

interface BannerCardProps {
  item: {
    id: string;
    shelterName: string;
    urgentNeed: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    type: 'banner';
    priority?: string;
    priorityColor?: string;
  };
  width: number;
  height: number;
  onPress: () => void;
}

const BannerCard: React.FC<BannerCardProps> = ({ item, width, height, onPress }) => {

  const borderColor = item.priorityColor || COLORS.PRIORITY_BORDER;
  
  return (
    <TouchableOpacity
      style={[
        styles.bannerCard,
        {
          width,
          height,
          borderColor,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`View campaign details for ${item.shelterName}`}
    >
      <View style={styles.cardContent}>
        <Text style={styles.helpText}>
          {item.shelterName} needs your help!
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 2,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BannerCard;