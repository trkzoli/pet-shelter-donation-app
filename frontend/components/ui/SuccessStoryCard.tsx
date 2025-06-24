import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DESIGN_CONSTANTS = {
  BORDER_RADIUS: 20,
  CARD_SPACING: 16,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

interface SuccessStory {
  id: string;
  type: 'adopter_success' | 'supporter_success';
  originalPetId: string;
  petName: string;
  petImage: any;
  adoptionDate: string;
  shelterName: string;
  userContribution: number;
  pawPointsEarned: number; 
  message: string;
  canDismiss: boolean;
}

interface SuccessStoryCardProps {
  story: SuccessStory;
  onDismiss: (storyId: string) => void;
  cardWidth: number;
  cardHeight: number;
}

const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({
  story,
  onDismiss,
  cardWidth,
  cardHeight,
}) => {

  const handleDismiss = useCallback(() => {
    onDismiss(story.id);
  }, [story.id, onDismiss]);


  const getCardStyle = () => {
    return {
      backgroundColor: '#D6C0B3', 
      borderColor: '#AB886D',
      iconColor: '#493628', 
      iconName: 'home' as const, 
    };
  };

  const cardStyle = getCardStyle();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[
      styles.successCard,
      {
        width: cardWidth,
        height: cardHeight,
        backgroundColor: cardStyle.backgroundColor,
        borderColor: cardStyle.borderColor,
      }
    ]}>

      <Image source={story.petImage} style={styles.petImage} />

      <View style={styles.cardContent}>

        <Text style={styles.successMessage}>
          {story.message}
        </Text>

        <Text style={styles.petName}>{story.petName}</Text>

        <View style={styles.adoptionDetails}>
          <Text style={styles.adoptionDate}>
            Adopted {formatDate(story.adoptionDate)}
          </Text>
          <Text style={styles.shelterName}>
            from {story.shelterName}
          </Text>
        </View>

        {/*ONLY for supporter stories */}
        {story.type === 'supporter_success' && (
          <View style={styles.contributionSection}>
            <Text style={styles.contributionLabel}>Your Support:</Text>
            <Text style={styles.contributionAmount}>
              {formatCurrency(story.userContribution)}
            </Text>
          </View>
        )}


        {story.pawPointsEarned > 0 && (
          <View style={styles.rewardSection}>
            <View style={styles.pawPointsReward}>
              <Image 
                source={require('../../assets/images/LogoWhite.png')} 
                style={styles.pawPointsIcon}
              />
              <Text style={styles.rewardText}>
                +{story.pawPointsEarned} PawPoint{story.pawPointsEarned > 1 ? 's' : ''} earned!
              </Text>
            </View>
            <Text style={styles.rewardSubtext}>
              You helped save a life! 
            </Text>
          </View>
        )}

      </View>

      {story.canDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss success story for ${story.petName}`}
        >
          <Ionicons name="close" size={20} color="#797979" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  successCard: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    borderWidth: 2,
    padding: SPACING.LARGE,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successIcon: {
    position: 'absolute',
    top: SPACING.MEDIUM,
    right: SPACING.MEDIUM,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: SPACING.MEDIUM,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
  },
  successMessage: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
    lineHeight: 20,
  },
  petName: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  adoptionDetails: {
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  adoptionDate: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#AB886D',
  },
  contributionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  contributionLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginRight: SPACING.SMALL,
  },
  contributionAmount: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
  },
  rewardSection: {
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  pawPointsReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#493628',
    borderRadius: 12,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  pawPointsIcon: {
    width: 16,
    height: 16,
    tintColor: '#AB886D',
    marginRight: SPACING.SMALL,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  rewardSubtext: {
    fontSize: 11,
    fontFamily: 'PoppinsItalic',
    color: '#493628',
    textAlign: 'center',
  },
  celebrationSection: {
    alignItems: 'center',
    marginTop: SPACING.SMALL,
  },
  celebrationText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
  dismissButton: {
    position: 'absolute',
    top: SPACING.SMALL,
    left: SPACING.SMALL,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
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
});

export default SuccessStoryCard;