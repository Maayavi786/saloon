
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '../components/ui/Text';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImagePicker } from '../components/ui/ImagePicker';
import { Select } from '../components/ui/Select';

export default function AddStaffScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    specialization: '',
    specializationEn: '',
    experience: '',
    gender: '',
    avatar: '',
  });

  const addStaffMutation = useMutation({
    mutationFn: (data) => fetch('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['salon-staff']);
      navigation.goBack();
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'إضافة موظف جديد' : 'Add New Staff'}
      </Text>

      <Input
        label={isArabic ? 'الاسم' : 'Name'}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <Input
        label={isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}
        value={formData.nameEn}
        onChangeText={(text) => setFormData({ ...formData, nameEn: text })}
      />

      <Input
        label={isArabic ? 'التخصص' : 'Specialization'}
        value={formData.specialization}
        onChangeText={(text) => setFormData({ ...formData, specialization: text })}
      />

      <Input
        label={isArabic ? 'سنوات الخبرة' : 'Years of Experience'}
        keyboardType="numeric"
        value={formData.experience}
        onChangeText={(text) => setFormData({ ...formData, experience: text })}
      />

      <Select
        label={isArabic ? 'الجنس' : 'Gender'}
        value={formData.gender}
        onValueChange={(value) => setFormData({ ...formData, gender: value })}
        items={[
          { label: isArabic ? 'ذكر' : 'Male', value: 'male' },
          { label: isArabic ? 'أنثى' : 'Female', value: 'female' },
        ]}
      />

      <ImagePicker
        label={isArabic ? 'الصورة الشخصية' : 'Profile Picture'}
        onImageSelected={(uri) => setFormData({ ...formData, avatar: uri })}
      />

      <Button
        onPress={() => addStaffMutation.mutate(formData)}
        style={styles.submitButton}
      >
        {isArabic ? 'إضافة الموظف' : 'Add Staff'}
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
