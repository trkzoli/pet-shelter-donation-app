import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

const DESIGN_CONSTANTS = {
  BORDER_RADIUS: 20,
  CARD_SPACING: 6,
} as const;

const SPACING = {
  SMALL: 8,
} as const;

const COLORS = {
  CARD_BACKGROUND: '#FFFFFF',
  PRIMARY_BROWN: '#493628',
  GRAY_DARK: '#797979',
} as const;

interface DonorPetCardProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    image: any;
    type: string;
  };
  width: number;
  height: number;
  onPress: (petId: string) => void;
  cardTitleFontSize: number;
  cardSubtitleFontSize: number;
}

const DonorPetCard: React.FC<DonorPetCardProps> = ({
  pet,
  width,
  height,
  onPress,
  cardTitleFontSize,
  cardSubtitleFontSize,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { width, height }]}
      onPress={() => onPress(pet.id)}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${pet.name}`}
    >
      <Image 
        source={pet.image} 
        style={styles.cardImage}
      />
      
      <View style={styles.cardInfo}>
        <Text 
          style={[styles.petName, { fontSize: cardTitleFontSize }]} 
          numberOfLines={1}
        >
          {pet.name}
        </Text>
        <Text 
          style={[styles.petBreed, { fontSize: cardSubtitleFontSize }]} 
          numberOfLines={1}
        >
          {pet.breed}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  cardInfo: {
    flex: 1,
    padding: SPACING.SMALL,
    justifyContent: 'center',
  },
  petName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: 2,
  },
  petBreed: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
});

export default DonorPetCard;