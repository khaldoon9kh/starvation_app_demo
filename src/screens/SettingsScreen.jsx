import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const renderSettingItem = (title, subtitle, onPress, rightComponent) => (
    <TouchableOpacity 
      style={[
        styles.settingItem,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingContent, { flex: 1 }]}>
        <Text style={[
          styles.settingTitle,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            styles.settingSubtitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent && (
        <View style={styles.settingRight}>
          {rightComponent}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { textAlign: isRTL ? 'right' : 'center' }
        ]}>
          {t('settings') || 'Settings'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          
          {/* Language Section */}
          <Text style={[
            styles.sectionTitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('language') || 'Language'}
          </Text>
          
          {renderSettingItem(
            t('english') || 'English',
            i18n.language === 'en' ? (t('current_language') || 'Current Language') : null,
            () => changeLanguage('en'),
            i18n.language === 'en' ? <Icon name="check" size={20} color="#4CAF50" /> : null
          )}
          
          {renderSettingItem(
            t('arabic') || 'العربية',
            i18n.language === 'ar' ? (t('current_language') || 'اللغة الحالية') : null,
            () => changeLanguage('ar'),
            i18n.language === 'ar' ? <Icon name="check" size={20} color="#4CAF50" /> : null
          )}

          {/* App Settings Section */}
          <Text style={[
            styles.sectionTitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('app_settings') || 'App Settings'}
          </Text>
          
          {renderSettingItem(
            t('notifications') || 'Notifications',
            t('notifications_subtitle') || 'Enable app notifications',
            () => setNotificationsEnabled(!notificationsEnabled),
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={notificationsEnabled ? '#fff' : '#fff'}
            />
          )}
          
          {renderSettingItem(
            t('offline_mode') || 'Offline Mode',
            t('offline_mode_subtitle') || 'Cache data for offline use',
            () => setOfflineModeEnabled(!offlineModeEnabled),
            <Switch
              value={offlineModeEnabled}
              onValueChange={setOfflineModeEnabled}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={offlineModeEnabled ? '#fff' : '#fff'}
            />
          )}

          {/* App Info Section */}
          <Text style={[
            styles.sectionTitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('app_info') || 'App Information'}
          </Text>
          
          {renderSettingItem(
            t('app_version') || 'App Version',
            '1.0.0',
            null,
            null
          )}
          
          {renderSettingItem(
            t('build_number') || 'Build Number',
            '2025.11.07',
            null,
            null
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 10,
  },
});

export default SettingsScreen;