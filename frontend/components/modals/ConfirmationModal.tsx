import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 20,
  BUTTON_HEIGHT: 50,
  MODAL_WIDTH_RATIO: 0.85, 
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
} as const;

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  ERROR_RED: '#FF6B6B',
  WARNING_YELLOW: '#FFD43B',
  SUCCESS_GREEN: '#51CF66',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
} as const;

const FONT_RATIOS = {
  TITLE: 0.045,
  BODY_TEXT: 0.04,
  BUTTON_TEXT: 0.038,
} as const;

type ConfirmationType = 'delete' | 'warning' | 'change' | 'unsaved';

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: ConfirmationType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  type,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
}) => {
  const { width } = useWindowDimensions();

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;
  
  const modalWidth = width * DESIGN_CONSTANTS.MODAL_WIDTH_RATIO;

  const getConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: 'trash-outline' as const,
          iconColor: COLORS.ERROR_RED,
          iconBgColor: '#FFF5F5',
          iconBorderColor: '#FFE5E5',
          confirmButtonColor: COLORS.ERROR_RED,
          defaultTitle: 'Remove Photo',
          defaultMessage: 'Are you sure you want to remove this photo?',
          defaultConfirmText: 'Remove',
        };
      case 'change':
        return {
          icon: 'swap-horizontal-outline' as const,
          iconColor: COLORS.PRIMARY_BROWN,
          iconBgColor: '#F5F2F0',
          iconBorderColor: '#E8E0DD',
          confirmButtonColor: COLORS.PRIMARY_BROWN,
          defaultTitle: 'Change Main Photo',
          defaultMessage: 'Do you want to select a new main photo?',
          defaultConfirmText: 'Change Photo',
        };
      case 'unsaved':
        return {
          icon: 'alert-circle-outline' as const,
          iconColor: COLORS.WARNING_YELLOW,
          iconBgColor: '#FFFBF0',
          iconBorderColor: '#FFF4E0',
          confirmButtonColor: COLORS.ERROR_RED,
          defaultTitle: 'Unsaved Changes',
          defaultMessage: 'You have unsaved changes. Are you sure you want to close?',
          defaultConfirmText: 'Close',
        };
      case 'warning':
      default:
        return {
          icon: 'warning-outline' as const,
          iconColor: COLORS.WARNING_YELLOW,
          iconBgColor: '#FFFBF0',
          iconBorderColor: '#FFF4E0',
          confirmButtonColor: COLORS.WARNING_YELLOW,
          defaultTitle: 'Confirm Action',
          defaultMessage: 'Are you sure you want to continue?',
          defaultConfirmText: 'Continue',
        };
    }
  };

  const config = getConfig();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onCancel}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.modalContent, { width: modalWidth }]}>
                <View style={styles.iconContainer}>
                  <View style={[
                    styles.iconCircle,
                    { 
                      backgroundColor: config.iconBgColor,
                      borderColor: config.iconBorderColor 
                    }
                  ]}>
                    <Ionicons 
                      name={config.icon} 
                      size={32} 
                      color={config.iconColor} 
                    />
                  </View>
                </View>
                
                <Text style={[styles.title, { fontSize: titleFontSize }]}>
                  {title || config.defaultTitle}
                </Text>
                
                <Text style={[styles.message, { fontSize: bodyTextFontSize }]}>
                  {message || config.defaultMessage}
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { height: DESIGN_CONSTANTS.BUTTON_HEIGHT }
                    ]}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.cancelButtonText, { fontSize: buttonTextFontSize }]}>
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      { 
                        height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
                        backgroundColor: config.confirmButtonColor 
                      }
                    ]}
                    onPress={onConfirm}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmButtonText, { fontSize: buttonTextFontSize }]}>
                      {confirmText || config.defaultConfirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.HUGE,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  
  iconContainer: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  
  title: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  message: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.HUGE,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.MEDIUM,
  },
  button: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
  },
  cancelButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.GRAY_DARK,
  },
  confirmButton: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  confirmButtonText: {
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
});

export default ConfirmationModal;