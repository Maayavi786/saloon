
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { MapPin, Clock, Phone } from 'lucide-react-native';

export default function ServiceProviderTrackingScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'تتبع مقدم الخدمة' : 'Track Service Provider'}
      </Text>

      <Card style={styles.providerCard}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>Sarah Ahmad</Text>
          <Text style={styles.serviceType}>
            {isArabic ? 'خبيرة تجميل' : 'Beauty Expert'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Clock size={20} color="#4CAF50" />
          <Text style={styles.eta}>
            {isArabic ? 'الوصول خلال 15 دقيقة' : 'Arriving in 15 minutes'}
          </Text>
        </View>

        <View style={styles.contactButton}>
          <Phone size={20} color="#fff" />
          <Text style={styles.contactText}>
            {isArabic ? 'اتصال' : 'Contact'}
          </Text>
        </View>
      </Card>

      <View style={styles.mapContainer}>
        {/* Map component will be integrated here */}
      </View>
    </View>
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
  providerCard: {
    padding: 16,
    marginBottom: 20,
  },
  providerInfo: {
    marginBottom: 12,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceType: {
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eta: {
    marginLeft: 8,
    color: '#4CAF50',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  contactText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 20,
  },
});
