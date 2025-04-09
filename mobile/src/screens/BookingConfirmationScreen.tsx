
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CheckCircle } from 'lucide-react-native';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { booking } = route.params;
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <View style={styles.container}>
      <Card style={styles.confirmationCard}>
        <CheckCircle size={64} color="#4CAF50" style={styles.icon} />
        <Text style={styles.title}>
          {isArabic ? 'تم تأكيد الحجز' : 'Booking Confirmed'}
        </Text>
        <Text style={styles.bookingId}>
          {isArabic ? 'رقم الحجز: ' : 'Booking ID: '}{booking.id}
        </Text>
        <Text style={styles.details}>
          {isArabic ? 'التاريخ: ' : 'Date: '}{booking.date}
        </Text>
        <Text style={styles.details}>
          {isArabic ? 'الوقت: ' : 'Time: '}{booking.time}
        </Text>
        <Text style={styles.details}>
          {isArabic ? 'الخدمة: ' : 'Service: '}{booking.service.name}
        </Text>
        <Button 
          onPress={() => navigation.navigate('Bookings')}
          style={styles.button}
        >
          {isArabic ? 'عرض الحجوزات' : 'View Bookings'}
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
  confirmationCard: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  bookingId: {
    fontSize: 16,
    marginBottom: 16,
  },
  details: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
});
