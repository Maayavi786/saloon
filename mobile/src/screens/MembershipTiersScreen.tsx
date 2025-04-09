
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Crown, Star, Award } from 'lucide-react-native';

export default function MembershipTiersScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const tiers = [
    {
      name: isArabic ? 'البرونزي' : 'Bronze',
      icon: Star,
      benefits: isArabic 
        ? ['خصم 5%', 'حجز مسبق', 'مكافآت ترحيبية']
        : ['5% Discount', 'Priority Booking', 'Welcome Rewards'],
      color: '#CD7F32'
    },
    {
      name: isArabic ? 'الذهبي' : 'Gold',
      icon: Crown,
      benefits: isArabic
        ? ['خصم 10%', 'حجز VIP', 'مكافآت شهرية']
        : ['10% Discount', 'VIP Booking', 'Monthly Rewards'],
      color: '#FFD700'
    },
    {
      name: isArabic ? 'البلاتيني' : 'Platinum',
      icon: Award,
      benefits: isArabic
        ? ['خصم 15%', 'خدمات حصرية', 'مكافآت خاصة']
        : ['15% Discount', 'Exclusive Services', 'Special Rewards'],
      color: '#E5E4E2'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'مستويات العضوية' : 'Membership Tiers'}
      </Text>

      {tiers.map((tier, index) => (
        <Card key={index} style={styles.tierCard}>
          <tier.icon size={32} color={tier.color} />
          <Text style={[styles.tierName, { color: tier.color }]}>
            {tier.name}
          </Text>
          <View style={styles.benefitsList}>
            {tier.benefits.map((benefit, idx) => (
              <Text key={idx} style={styles.benefit}>
                • {benefit}
              </Text>
            ))}
          </View>
        </Card>
      ))}
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
  tierCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  benefitsList: {
    width: '100%',
    marginTop: 12,
  },
  benefit: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
});
