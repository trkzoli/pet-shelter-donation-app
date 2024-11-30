import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const DonatePage: React.FC = () => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState('0.0');
  const [receiveAmount, setReceiveAmount] = useState('0.0');
  const [payCurrency] = useState('USD');
  const [receiveCurrency] = useState('PTK');
  const [modalVisible, setModalVisible] = useState(false); // State for the modal visibility

  // Conversion rate: $5 = 1 PTK
  const conversionRate = 5;

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    const usdValue = parseFloat(value) || 0;
    const convertedValue = (usdValue / conversionRate).toFixed(4); // Convert USD to PTK
    setReceiveAmount(convertedValue);
  };

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      {/* KeyboardAvoidingView ensures inputs are visible when the keyboard opens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Token Donation</Text>

            {/* Token Info */}
            <View style={styles.tokenInfoContainer}>
              <Image
                source={require('../assets/images/logo1brown.png')}
                style={styles.tokenLogo}
              />
              <Text style={styles.tokenTitle}>PetToken</Text>
              <Text style={styles.tokenSubtitle}>1.0000 PTK (~$5.00)</Text>
            </View>

            {/* Token Information Section */}
            <View style={styles.infoSection}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setModalVisible(true)} // Open the modal
              >
                <Text style={styles.infoText}>Token Donation Information</Text>
                <Text style={styles.infoIcon}>ℹ️</Text>
              </TouchableOpacity>
            </View>

            {/* Swap Section */}
            <View style={styles.swapContainer}>
              <Text style={styles.swapTitle}>Swap</Text>

              {/* Input: Pay */}
              <View style={styles.swapRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={payAmount}
                  onChangeText={handlePayAmountChange}
                  placeholder="0.0"
                  placeholderTextColor="#797979"
                />
                <View style={styles.currencyPicker}>
                  <Text style={styles.currencyText}>{payCurrency}</Text>
                </View>
              </View>

              {/* Swap Icon */}
              <Text style={styles.swapIcon}>⇅</Text>

              {/* Input: Receive */}
              <View style={styles.swapRow}>
                <TextInput
                  style={styles.input}
                  value={receiveAmount}
                  editable={false} // PTK amount is calculated automatically
                />
                <View style={styles.currencyPicker}>
                  <Text style={styles.currencyText}>{receiveCurrency}</Text>
                </View>
              </View>
            </View>

            {/* Donate Button */}
            <TouchableOpacity  style={styles.donateButton}
                onPress={() => router.push(`/payment-methods?amount=${payAmount}&tokens=${receiveAmount}`)}
            >
              <Text style={styles.donateButtonText}>DONATE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for Token Information */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                The token donation system allows you to support a cause or organization using
                digital currency. When you donate, your funds are converted into PetTokens, which
                support the adoption program or shelter. The value of each PetToken aligns with
                traditional currencies, so each token represents a specific amount of money. These
                tokens remain on the blockchain, ensuring transparency and security for every
                donation.
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    color: '#1F2029',
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    marginTop: 50,
    color: '#1F2029',
  },
  tokenInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  tokenLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  tokenTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  tokenSubtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#797979',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  infoIcon: {
    fontSize: 16,
    color: '#797979',
  },
  swapContainer: {
    borderColor: '#797979',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  swapTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 20,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    height: 50,
  },
  currencyPicker: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#EDEDED',
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  swapIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 15,
    color: '#797979',
  },
  donateButton: {
    backgroundColor: '#704F38',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  donateButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: '#704F38',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#704F38',
  },
});

export default DonatePage;
