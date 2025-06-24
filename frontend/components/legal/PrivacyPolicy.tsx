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


interface PrivacyPolicyProps {
  standalone?: boolean; 
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ standalone = false }) => {
  const { width } = useWindowDimensions();
  
  const titleFontSize = width * FONT_RATIOS.TITLE;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const smallTextFontSize = width * FONT_RATIOS.SMALL_TEXT;
  
  const content = (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: titleFontSize }]}>
        Privacy Policy
      </Text>
      
      <Text style={[styles.lastUpdated, { fontSize: smallTextFontSize }]}>
        Last updated: June 13, 2025
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        1. Information We Collect
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We collect information you provide directly to us, such as when you:
        {'\n'}• Create an account or profile
        {'\n'}• Make donations or adoption requests
        {'\n'}• Contact us for support
        {'\n'}• Participate in surveys or promotions
        
        {'\n\n'}This may include your name, email address, phone number, payment information, and profile details.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        2. How We Use Your Information
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We use your information to:
        {'\n'}• Provide and maintain our services
        {'\n'}• Process donations and adoption requests
        {'\n'}• Send you updates about pets you support
        {'\n'}• Communicate with you about your account
        {'\n'}• Improve our services and develop new features
        {'\n'}• Comply with legal obligations
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        3. Information Sharing
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We may share your information with:
        {'\n'}• Animal shelters when you make donations or adoption requests
        {'\n'}• Payment processors (Stripe) to handle transactions
        {'\n'}• Service providers who assist with app operations
        {'\n'}• Legal authorities when required by law
        
        {'\n\n'}We do not sell your personal information to third parties.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        4. Data Security
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. 
        However, no internet transmission is completely secure, and we cannot guarantee absolute security.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        5. Data Retention
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We retain your information for as long as your account is active or as needed to provide services. 
        We may also retain certain information as required by law or for legitimate business purposes.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        6. Your Privacy Rights
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Depending on your location, you may have the right to:
        {'\n'}• Access the personal information we have about you
        {'\n'}• Request correction of inaccurate information
        {'\n'}• Request deletion of your information
        {'\n'}• Object to certain processing of your information
        {'\n'}• Request data portability
        
        {'\n\n'}To exercise these rights, please contact us using the information provided below.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        7. Cookies and Analytics
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. 
        You can control cookie settings through your device preferences.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        8. Children's Privacy
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Our service is not intended for children under 16. We do not knowingly collect personal information from children under 16. 
        If we become aware that we have collected such information, we will take steps to delete it.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        9. International Data Transfers
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        Your information may be transferred to and processed in countries other than your own. 
        We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        10. Changes to This Policy
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
      </Text>
      
      <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
        11. Contact Us
      </Text>
      <Text style={[styles.bodyText, { fontSize: bodyTextFontSize }]}>
        If you have any questions about this Privacy Policy, please contact us at:
        {'\n\n'}Email: privacy@pawnerapp.com
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

export { PrivacyPolicy };