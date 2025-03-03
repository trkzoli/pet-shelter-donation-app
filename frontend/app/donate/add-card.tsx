import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const AddCardPage: React.FC = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSummaryVisible, setPaymentSummaryVisible] = useState(false);

  const handleProceed = () => {
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 16) {
      setErrorMessage('Invalid card number. Must be 13 to 16 digits.');
      setModalVisible(true);
      return;
    }
    if (!nameOnCard) {
      setErrorMessage('Please enter the name on the card.');
      setModalVisible(true);
      return;
    }
    if (!expiryDate || expiryDate.length !== 5 || !expiryDate.includes('/')) {
      setErrorMessage('Invalid expiry date. Format must be MM/YY.');
      setModalVisible(true);
      return;
    }
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      setErrorMessage('Invalid CVV. Must be 3 or 4 digits.');
      setModalVisible(true);
      return;
    }

    setPaymentSummaryVisible(true);
  };

  const handleCardNumberChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, ''); 
    setCardNumber(cleanedText);
  };

  const handleExpiryDateChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, ''); 
    if (cleanedText.length <= 2) {
      setExpiryDate(cleanedText);
    } else if (cleanedText.length <= 4) {
      setExpiryDate(`${cleanedText.substring(0, 2)}/${cleanedText.substring(2)}`);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= 4) setCvv(cleanedText);
  };

  const finalizePayment = () => {
    router.replace('/profile');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Add Card</Text>

          {/* Card Image */}
          <View style={styles.cardContainer}>
            <Image
              source={require('../../assets/images/ccard.png')}
              style={styles.cardImage}
            />
          </View>

          {/* Payment Information Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor="#797979"
              keyboardType="numeric"
              maxLength={16}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Name on Card"
              placeholderTextColor="#797979"
              value={nameOnCard}
              onChangeText={setNameOnCard}
            />
            <View style={styles.doubleInputContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                placeholderTextColor="#797979"
                keyboardType="numeric"
                maxLength={5}
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                placeholderTextColor="#797979"
                keyboardType="numeric"
                maxLength={4}
                value={cvv}
                onChangeText={handleCvvChange}
              />
            </View>
          </View>

          {/* Save Card Option */}
          <View style={styles.saveOption}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSaveCard(!saveCard)}
            >
              <View style={[styles.checkboxMark, saveCard && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.saveText}>Save this card</Text>
          </View>

          {/* Proceed Button */}
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>PROCEED</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalText, styles.errorText]}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Summary Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={paymentSummaryVisible}
        onRequestClose={() => setPaymentSummaryVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>
              You will pay <Text style={styles.boldText}>$50</Text> and receive{' '}
              <Text style={styles.boldText}>10 PetTokens (PTK)</Text>.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPaymentSummaryVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okButton} onPress={finalizePayment}>
                <Text style={styles.okButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 70,
    color: '#1F2029',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardImage: {
    height: 200,
    width: 250,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#704F38',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
    marginBottom: 10,
    backgroundColor: '#EDEDED',
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  saveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -15,
    
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#797979',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    
  },
  checkboxMark: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  checkboxChecked: {
    backgroundColor: '#704F38',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
  },
  proceedButton: {
    backgroundColor: '#704F38',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
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
    color: '#EDEDED',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#EDEDED',
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
    backgroundColor: '#EDEDED',
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
    color: '#EDEDED',
  },
  errorText: {
    color: '#FF6F61',
  },
});

export default AddCardPage;
