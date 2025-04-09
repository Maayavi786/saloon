import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../hooks/useLanguage';
import { Review } from '@shared/schema';

export default function ReviewsScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { data: reviews } = useQuery<Review[]>({ queryKey: ['/api/reviews'] });

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.header}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.rating}>★ {item.rating}</Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'التقييمات' : 'Reviews'}
      </Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
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
  reviewCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    fontSize: 16,
    color: '#FFB800',
  },
  comment: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});