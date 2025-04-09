
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { Text } from '../components/ui/Text';
import { Switch } from '../components/ui/Switch';
import { Settings, Bell, Shield, Globe } from 'lucide-react-native';

export default function SettingsScreen() {
  const { language, setLanguage } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isArabic ? 'الإعدادات العامة' : 'General Settings'}
        </Text>
        <View style={styles.setting}>
          <Globe size={20} />
          <Text style={styles.settingText}>
            {isArabic ? 'اللغة العربية' : 'Arabic Language'}
          </Text>
          <Switch
            value={isArabic}
            onValueChange={() => setLanguage(isArabic ? 'en' : 'ar')}
          />
        </View>
        <View style={styles.setting}>
          <Bell size={20} />
          <Text style={styles.settingText}>
            {isArabic ? 'الإشعارات' : 'Notifications'}
          </Text>
          <Switch defaultValue={true} />
        </View>
        <View style={styles.setting}>
          <Shield size={20} />
          <Text style={styles.settingText}>
            {isArabic ? 'الخصوصية' : 'Privacy'}
          </Text>
          <Switch defaultValue={true} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
});
