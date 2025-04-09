
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Salon } from '@shared/schema';
import { useLanguage } from '../hooks/useLanguage';

interface SalonCardProps {
  salon: Salon;
  onPress: () => void;
}

export function SalonCard({ salon, onPress }: SalonCardProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: salon.coverImage }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>
          {isArabic ? salon.name : salon.nameEn || salon.name}
        </Text>
        <Text style={styles.location}>
          {isArabic ? salon.city : salon.cityEn || salon.city}
        </Text>
        <View style={styles.tags}>
          {salon.hasPrivateRooms && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {isArabic ? 'غرف خاصة' : 'Private Rooms'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
});
