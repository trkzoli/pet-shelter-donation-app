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
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('0.0');
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // $5 = 1 PTK
  const conversionRate = 5;

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    const usdValue = parseFloat(value) || 0;
    const convertedValue = (usdValue / conversionRate).toFixed(4); // Convert USD to PTK
    setReceiveAmount(convertedValue);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
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

            {/* Logo and PetToken Information */}
            <View style={styles.tokenInfoContainer}>
              <Image
                source={require('../../assets/images/logo1brown.png')}
                style={styles.tokenLogo}
              />
              <Text style={styles.tokenTitle}>PetToken</Text>
              <Text style={styles.tokenSubtitle}>1.0000 PTK (~$5.00)</Text>
            </View>

            {/* How It Works Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>How it works</Text>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                <Image
                  source={require('../../assets/images/info.png')}
                  style={styles.infoIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Swap Section */}
            <View style={styles.swapContainer}>
              <Text style={styles.swapTitle}>Amount to donate:</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={styles.largeInput}
                  keyboardType="numeric"
                  value={payAmount}
                  onChangeText={handlePayAmountChange}
                  placeholder="Minimum 0.5$"
                  placeholderTextColor="#797979"
                  maxLength={12}
                />
                {payAmount && <Text style={styles.currencyText}>USD ($)</Text>}
              </View>
              <Text style={styles.smallText}>You will get:</Text>
              <Text style={styles.tokenAmount}>{receiveAmount} PTK</Text>
            </View>

            {/* Donate Button */}
            <TouchableOpacity
              style={styles.donateButton}
              onPress={() => {
                const usdValue = parseFloat(payAmount);
                if (usdValue < 0.5 || isNaN(usdValue)) {
                  setAlertVisible(true); // Show custom alert modal
                  return;
                }
                router.push(`../payment-methods?amount=${payAmount}&tokens=${receiveAmount}`);
              }}
            >
              <Text style={styles.donateButtonText}>PROCEED</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for Information */}
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

        {/* Custom Alert Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertBackground}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>Minimum donation amount is $0.5.</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.alertButtonText}>OK</Text>
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
  tokenInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  tokenLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginTop: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    width: 30,
    height: 30,
    color: '#1F2029',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  swapContainer: {
    borderColor: '#797979',
    backgroundColor: '#1F2029',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  swapTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#797979',
  },
  largeInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
    paddingLeft: 10,
  },
  currencyText: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    paddingRight: 10,
  },
  smallText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginBottom: 10,
    textAlign: 'center',
  },
  tokenAmount: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  donateButton: {
    backgroundColor: '#704F38',
    borderRadius: 50,
    width: '100%',
    height: 60,
    marginVertical: 20,
    bottom: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#1f2029',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#EDEDED',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  alertBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.8,
    backgroundColor: '#1F2029',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FF6F61', 
    textAlign: 'center',
    marginBottom: 15,
  },
  alertButton: {
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
});

export default DonatePage;
