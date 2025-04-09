
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '../components/ui/Text';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImagePicker } from '../components/ui/ImagePicker';

export default function AddServiceScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    duration: '',
    category: '',
    image: '',
  });

  const addServiceMutation = useMutation({
    mutationFn: (data) => fetch('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['salon-services']);
      navigation.goBack();
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'إضافة خدمة جديدة' : 'Add New Service'}
      </Text>

      <Input
        label={isArabic ? 'اسم الخدمة' : 'Service Name'}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <Input
        label={isArabic ? 'اسم الخدمة (إنجليزي)' : 'Service Name (English)'}
        value={formData.nameEn}
        onChangeText={(text) => setFormData({ ...formData, nameEn: text })}
      />

      <Input
        label={isArabic ? 'الوصف' : 'Description'}
        multiline
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
      />

      <Input
        label={isArabic ? 'السعر' : 'Price'}
        keyboardType="numeric"
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
      />

      <Input
        label={isArabic ? 'المدة (دقيقة)' : 'Duration (minutes)'}
        keyboardType="numeric"
        value={formData.duration}
        onChangeText={(text) => setFormData({ ...formData, duration: text })}
      />

      <ImagePicker
        label={isArabic ? 'صورة الخدمة' : 'Service Image'}
        onImageSelected={(uri) => setFormData({ ...formData, image: uri })}
      />

      <Button
        onPress={() => addServiceMutation.mutate(formData)}
        style={styles.submitButton}
      >
        {isArabic ? 'إضافة الخدمة' : 'Add Service'}
      </Button>
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
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});
