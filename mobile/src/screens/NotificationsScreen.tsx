
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Notification } from '@shared/schema';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Bell, Calendar, User, CheckCircle } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: notifications, refetch } = useQuery<Notification[]>(['notifications']);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' }),
    onSuccess: () => refetch(),
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar size={24} color="#4CAF50" />;
      case 'user':
        return <User size={24} color="#2196F3" />;
      default:
        return <Bell size={24} color="#FFA000" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {notifications?.map((notification) => (
        <Card 
          key={notification.id} 
          style={[
            styles.notificationCard,
            !notification.read && styles.unreadCard
          ]}
          onPress={() => markAsReadMutation.mutate(notification.id)}
        >
          <View style={styles.notificationContent}>
            {getNotificationIcon(notification.type)}
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {isArabic ? notification.title : notification.titleEn}
              </Text>
              <Text style={styles.message}>
                {isArabic ? notification.message : notification.messageEn}
              </Text>
              <Text style={styles.time}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {notification.read && (
              <CheckCircle size={16} color="#4CAF50" style={styles.readIcon} />
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  notificationCard: {
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: '#E3F2FD',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  readIcon: {
    marginLeft: 8,
  },
});
