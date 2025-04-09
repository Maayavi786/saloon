
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

export default function PaymentScreen({ route, navigation }) {
  const { booking } = route.params;
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isArabic = language === 'ar';

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          cardNumber,
          expiryDate,
          cvv,
        }),
      });

      if (response.ok) {
        navigation.navigate('BookingConfirmation', { booking });
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      showToast({
        title: isArabic ? 'فشل الدفع' : 'Payment Failed',
        type: 'error',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.paymentCard}>
        <Text style={styles.title}>
          {isArabic ? 'تفاصيل الدفع' : 'Payment Details'}
        </Text>
        <Input
          placeholder={isArabic ? 'رقم البطاقة' : 'Card Number'}
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
        />
        <Input
          placeholder={isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
          value={expiryDate}
          onChangeText={setExpiryDate}
        />
        <Input
          placeholder="CVV"
          value={cvv}
          onChangeText={setCvv}
          keyboardType="numeric"
          maxLength={3}
        />
        <Button onPress={handlePayment}>
          {isArabic ? 'إتمام الدفع' : 'Complete Payment'}
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  paymentCard: {
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
