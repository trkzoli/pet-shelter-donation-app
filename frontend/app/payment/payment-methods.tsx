import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PaymentMethods: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { amount, tokens } = params;

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const paymentMethods = [
    { name: 'PayPal', icon: require('../../assets/images/paypal.png') },
    { name: 'Apple Pay', icon: require('../../assets/images/apple-pay.png') },
    { name: 'Google Pay', icon: require('../../assets/images/google-pay.png') },
  ];

  const handleProceed = () => {
    if (selectedMethod) {
      setModalVisible(true);
    } else {
      setAlertVisible(true);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    router.replace('/profile'); // Redirect to the profile page
  };

  return (
    <View style={[styles.background, { width, height }]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Payment Methods</Text>

        {/* Credit & Debit Card Option */}
        <TouchableOpacity style={styles.cardOption} onPress={() => router.push('/payment/add-card')}>
          <Image source={require('../../assets/images/bankcard.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Credit & Debit Card</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={[styles.orText, {fontSize: width * 0.03}]}>OR</Text> 
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
            <View style={[styles.modalContainer, { width: width * 0.8 }]}>
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
        <Modal
          animationType="fade"
          transparent
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertBackground}>
            <View style={[styles.alertContainer, { width: width * 0.8 }]}>
              <Text style={styles.alertText}>Please select a payment method.</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E4E0E1', 
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
    color: '#797979',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#493628',
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
    backgroundColor: '#E4E0E1',
    borderWidth: 1,
    borderColor: '#AB886D',
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
    backgroundColor: '#AB886D',
    borderWidth: 1,
    borderColor: '#AB886D',
  },
  proceedButton: {
    backgroundColor: '#AB886D',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 20,
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
    backgroundColor: '#3F4F44',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#E4E0E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  boldText: {
    fontFamily: 'PoppinsBold',
    color: '#AB886D',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#D6C0B3',
    padding: 10,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#3F4F44',
  },
  okButton: {
    backgroundColor: '#AB886D',
    padding: 10,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#E4E0E1',
  },
  alertBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#3F4F44',
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
    backgroundColor: '#D6C0B3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#3F4F44',
  },
  
});

export default PaymentMethods;
