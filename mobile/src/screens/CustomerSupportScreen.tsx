
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react-native';

export default function CustomerSupportScreen() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isArabic ? 'الدعم والمساعدة' : 'Customer Support'}
      </Text>

      <Card style={styles.supportCard}>
        <MessageCircle size={24} color="#4CAF50" />
        <Text style={styles.supportTitle}>
          {isArabic ? 'المحادثة المباشرة' : 'Live Chat'}
        </Text>
        <Text style={styles.supportDescription}>
          {isArabic ? 'تحدث مع فريق الدعم مباشرة' : 'Chat with our support team directly'}
        </Text>
        <Button style={styles.supportButton}>
          {isArabic ? 'بدء المحادثة' : 'Start Chat'}
        </Button>
      </Card>

      <Card style={styles.supportCard}>
        <Phone size={24} color="#2196F3" />
        <Text style={styles.supportTitle}>
          {isArabic ? 'اتصل بنا' : 'Call Us'}
        </Text>
        <Text style={styles.supportDescription}>
          {isArabic ? 'متاح 24/7' : 'Available 24/7'}
        </Text>
        <Button style={[styles.supportButton, styles.callButton]}>
          800-555-0123
        </Button>
      </Card>

      <Card style={styles.supportCard}>
        <HelpCircle size={24} color="#FF9800" />
        <Text style={styles.supportTitle}>
          {isArabic ? 'الأسئلة الشائعة' : 'FAQs'}
        </Text>
        <Text style={styles.supportDescription}>
          {isArabic ? 'إجابات على الأسئلة المتكررة' : 'Find answers to common questions'}
        </Text>
      </Card>
    </ScrollView>
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
  supportCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  supportDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  supportButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#4CAF50',
  },
  callButton: {
    backgroundColor: '#2196F3',
  },
});
