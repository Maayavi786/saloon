
import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Camera, RefreshCw } from 'lucide-react-native';

export default function AIPoweredTryOnScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [hasImage, setHasImage] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'تجربة المظهر الافتراضي' : 'Virtual Try-On'}
      </Text>
      
      <View style={styles.cameraSection}>
        {!hasImage ? (
          <Button 
            onPress={() => setHasImage(true)}
            style={styles.cameraButton}
          >
            <Camera size={24} />
            <Text>{isArabic ? 'التقاط صورة' : 'Take Photo'}</Text>
          </Button>
        ) : (
          <View style={styles.previewSection}>
            <Image 
              source={{ uri: 'placeholder' }}
              style={styles.preview}
            />
            <Button 
              onPress={() => setHasImage(false)}
              style={styles.retakeButton}
            >
              <RefreshCw size={24} />
              <Text>{isArabic ? 'إعادة التقاط' : 'Retake'}</Text>
            </Button>
          </View>
        )}
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>
          {isArabic ? 'الفلاتر المتاحة' : 'Available Filters'}
        </Text>
        {/* Add filter options here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraSection: {
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  previewSection: {
    width: '100%',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  filterSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
