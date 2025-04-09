
import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../hooks/useLanguage';
import { LineChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const { data: analytics } = useQuery({ 
    queryKey: ['/api/analytics'],
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'التحليلات' : 'Analytics'}
      </Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isArabic ? 'الحجوزات الشهرية' : 'Monthly Bookings'}
        </Text>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: analytics?.monthlyBookings || [0, 0, 0, 0, 0, 0]
            }]
          }}
          width={320}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics?.totalBookings || 0}</Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'إجمالي الحجوزات' : 'Total Bookings'}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics?.revenue || 0} SAR</Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'الإيرادات' : 'Revenue'}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  card: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
