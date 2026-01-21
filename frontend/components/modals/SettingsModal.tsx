import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Platform,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpandableSection } from '../ui';
import { LegalContentModal, LogoutModal } from './';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  userData?: {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    housingType?: string;
    ownershipStatus?: string;
    currentPets?: string;
    experienceLevel?: string;
    occupation?: string;
    workSchedule?: string;
    whyAdopt?: string;
  } | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, userData }) => {
  const translateX = useState(new Animated.Value(-Dimensions.get('window').width * 0.75))[0];
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const router = useRouter();

  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContentType, setLegalContentType] = useState<'terms' | 'privacy'>('terms');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleOpen = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -Dimensions.get('window').width * 0.75,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      onClose();
    });
  };

  const handleEditProfile = () => {
    handleClose();
    router.push('/profile-donor/edit');
  };

  const handleSupport = () => {
    const email = 'support@pawnerapp.com';
    const subject = 'Support Request';
    const body = `Hello Pawner Support,\n\nUser: ${userData.name}\nEmail: ${userData.email}\n\nI need help with:\n\n`;
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleShowTerms = useCallback(() => {
    setLegalContentType('terms');
    setLegalModalVisible(true);
  }, []);
  
  const handleShowPrivacy = useCallback(() => {
    setLegalContentType('privacy');
    setLegalModalVisible(true);
  }, []);

  const handleLogout = useCallback(() => {
      setLogoutModalVisible(true);
    }, []);
  const handleConfirmLogout = useCallback(async () => {
    setLogoutModalVisible(false);
    onClose();
    
    try {
      
      await AsyncStorage.clear();
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('LOGOUT ERROR: Failed to clear storage:', error);
      router.replace('/(auth)/welcome');
    }
  }, [onClose, router]);

  const handleSectionToggle = useCallback((settingsId: string, sectionKey: string, isExpanded: boolean) => {
    console.log(`Settings section ${sectionKey} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
  }, []);

  const profileCompletion = useMemo(() => {
    if (!userData) return 0;
    const requiredFields = [
      'name',
      'email',
      'phone',
      'street',
      'city',
      'state',
      'zip',
      'country',
      'housingType',
      'ownershipStatus',
      'currentPets',
      'experienceLevel',
      'occupation',
      'workSchedule',
      'whyAdopt',
    ];

    const registrationOnlyFields = requiredFields.filter(
      (field) => !['name', 'email', 'phone'].includes(field)
    );
    const isRegistrationOnly = registrationOnlyFields.every((field) => {
      const value = (userData as any)[field];
      return value === null || value === undefined || value === '';
    });

    const filledRequired = requiredFields.filter((field) => {
      if (isRegistrationOnly && field === 'name') {
        return false;
      }
      const value = (userData as any)[field];
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((filledRequired.length / requiredFields.length) * 100);
  }, [userData]);

  const getProfileStatus = () => {
    if (!userData) {
      return { text: 'Loading...', color: '#797979', icon: 'time' };
    }
    if (profileCompletion >= 90) return { text: 'Complete', color: '#51CF66', icon: 'checkmark-circle' };
    if (profileCompletion >= 50) return { text: 'In Progress', color: '#FFD43B', icon: 'time' };
    return { text: 'Incomplete', color: '#FF6B6B', icon: 'alert-circle' };
  };

  const profileStatus = getProfileStatus();

  useEffect(() => {
    if (visible) {
      handleOpen();
    }
  }, [visible]);

  const MenuOption = React.memo<{
    iconName: string;
    title: string;
    onPress: () => void;
    isDestructive?: boolean;
    badge?: string;
  }>(({ iconName, title, onPress, isDestructive = false, badge }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <Ionicons 
        name={iconName as any} 
        size={18} 
        color={isDestructive ? '#FF6B6B' : '#797979'} 
      />
      <Text style={[
        styles.menuOptionText, 
        isDestructive && { color: '#FF6B6B' }
      ]}>
        {title}
      </Text>
      {badge && (
        <View style={styles.requirementBadge}>
          <Text style={styles.requirementBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  ));

  return (
    <>
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.modalContainer, { transform: [{ translateX }] }]}>
       
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#797979" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileSummary}>
              <Text style={styles.profileName}>{userData?.name || 'Loading...'}</Text>
              <Text style={styles.profileEmail}>{userData?.email || ''}</Text>
              <View style={styles.profileStatusContainer}>
                <Ionicons 
                  name={profileStatus.icon as any} 
                  size={16} 
                  color={profileStatus.color} 
                />
                <Text style={[styles.profileStatusText, { color: profileStatus.color }]}>
                  Profile {profileStatus.text} ({profileCompletion}%)
                </Text>
              </View>
            </View>

            <ScrollView 
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <ExpandableSection
                title="Profile"
                sectionKey="profile"
                petId="donor-settings"
                defaultExpanded={false}
                canClose={true}
                onToggle={handleSectionToggle}
                titleFontSize={16}
              >
                <View style={styles.sectionContent}>
                  <MenuOption
                    iconName="create-outline"
                    title="Edit Profile"
                    onPress={handleEditProfile}

                  />
                </View>
              </ExpandableSection>

              <ExpandableSection
                title="Support"
                sectionKey="support"
                petId="donor-settings"
                defaultExpanded={false}
                canClose={true}
                onToggle={handleSectionToggle}
                titleFontSize={16}
              >
                <View style={styles.sectionContent}>
                  <MenuOption
                    iconName="help-circle-outline"
                    title="Contact Support"
                    onPress={handleSupport}
                  />
                  <MenuOption
                    iconName="document-text-outline"
                    title="Terms of Service"
                    onPress={handleShowTerms}
                  />
                  <MenuOption
                    iconName="lock-closed-outline"
                    title="Privacy Policy"
                    onPress={handleShowPrivacy}
                  />
                </View>
              </ExpandableSection>

              <View style={styles.appInfoSection}>
                <Text style={styles.appInfoTitle}>Pawner</Text>
                <Text style={styles.appInfoText}>Version 1.0.0</Text>
                <Text style={styles.appInfoText}>Connecting shelters with loving donors</Text>
              </View>
            
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FF6F61" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
      <LegalContentModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        contentType={legalContentType}
      />
      
      <LogoutModal
        visible={logoutModalVisible}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    width: '75%',
    backgroundColor: '#E4E0E1',
    paddingTop: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#797979',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  closeButton: {
    padding: 4,
  },
  profileSummary: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#797979',
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#AB886D',
    marginBottom: 8,
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileStatusText: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    marginLeft: 6,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionContent: {
    paddingTop: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuOptionText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    flex: 1,
    marginLeft: 12,
  },
  requirementBadge: {
    backgroundColor: '#FF8C42',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requirementBadgeText: {
    fontSize: 10,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
  appInfoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#797979',
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#AB886D',
    marginBottom: 6,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6F61',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6F61',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsModal;