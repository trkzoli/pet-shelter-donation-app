import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const PaymentMethods: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { amount, tokens } = params;

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const paymentMethods = [
    { name: 'PayPal', icon: require('../../assets/images/paypal.png') },
    { name: 'Apple Pay', icon: require('../../assets/images/apple-pay.png') },
    { name: 'Google Pay', icon: require('../../assets/images/google-pay.png') },
  ];

  const handleProceed = () => {
    if (selectedMethod) {
      setModalVisible(true);
    } else {
      alert('Please select a payment method.');
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    router.replace('/profile'); // Redirect to the profile page
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Payment Methods</Text>

        {/* Credit & Debit Card Option */}
        <TouchableOpacity style={styles.cardOption} onPress={() => router.push('../add-card')}>
          <Image source={require('../../assets/images/bankcard.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Credit & Debit Card</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Fast Payment Options */}
        <View style={styles.fastPaymentContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.name}
              style={[
                styles.fastPaymentOption,
                selectedMethod === method.name && styles.activePaymentOption,
              ]}
              onPress={() => setSelectedMethod(method.name)}
            >
              <Image source={method.icon} style={styles.fastPaymentIcon} />
              <View
                style={[
                  styles.radioCircle,
                  selectedMethod === method.name && styles.radioSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedButtonText}>PROCEED</Text>
        </TouchableOpacity>

        {/* Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <Text style={styles.modalText}>
                You are about to pay <Text style={styles.boldText}>${amount}</Text> using{' '}
                <Text style={styles.boldText}>{selectedMethod}</Text>. You will receive{' '}
                <Text style={styles.boldText}>{tokens} PTK</Text>.
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.okButton} onPress={handleModalConfirm}>
                  <Text style={styles.okButtonText}>Ok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
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
    marginBottom: 30,
    color: '#1F2029',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  arrow: {
    fontSize: 20,
    color: '#797979',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#797979',
  },
  orText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginHorizontal: 10,
  },
  fastPaymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  fastPaymentOption: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 10,
    padding: 15,
    width: 80,
    height: 80,
  },
  fastPaymentIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  activePaymentOption: {
    backgroundColor: '#EDEDED',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#797979',
    marginTop: 5,
  },
  radioSelected: {
    backgroundColor: '#1F2029',
  },
  proceedButton: {
    backgroundColor: '#704F38',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
  },
  proceedButtonText: {
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
    backgroundColor: '#1F2029',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  boldText: {
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1F2029',
  },
  okButton: {
    backgroundColor: '#704F38',
    padding: 10,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
});

export default PaymentMethods;
