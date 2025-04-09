
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Card } from '../components/ui/Card';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { Salon, Booking, Service } from '@shared/schema';
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  Settings,
  PlusCircle
} from 'lucide-react-native';

export default function SalonManagementScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: salon } = useQuery<Salon>(['salon']);
  const { data: todayBookings } = useQuery<Booking[]>(['bookings', 'today']);
  const { data: services } = useQuery<Service[]>(['services']);

  return (
    <ScrollView style={styles.container}>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Clock size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{todayBookings?.length || 0}</Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'حجوزات اليوم' : "Today's Bookings"}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Users size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{services?.length || 0}</Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'الخدمات' : 'Services'}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <DollarSign size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {todayBookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) || 0}
          </Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'إيرادات اليوم' : "Today's Revenue"}
          </Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button 
          onPress={() => navigation.navigate('AddService')}
          icon={<PlusCircle size={20} />}
        >
          {isArabic ? 'إضافة خدمة' : 'Add Service'}
        </Button>

        <Button 
          onPress={() => navigation.navigate('ManageStaff')}
          icon={<Users size={20} />}
        >
          {isArabic ? 'إدارة الموظفين' : 'Manage Staff'}
        </Button>

        <Button 
          onPress={() => navigation.navigate('SalonSettings')}
          icon={<Settings size={20} />}
        >
          {isArabic ? 'إعدادات الصالون' : 'Salon Settings'}
        </Button>
      </View>

      {/* Today's Schedule */}
      <Card style={styles.scheduleCard}>
        <Text style={styles.cardTitle}>
          {isArabic ? 'جدول اليوم' : "Today's Schedule"}
        </Text>
        {todayBookings?.map(booking => (
          <View key={booking.id} style={styles.bookingItem}>
            <Text style={styles.bookingTime}>{booking.time}</Text>
            <Text style={styles.bookingService}>
              {isArabic 
                ? services?.find(s => s.id === booking.serviceId)?.name
                : services?.find(s => s.id === booking.serviceId)?.nameEn}
            </Text>
            <Text style={styles.bookingStatus}>
              {isArabic 
                ? booking.status === 'confirmed' ? 'مؤكد' : 'معلق'
                : booking.status}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scheduleCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingTime: {
    fontWeight: 'bold',
  },
  bookingService: {
    flex: 1,
    marginHorizontal: 16,
  },
  bookingStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
});
