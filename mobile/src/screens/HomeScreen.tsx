
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../hooks/useLanguage';
import { SalonCard } from '../components/SalonCard';
import { SearchBar } from '../components/SearchBar';
import { CategoryList } from '../components/CategoryList';
import { Salon } from '@shared/schema';

export default function HomeScreen({ navigation }) {
  const { language } = useLanguage();
  const { data: salons } = useQuery<Salon[]>({ queryKey: ['/api/salons'] });

  return (
    <View style={styles.container}>
      <SearchBar />
      <CategoryList />
      <FlatList
        data={salons}
        renderItem={({ item }) => (
          <SalonCard
            salon={item}
            onPress={() => navigation.navigate('SalonDetails', { id: item.id })}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
