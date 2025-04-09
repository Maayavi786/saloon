import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Card } from '../components/ui/Card';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { Salon, Booking, Service, Staff } from '@shared/schema';
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  Settings,
  PlusCircle,
  BellRing,
  Star
} from 'lucide-react-native';

export default function SalonManagementScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: salon } = useQuery<Salon>(['salon']);
  const { data: todayBookings } = useQuery<Booking[]>(['bookings', 'today']);
  const { data: services } = useQuery<Service[]>(['services']);
  const { data: staff } = useQuery<Staff[]>(['staff']);

  const menuItems = [
    {
      title: isArabic ? 'إدارة الحجوزات' : 'Manage Bookings',
      icon: Calendar,
      onPress: () => navigation.navigate('ManageBookings'),
    },
    {
      title: isArabic ? 'إدارة الخدمات' : 'Manage Services',
      icon: Settings,
      onPress: () => navigation.navigate('ManageServices'),
    },
    {
      title: isArabic ? 'إدارة الموظفين' : 'Manage Staff',
      icon: Users,
      onPress: () => navigation.navigate('ManageStaff'),
    },
    {
      title: isArabic ? 'التقييمات' : 'Reviews',
      icon: Star,
      onPress: () => navigation.navigate('Reviews'),
    },
    {
      title: isArabic ? 'الإشعارات' : 'Notifications',
      icon: BellRing,
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Clock size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{todayBookings?.length || 0}</Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'حجوزات اليوم' : "Today's Bookings"}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <DollarSign size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {todayBookings?.reduce((sum, booking) => sum + booking.service.price, 0) || 0} SAR
          </Text>
          <Text style={styles.statLabel}>
            {isArabic ? 'إيرادات اليوم' : "Today's Revenue"}
          </Text>
        </Card>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.menuItem} onPress={item.onPress}>
            <item.icon size={24} color="#666" />
            <Text style={styles.menuTitle}>{item.title}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 16,
  },
});