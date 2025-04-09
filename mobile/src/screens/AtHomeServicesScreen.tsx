
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Home, MapPin, Clock, Calendar } from 'lucide-react-native';

export default function AtHomeServicesScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'الخدمات المنزلية' : 'At-Home Services'}
      </Text>

      <View style={styles.featuredServices}>
        <Card style={styles.serviceCard}>
          <Home size={24} color="#4CAF50" />
          <Text style={styles.serviceTitle}>
            {isArabic ? 'تصفيف الشعر' : 'Hair Styling'}
          </Text>
          <Text style={styles.servicePrice}>150 SAR</Text>
        </Card>

        <Card style={styles.serviceCard}>
          <Home size={24} color="#4CAF50" />
          <Text style={styles.serviceTitle}>
            {isArabic ? 'مكياج' : 'Makeup'}
          </Text>
          <Text style={styles.servicePrice}>200 SAR</Text>
        </Card>
      </View>

      <View style={styles.addressSection}>
        <MapPin size={24} />
        <Text style={styles.sectionTitle}>
          {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
        </Text>
      </View>

      <View style={styles.timeSection}>
        <Clock size={24} />
        <Text style={styles.sectionTitle}>
          {isArabic ? 'وقت الحجز' : 'Booking Time'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuredServices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  servicePrice: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
