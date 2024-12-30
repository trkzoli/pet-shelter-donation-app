import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const router = useRouter();

  const toggleSection = (section: string) => {
    setExpandedSections((prevSections) =>
      prevSections.includes(section)
        ? prevSections.filter((s) => s !== section)
        : [...prevSections, section]
    );
  };


  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
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
                    <TouchableOpacity onPress={() => navigateTo('/settings/token-history')}>
                    <Text style={styles.menuOptionText}>View Token History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/transfer-tokens')}>
                    <Text style={styles.menuOptionText}>Transfer Tokens</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/purchase-tokens')}>
                    <Text style={styles.menuOptionText}>Purchase Tokens</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/redeem-tokens')}>
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
                    <TouchableOpacity onPress={() => navigateTo('/settings/password-management')}>
                    <Text style={styles.menuOptionText}>Password Management</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/two-factor-auth')}>
                    <Text style={styles.menuOptionText}>Two-Factor Authentication</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/account-security')}>
                    <Text style={styles.menuOptionText}>Account Security</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/wallet-status')}>
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
                    <TouchableOpacity onPress={() => navigateTo('/settings/update-profile-picture')}>
                    <Text style={styles.menuOptionText}>Update Profile Picture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/edit-profile-info')}>
                    <Text style={styles.menuOptionText}>Edit Profile Information</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/manage-pets')}>
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
                    <TouchableOpacity onPress={() => navigateTo('/settings/notification-settings')}>
                    <Text style={styles.menuOptionText}>Notification Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/language-selection')}>
                    <Text style={styles.menuOptionText}>Language Selection</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/theme')}>
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
                    <TouchableOpacity onPress={() => navigateTo('/settings/help-center')}>
                    <Text style={styles.menuOptionText}>Help Center</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/contact-support')}>
                    <Text style={styles.menuOptionText}>Contact Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo('/settings/feedback')}>
                    <Text style={styles.menuOptionText}>Feedback and Suggestions</Text>
                    </TouchableOpacity>
                </View>
                )}

                {/* Log Out Option */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => navigateTo('/logout')}>
                <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
            </View>
            </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '70%',
    marginTop: '10%',
    marginBottom: '10%',
    backgroundColor: '#1f2029',
    borderRadius: 15,
    padding: 20,
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
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
});

export default SettingsModal;
