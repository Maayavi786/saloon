
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Percent, Calendar, Users } from 'lucide-react-native';

export default function PromotionManagementScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'إدارة العروض' : 'Promotion Management'}
      </Text>

      <Button style={styles.addButton}>
        {isArabic ? 'إضافة عرض جديد' : 'Add New Promotion'}
      </Button>

      <Card style={styles.promotionCard}>
        <View style={styles.promotionHeader}>
          <Percent size={24} color="#4CAF50" />
          <Text style={styles.promotionTitle}>
            {isArabic ? 'خصم العيد' : 'Eid Discount'}
          </Text>
        </View>
        <View style={styles.promotionDetails}>
          <View style={styles.detailRow}>
            <Calendar size={20} />
            <Text style={styles.detailText}>
              {isArabic ? '15 يونيو - 30 يونيو' : 'June 15 - June 30'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Users size={20} />
            <Text style={styles.detailText}>
              {isArabic ? '50 استخدام' : '50 uses'}
            </Text>
          </View>
        </View>
      </Card>
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
  addButton: {
    marginBottom: 20,
    backgroundColor: '#4CAF50',
  },
  promotionCard: {
    padding: 16,
    marginBottom: 16,
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  promotionDetails: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
});
