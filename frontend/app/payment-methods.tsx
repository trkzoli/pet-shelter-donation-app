import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const PaymentMethods: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { amount, tokens } = params; // Retrieve donation details

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = ['Paypal', 'Apple Pay', 'Google Pay'];

  return (
    <ImageBackground
      source={require('../assets/images/bgi.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Payment Methods</Text>

        {/* Credit & Debit Card */}
        <TouchableOpacity style={styles.cardOption}>
          <Text style={styles.cardText}>Credit & Debit Card</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Other Payment Methods */}
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              selectedMethod === method && styles.activePaymentOption,
            ]}
            onPress={() => setSelectedMethod(method)}
          >
            <Text style={styles.paymentText}>{method}</Text>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === method && styles.radioSelected,
              ]}
            />
          </TouchableOpacity>
        ))}

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => {
            if (selectedMethod) {
              alert(`Proceeding with ${selectedMethod}`); // Replace with navigation logic
            } else {
              alert('Please select a payment method.');
            }
          }}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#704F38',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardText: {
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
    backgroundColor: '#704F38',
  },
  orText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#797979',
    marginHorizontal: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#704F38',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#704F38',
    backgroundColor: 'transparent',
  },
  activePaymentOption: {
    backgroundColor: '#EDEDED',
  },
  radioSelected: {
    backgroundColor: '#704F38',
  },
  proceedButton: {
    backgroundColor: '#704F38',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#EDEDED',
  },
});

export default PaymentMethods;
