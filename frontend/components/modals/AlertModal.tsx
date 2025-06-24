import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';


interface AlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
}


const MODAL_CONSTANTS = {
  BORDER_RADIUS: 15,
  PADDING: 20,
  BUTTON_HEIGHT: 45,
  BUTTON_BORDER_RADIUS: 12,
} as const;

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = 'OK',
  onClose,
  type = 'error',
}) => {
  const { width } = useWindowDimensions();
  const modalWidth = width * 0.85;

  const getTypeColors = () => {
    switch (type) {
      case 'error':
        return {
          iconColor: '#FF6B6B',
          buttonColor: '#FF6B6B',
          borderColor: '#FF6B6B20',
        };
      case 'success':
        return {
          iconColor: '#51CF66',
          buttonColor: '#51CF66',
          borderColor: '#51CF6620',
        };
      case 'warning':
        return {
          iconColor: '#FFD43B',
          buttonColor: '#FFD43B',
          borderColor: '#FFD43B20',
        };
      case 'info':
        return {
          iconColor: '#74C0FC',
          buttonColor: '#74C0FC',
          borderColor: '#74C0FC20',
        };
      default:
        return {
          iconColor: '#FF6B6B',
          buttonColor: '#FF6B6B',
          borderColor: '#FF6B6B20',
        };
    }
  };

  const colors = getTypeColors();

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View 
          style={[
            styles.modalContainer,
            { 
              width: modalWidth,
              borderColor: colors.borderColor,
            }
          ]}
        >
          

 
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}


          <Text style={styles.message}>{message}</Text>


          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.buttonColor }
            ]}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={buttonText}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: MODAL_CONSTANTS.PADDING,
    alignItems: 'center',
    borderWidth: 1,

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
  iconContainer: {
    marginBottom: 15,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    width: '100%',
    height: MODAL_CONSTANTS.BUTTON_HEIGHT,
    borderRadius: MODAL_CONSTANTS.BUTTON_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
});

export default AlertModal;