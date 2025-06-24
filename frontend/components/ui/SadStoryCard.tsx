
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

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  ERROR_RED: '#FF6B6B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
};

// Sad story data 
interface SadStory {
  id: string;
  type: 'deceased' | 'shelter_error';
  originalPetId: string;
  petName: string;
  petImage: any;
  incidentDate: string; 
  shelterName: string;
  userContribution: number;
  message: string;
  canDismiss: boolean;

  refundAmount?: number;
  shelterWarning?: boolean; 
}

interface SadStoryCardProps {
  story: SadStory;
  onDismiss: (storyId: string) => void;
  cardWidth: number;
  cardHeight: number;
}

const SadStoryCard: React.FC<SadStoryCardProps> = ({
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

  const getMessage = () => {
    switch (story.type) {
      case 'deceased':
        return `We're deeply sorry to share that ${story.petName} has crossed the rainbow bridge. Your support made their final days comfortable and filled with love.`;
      case 'shelter_error':
        return `We apologize - there was an error with ${story.petName}'s listing. The shelter has been notified and your donation will be refunded.`;
      default:
        return story.message;
    }
  };

  return (
    <View style={[
      styles.sadCard,
      {
        width: cardWidth,
        height: cardHeight,
        backgroundColor: cardStyle.backgroundColor,
        borderColor: cardStyle.borderColor,
      }
    ]}>

      <Image source={story.petImage} style={styles.petImage} />

      <View style={styles.cardContent}>

        <Text style={styles.sadMessage}>
          {getMessage()}
        </Text>

        <Text style={styles.petName}>{story.petName}</Text>

        <View style={styles.incidentDetails}>
          <Text style={styles.incidentDate}>
            {story.type === 'deceased' ? 'Passed away' : 'Removed'} {formatDate(story.incidentDate)}
          </Text>
          <Text style={styles.shelterName}>
            from {story.shelterName}
          </Text>
        </View>

        <View style={styles.contributionSection}>
          <Text style={styles.contributionLabel}>Your Support:</Text>
          <Text style={styles.contributionAmount}>
            {formatCurrency(story.userContribution)}
          </Text>
        </View>

        {story.type === 'deceased' && (
          <View style={styles.memorialSection}>
            <Text style={styles.memorialText}>
              Your kindness helped make {story.petName}'s life better. Thank you for caring.
            </Text>
          </View>
        )}

        {story.type === 'shelter_error' && (
          <View style={styles.refundSection}>
            {story.refundAmount && (
              <View style={styles.refundInfo}>
                <Ionicons name="card-outline" size={16} color={COLORS.PRIMARY_BROWN} />
                <Text style={styles.refundText}>
                  Refund of {formatCurrency(story.refundAmount)} is being processed
                </Text>
              </View>
            )}
            {story.shelterWarning && (
              <Text style={styles.warningText}>
                The shelter has been warned about proper listing procedures.
              </Text>
            )}
          </View>
        )}
      </View>

      {story.canDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss sad story for ${story.petName}`}
        >
          <Ionicons name="close" size={20} color={COLORS.GRAY_DARK} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sadCard: {
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
  sadMessage: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
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
  incidentDetails: {
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  incidentDate: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.LIGHT_BROWN,
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
    color: COLORS.GRAY_DARK,
    marginRight: SPACING.SMALL,
  },
  contributionAmount: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
  },
  memorialSection: {
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  memorialText: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  refundSection: {
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  refundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 8,
    gap: SPACING.SMALL,
  },
  refundText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#2E7D32',
  },
  warningText: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    fontStyle: 'italic',
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

export default SadStoryCard;