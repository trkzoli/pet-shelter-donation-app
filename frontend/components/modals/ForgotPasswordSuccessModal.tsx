import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ForgotPasswordSuccessModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

const MODAL_CONSTANTS = {
  BORDER_RADIUS: 15,
  PADDING: 20,
  BUTTON_HEIGHT: 45,
  BUTTON_BORDER_RADIUS: 12,
} as const;

const ForgotPasswordSuccessModal: React.FC<ForgotPasswordSuccessModalProps> = ({
  visible,
  email,
  onClose,
}) => {
  const { width } = useWindowDimensions();
  const modalWidth = width * 0.9;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);


  const handleOverlayPress = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent 
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, { width: modalWidth }]}>
        
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#51CF66" />
              </View>


              <Text style={styles.successTitle}>Reset Link Sent!</Text>

              <Text style={styles.successMessage}>
                We've sent a password reset link to {'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Next steps:</Text>
                <Text style={styles.instructionText}>
                  1. Check your email inbox{'\n'}
                  2. Click the reset link{'\n'}
                  3. Create your new password{'\n'}
                  4. The link expires in 15 minutes
                </Text>
              </View>


              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close password reset confirmation"
              >
                <Text style={styles.closeButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#E4E0E1',
    borderRadius: MODAL_CONSTANTS.BORDER_RADIUS,
    paddingVertical: MODAL_CONSTANTS.PADDING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: MODAL_CONSTANTS.PADDING,
  },
  emailHighlight: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  instructionsContainer: {
    backgroundColor: '#D6C0B3',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    marginHorizontal: MODAL_CONSTANTS.PADDING,
  },
  instructionsTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    lineHeight: 20,
  },
  closeButton: {
    height: MODAL_CONSTANTS.BUTTON_HEIGHT,
    backgroundColor: '#51CF66',
    borderRadius: MODAL_CONSTANTS.BUTTON_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: MODAL_CONSTANTS.PADDING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
});

export default ForgotPasswordSuccessModal;