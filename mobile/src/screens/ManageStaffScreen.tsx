
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Staff } from '@shared/schema';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { StaffCard } from '../components/ui/StaffCard';
import { Plus, UserPlus } from 'lucide-react-native';

export default function ManageStaffScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: staff, refetch } = useQuery<Staff[]>(['salon-staff']);

  const deleteMutation = useMutation({
    mutationFn: (staffId: number) =>
      fetch(`/api/staff/${staffId}`, { method: 'DELETE' }),
    onSuccess: () => refetch(),
  });

  return (
    <View style={styles.container}>
      <Button 
        onPress={() => navigation.navigate('AddStaff')}
        style={styles.addButton}
      >
        <UserPlus size={24} color="#fff" />
        <Text style={styles.buttonText}>
          {isArabic ? 'إضافة موظف جديد' : 'Add New Staff'}
        </Text>
      </Button>

      <ScrollView style={styles.staffList}>
        {staff?.map((member) => (
          <StaffCard
            key={member.id}
            staff={member}
            onEdit={() => navigation.navigate('EditStaff', { staff: member })}
            onDelete={() => deleteMutation.mutate(member.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  staffList: {
    flex: 1,
  },
});
