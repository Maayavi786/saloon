
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Crown, Star, Gift } from 'lucide-react-native';

export default function VIPAccessScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Crown size={40} color="#FFD700" />
        <Text style={styles.title}>
          {isArabic ? 'الوصول VIP' : 'VIP Access'}
        </Text>
      </View>

      <Card style={styles.benefitCard}>
        <Star size={24} color="#FFD700" />
        <Text style={styles.benefitTitle}>
          {isArabic ? 'المزايا الحصرية' : 'Exclusive Benefits'}
        </Text>
        <Text style={styles.benefitDescription}>
          {isArabic 
            ? 'استمتع بخدمات حصرية وعروض خاصة'
            : 'Enjoy exclusive services and special offers'}
        </Text>
      </Card>

      <View style={styles.perksSection}>
        <Text style={styles.sectionTitle}>
          {isArabic ? 'المزايا المتاحة' : 'Available Perks'}
        </Text>
        {/* Add VIP perks list here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  benefitCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  benefitDescription: {
    color: '#666',
  },
  perksSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
