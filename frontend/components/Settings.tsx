import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [alertVisible, setAlertVisible] = useState(false); // For "Unfinished functionality"
  const translateX = useState(new Animated.Value(-Dimensions.get('window').width * 0.65))[0];
  const router = useRouter();

  const toggleSection = (section: string) => {
    setExpandedSections((prevSections) =>
      prevSections.includes(section)
        ? prevSections.filter((s) => s !== section)
        : [...prevSections, section]
    );
  };

  const handleMenuClick = () => {
    setAlertVisible(true);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  const handleOpen = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(translateX, {
      toValue: -Dimensions.get('window').width * 0.65,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleLogout = () => {
    router.replace('/login'); // Ensure the user cannot navigate back to the profile page
  };
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onShow={handleOpen}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContainer, { transform: [{ translateX }] }]}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            {/* Token Usage Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('token-usage')}
            >
              <Text style={styles.sectionHeaderText}>Token Usage</Text>
            </TouchableOpacity>
            {expandedSections.includes('token-usage') && (
              <View style={styles.sectionContent}>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>View Token History</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Transfer Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Purchase Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Redeem Tokens</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Security and Account Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('security-account')}
            >
              <Text style={styles.sectionHeaderText}>Security and Account</Text>
            </TouchableOpacity>
            {expandedSections.includes('security-account') && (
              <View style={styles.sectionContent}>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Password Management</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Two-Factor Authentication</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Account Security</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Wallet Status</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Profile Settings Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('profile-settings')}
            >
              <Text style={styles.sectionHeaderText}>Profile Settings</Text>
            </TouchableOpacity>
            {expandedSections.includes('profile-settings') && (
              <View style={styles.sectionContent}>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Update Profile Picture</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Edit Profile Information</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Manage Pets</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Preferences Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('preferences')}
            >
              <Text style={styles.sectionHeaderText}>Preferences</Text>
            </TouchableOpacity>
            {expandedSections.includes('preferences') && (
              <View style={styles.sectionContent}>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Notification Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Language Selection</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Theme</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Support Section */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('support')}
            >
              <Text style={styles.sectionHeaderText}>Support</Text>
            </TouchableOpacity>
            {expandedSections.includes('support') && (
              <View style={styles.sectionContent}>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Help Center</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Contact Support</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenuClick}>
                  <Text style={styles.menuOptionText}>Feedback and Suggestions</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Log Out Option */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Alert Modal */}
      <Modal
        transparent
        visible={alertVisible}
        animationType="fade"
        onRequestClose={handleCloseAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>Unfinished functionality</Text>
            <TouchableOpacity style={styles.alertButton} onPress={handleCloseAlert}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '65%',
    backgroundColor: '#1f2029',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 10,
  },
  modalContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
    marginBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#797979',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  sectionContent: {
    paddingVertical: 10,
  },
  menuOptionText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#EDEDED',
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6F61',
  },
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#1F2029',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#EDEDED',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default SettingsModal;
