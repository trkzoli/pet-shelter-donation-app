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
  CARD_BORDER_RADIUS: 15,
  BUTTON_BORDER_RADIUS: 20,
  CARD_IMAGE_HEIGHT: 120,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
} as const;

const COLORS = {
  CARD_BACKGROUND: '#FFFFFF',
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  GRAY_DARK: '#797979',
  BACKGROUND_LIGHT: '#E4E0E1',
} as const;

interface ShelterPetCardProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    type: string;
    donations: number;
    donorCount: number;
    image: any;
    // canEdit: boolean; 
    // publishedAt: string;
  };
  onPress: (pet: any) => void;
  cardTitleFontSize: number;
  cardSubtitleFontSize: number;
  cardBodyFontSize: number;
  buttonTextFontSize: number;
}

const ShelterPetCard: React.FC<ShelterPetCardProps> = ({
  pet,
  onPress,
  cardTitleFontSize,
  cardSubtitleFontSize,
  cardBodyFontSize,
  buttonTextFontSize,
}) => {
  return (
    <View style={styles.petCard}>

      <Image 
        source={pet.image} 
        style={styles.petImage}
      />
      
      <View style={styles.petCardContent}>
        <Text style={[styles.petName, { fontSize: cardTitleFontSize }]} numberOfLines={1}>
          {pet.name}
        </Text>
        <Text style={[styles.petBreed, { fontSize: cardSubtitleFontSize }]} numberOfLines={1}>
          {pet.breed}
        </Text>
        
        
        
        {/* status indicator
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: pet.canEdit ? COLORS.SUCCESS_GREEN : COLORS.LIGHT_BROWN }
          ]} />
          <Text style={[styles.statusText, { fontSize: cardBodyFontSize }]}>
            {pet.canEdit ? 'Can Edit (< 24h)' : 'Published (24h+)'}
          </Text>
        </View>
        */}
        
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => onPress(pet)}
          activeOpacity={0.8}
        >
          <Text style={[styles.manageButtonText, { fontSize: buttonTextFontSize }]}>
            Manage Pet
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  petCard: {
    flexDirection: 'row', 
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.CARD_BORDER_RADIUS,
    marginBottom: SPACING.MEDIUM,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  petImage: {
    width: 120, 
    height: '100%', 
    resizeMode: 'cover',
  },
  petCardContent: {
    padding: SPACING.MEDIUM,
    flex: 1,
    justifyContent: 'space-between',
  },
  petName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: 2,
  },
  petBreed: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.SMALL,
  },
  donationText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.LIGHT_BROWN,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 18,
  },
 
  /*
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    fontSize: 12,
  },
  */
  
  manageButton: {
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BUTTON_BORDER_RADIUS,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  manageButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.BACKGROUND_LIGHT,
    textAlign: 'center',
  },
});

export default ShelterPetCard;