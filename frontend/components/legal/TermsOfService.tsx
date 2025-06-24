import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  GRAY_DARK: '#797979',
  BACKGROUND: '#E4E0E1',
} as const;

const SPACING = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
} as const;

const FONT_RATIOS = {
  TITLE: 0.05,
  SECTION_TITLE: 0.042,
  BODY_TEXT: 0.038,
  SMALL_TEXT: 0.034,
} as const;

interface TermsOfServiceProps {
  standalone?: boolean;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ standalone = false }) => {
  const { width } = useWindowDimensions();
  
  const titleFontSize = width * FONT_RATIOS.TITLE;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const smallTextFontSize = width * FONT_RATIOS.SMALL_TEXT;
  
  const content = (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: titleFontSize }]}>
        Terms of Service
      </Text>
      
      <Text style={[styles.lastUpdated, { fontSize: smallTextFontSize }]}>
        Last updated: June 13, 2025
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        1. Acceptance of Terms
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        By accessing and using Pawner ("the App"), you accept and agree to be bound by the terms and provision of this agreement. 
        If you do not agree to abide by the above, please do not use this service.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        2. Description of Service
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Pawner is a platform that connects animal shelters with donors and potential adopters. Our service facilitates:
        {'\n'}• Donations to animal shelters and specific pets
        {'\n'}• Virtual pet support through our PawPoints system
        {'\n'}• Real adoption request processing
        {'\n'}• Transparent tracking of donation impact
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        3. User Accounts and Registration
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        To access certain features of the App, you must register for an account. You agree to:
        {'\n'}• Provide accurate and complete information during registration
        {'\n'}• Maintain the security of your password and identification
        {'\n'}• Notify us immediately of any unauthorized use of your account
        {'\n'}• Be responsible for all activities that occur under your account
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        4. Donations and Payment Processing
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        All donations made through the App are processed securely through Stripe. By making a donation, you agree that:
        {'\n'}• Donations are voluntary and non-refundable except in cases of technical error
        {'\n'}• 85% of your donation goes directly to the selected shelter
        {'\n'}• 15% is retained as a platform fee to support app development and PawPoints fund
        {'\n'}• You will receive PawPoints at a rate of 1 point per $25 donated
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        5. PawPoints System
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        PawPoints are virtual credits earned through donations that can be used for:
        {'\n'}• Qualifying for real pet adoption requests (minimum 5 points required)
        {'\n'}• Reducing adoption fees (1 point = $5 reduction)
        {'\n'}• PawPoints have no cash value and cannot be transferred between accounts
        {'\n'}• Points may expire if account is inactive for more than 2 years
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        6. Adoption Requests
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        The App facilitates adoption requests but does not guarantee adoption. Shelters maintain full discretion over adoption decisions. 
        You understand that:
        {'\n'}• Adoption requests require 5+ PawPoints and 90% profile completion
        {'\n'}• Only one active request per user is allowed
        {'\n'}• Requests can be cancelled within 24 hours
        {'\n'}• The actual adoption process occurs outside the App
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        7. Shelter Verification
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Shelters must undergo verification before accessing full platform features. We reserve the right to:
        {'\n'}• Verify shelter credentials and documentation
        {'\n'}• Suspend or terminate shelter accounts for violations
        {'\n'}• Monitor shelter activities for compliance with animal welfare standards
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        8. Prohibited Uses
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        You may not use the App to:
        {'\n'}• Violate any laws or regulations
        {'\n'}• Harm, abuse, or endanger animal welfare
        {'\n'}• Upload false or misleading information about pets
        {'\n'}• Attempt to circumvent payment processing
        {'\n'}• Interfere with the App's security features
        {'\n'}• Use the service for any commercial purpose not explicitly allowed
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        9. Privacy and Data Protection
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. 
        By using the App, you consent to our data practices as described in the Privacy Policy.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        10. Limitation of Liability
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Pawner provides the platform "as is" without warranties of any kind. We are not liable for:
        {'\n'}• Actions taken by shelters or users outside the App
        {'\n'}• Unsuccessful adoption attempts
        {'\n'}• Technical issues or service interruptions
        {'\n'}• Disputes between users and shelters
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        11. Termination
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, 
        animals, or the App itself.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        12. Changes to Terms
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We reserve the right to modify these terms at any time. We will notify users of significant changes through the App. 
        Continued use of the service after changes constitutes acceptance of the new terms.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        13. Contact Information
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        If you have any questions about these Terms of Service, please contact us at:
        {'\n\n'}Email: legal@pawnerapp.com
        {'\n'}Address: 123 Pet Care Lane, Animal City, AC 12345
        {'\n'}Phone: +1 (555) 123-PAWS
      </Text>
    </View>
  );
  
  if (standalone) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }
  
  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: SPACING.EXTRA_LARGE,
  },
  title: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  lastUpdated: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: SPACING.EXTRA_LARGE * 1.5,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.EXTRA_LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  bodyText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 22,
    marginBottom: SPACING.MEDIUM,
  },
});

export default TermsOfService;