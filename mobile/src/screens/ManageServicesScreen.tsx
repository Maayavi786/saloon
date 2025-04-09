
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Service } from '@shared/schema';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { ServiceCard } from '../components/ui/ServiceCard';
import { Plus, Edit2, Trash } from 'lucide-react-native';

export default function ManageServicesScreen({ navigation }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: services, refetch } = useQuery<Service[]>(['salon-services']);

  const deleteMutation = useMutation({
    mutationFn: (serviceId: number) =>
      fetch(`/api/services/${serviceId}`, { method: 'DELETE' }),
    onSuccess: () => refetch(),
  });

  return (
    <View style={styles.container}>
      <Button 
        onPress={() => navigation.navigate('AddService')}
        style={styles.addButton}
      >
        <Plus size={24} color="#fff" />
        <Text style={styles.buttonText}>
          {isArabic ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </Text>
      </Button>

      <ScrollView style={styles.servicesList}>
        {services?.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => navigation.navigate('EditService', { service })}
            onDelete={() => deleteMutation.mutate(service.id)}
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
  servicesList: {
    flex: 1,
  },
});
