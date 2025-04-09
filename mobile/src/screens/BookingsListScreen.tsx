
import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../hooks/useLanguage';
import { Booking } from '@shared/schema';

export default function BookingsListScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ['/api/bookings'] });

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetails', { id: item.id })}
    >
      <View style={styles.header}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {isArabic ? getArabicStatus(item.status) : item.status}
        </Text>
      </View>
      <Text style={styles.dateTime}>
        {new Date(item.appointmentTime).toLocaleString()}
      </Text>
      <Text style={styles.price}>{item.totalAmount} SAR</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'الحجوزات' : 'Bookings'}
      </Text>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookingCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed': return '#2E7D32';
    case 'pending': return '#ED6C02';
    case 'cancelled': return '#D32F2F';
    default: return '#666';
  }
}

function getArabicStatus(status: string): string {
  switch (status) {
    case 'confirmed': return 'مؤكد';
    case 'pending': return 'قيد الانتظار';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
}
