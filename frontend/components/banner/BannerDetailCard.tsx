import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const COLORS = {
  CARD_BACKGROUND: '#FFFFFF',
  PRIMARY_BROWN: '#493628',
  GRAY_DARK: '#797979',
  SUCCESS_GREEN: '#51CF66',
  BACKGROUND: '#E4E0E1',
} as const;


interface BannerDetailCardProps {
  campaign: {
    id: string;
    shelterName: string;
    title: string;
    description: string;
    image?: string | { uri: string } | any; 
    targetAmount: number;
    currentAmount: number;
    purpose?: string;
  };
}

const BannerDetailCard: React.FC<BannerDetailCardProps> = ({ campaign }) => {
  const { width } = useWindowDimensions();
  
      console.log('BANNER DETAIL CARD DEBUG:');
  console.log('campaign.image:', campaign.image);
  console.log('campaign object:', campaign);
  

  const safeCurrentAmount = typeof campaign.currentAmount === 'number' ? campaign.currentAmount : 0;
  const safeTargetAmount = typeof campaign.targetAmount === 'number' ? campaign.targetAmount : 0;
  
      console.log('BANNER AMOUNTS DEBUG:');
  console.log('currentAmount:', campaign.currentAmount, 'type:', typeof campaign.currentAmount);
  console.log('targetAmount:', campaign.targetAmount, 'type:', typeof campaign.targetAmount);
  console.log('safeCurrentAmount:', safeCurrentAmount);
  console.log('safeTargetAmount:', safeTargetAmount);
  
  const imageSource = React.useMemo(() => {
    if (!campaign.image) return null;
    
    if (typeof campaign.image === 'object' && campaign.image.uri) {
      console.log('Using image object:', campaign.image);
      return campaign.image;
    }
    
    if (typeof campaign.image === 'string') {
      const source = { uri: campaign.image };
      console.log('Using string URL, wrapped:', source);
      return source;
    }

          console.log('Invalid image format:', campaign.image);
    return null;
  }, [campaign.image]);
  
  const dynamicFontSize = {
    shelterName: width * 0.05,
    campaignTitle: width * 0.045,
    description: width * 0.035,
    amount: width * 0.04,
    helpInfo: width * 0.032,
  };
  
  const progressPercentage = safeTargetAmount > 0 ? Math.min((safeCurrentAmount / safeTargetAmount) * 100, 100) : 0;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.shelterName, { fontSize: dynamicFontSize.shelterName }]}>
        {campaign.shelterName}
      </Text>
      
      <Text style={[styles.campaignTitle, { fontSize: dynamicFontSize.campaignTitle }]}>
        {campaign.title}
      </Text>
      
      <Text style={[styles.description, { fontSize: dynamicFontSize.description }]}>
        {campaign.description}
      </Text>
      
      {imageSource ? (
        <View style={styles.imageContainer}>
          <Image 
            source={imageSource} 
            style={styles.campaignImage}
            resizeMode="cover"
            onLoad={() => console.log('IMAGE LOADED SUCCESSFULLY:', imageSource)}
            onError={(error) => console.log('IMAGE LOAD ERROR:', error.nativeEvent.error, 'URI:', imageSource)}
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>No image selected</Text>
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.amountRow}>
          <Text style={[styles.currentAmount, { fontSize: dynamicFontSize.amount }]}>
            ${safeCurrentAmount.toLocaleString()}
          </Text>
          <Text style={[styles.targetAmount, { fontSize: dynamicFontSize.amount }]}>
            of ${safeTargetAmount.toLocaleString()} goal
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% funded
          </Text>
        </View>
      </View>

      <View style={styles.helpSection}>
        <Text style={[styles.helpTitle, { fontSize: dynamicFontSize.helpInfo }]}>
          How your donation helps:
        </Text>
        <Text style={[styles.helpDescription, { fontSize: dynamicFontSize.helpInfo }]}>
          Your contribution goes directly to {campaign.shelterName}. 
          Every dollar makes a difference in improving the lives of animals in need.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginVertical: SPACING.MEDIUM,
  },
 
  shelterName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },

  campaignTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 22,
  },

  description: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
    marginBottom: SPACING.LARGE,
  },

  imageContainer: {
    marginBottom: SPACING.LARGE,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    overflow: 'hidden',
  },
  campaignImage: {
    width: '100%',
    height: 200,
  },

  progressSection: {
    marginBottom: SPACING.LARGE,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.SMALL,
  },
  currentAmount: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginRight: SPACING.SMALL,
  },
  targetAmount: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },

  progressBarContainer: {
    marginTop: SPACING.SMALL,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.SMALL,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS_GREEN,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.GRAY_DARK,
    textAlign: 'right',
  },

  helpSection: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginTop: SPACING.SMALL,
  },
  helpTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  helpDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },

  imagePlaceholder: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
});

export default BannerDetailCard;