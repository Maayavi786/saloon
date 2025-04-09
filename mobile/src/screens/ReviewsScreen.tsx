
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useQuery } from '@tanstack/react-query';
import { Review } from '@shared/schema';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Star, MessageCircle } from 'lucide-react-native';

export default function ReviewsScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: reviews } = useQuery<Review[]>(['salon-reviews']);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>
          {isArabic ? 'إحصائيات التقييمات' : 'Review Statistics'}
        </Text>
        <View style={styles.statsRow}>
          <Star size={24} color="#FFD700" />
          <Text style={styles.statsText}>
            {reviews?.reduce((acc, review) => acc + review.rating, 0) / (reviews?.length || 1)}
          </Text>
        </View>
        <Text style={styles.totalReviews}>
          {isArabic ? `${reviews?.length} تقييم` : `${reviews?.length} Reviews`}
        </Text>
      </View>

      {reviews?.map((review) => (
        <Card key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{review.userName}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.rating}>{review.rating}</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>{review.comment}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
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
  statsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  statsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  totalReviews: {
    color: '#666',
    marginTop: 4,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
  },
  reviewText: {
    marginVertical: 8,
  },
  reviewDate: {
    color: '#666',
    fontSize: 12,
  },
});
