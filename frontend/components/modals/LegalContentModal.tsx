import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TermsOfService, PrivacyPolicy } from '../legal';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  HEADER_HEIGHT: 60,
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
  GRAY_DARK: '#797979',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
} as const;

const FONT_RATIOS = {
  HEADER_TITLE: 0.045,
} as const;

interface LegalContentModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: 'terms' | 'privacy';
}

const LegalContentModal: React.FC<LegalContentModalProps> = ({
  visible,
  onClose,
  contentType,
}) => {
  const { width, height } = useWindowDimensions();
  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  
  const title = contentType === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { height: DESIGN_CONSTANTS.HEADER_HEIGHT }]}>
          <View style={styles.headerLeft} />
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={COLORS.PRIMARY_BROWN} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {contentType === 'terms' ? (
            <TermsOfService standalone={false} />
          ) : (
            <PrivacyPolicy standalone={false} />
          )}
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.CARD_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
});

export default LegalContentModal;