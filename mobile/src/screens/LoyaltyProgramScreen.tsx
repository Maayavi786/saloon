
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Award, Gift, Star } from 'lucide-react-native';

export default function LoyaltyProgramScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Award size={40} color="#FFD700" />
        <Text style={styles.points}>500 {isArabic ? 'نقطة' : 'Points'}</Text>
      </View>

      <Card style={styles.tierCard}>
        <Star size={24} color="#FFD700" />
        <Text style={styles.tierTitle}>
          {isArabic ? 'المستوى الذهبي' : 'Gold Tier'}
        </Text>
        <ProgressBar progress={0.75} />
        <Text style={styles.progress}>750/1000 {isArabic ? 'نقطة' : 'points'}</Text>
      </Card>

      <View style={styles.rewardsSection}>
        <Text style={styles.sectionTitle}>
          {isArabic ? 'المكافآت المتاحة' : 'Available Rewards'}
        </Text>
        {/* Add reward items */}
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
  points: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tierCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  progress: {
    marginTop: 8,
    textAlign: 'right',
  },
  rewardsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
