import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllContentForCache } from '../services/dataService';

const CONTENT_STATUS_KEY = 'app_content_status';
const CONTENT_DATA_KEY = 'app_content_data';

const SettingsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [contentStatus, setContentStatus] = useState('none'); // 'none', 'downloading', 'downloaded'
  const [downloadProgress, setDownloadProgress] = useState('');
  
  const showDownloadPrompt = route?.params?.showDownloadPrompt;

  useEffect(() => {
    checkContentStatus();
    
    if (showDownloadPrompt) {
      // Show download prompt after a short delay to ensure UI is ready
      setTimeout(() => {
        showInitialDownloadPrompt();
      }, 500);
    }
  }, [showDownloadPrompt]);

  const checkContentStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(CONTENT_STATUS_KEY);
      setContentStatus(status || 'none');
    } catch (error) {
      console.error('Error checking content status:', error);
    }
  };

  const showInitialDownloadPrompt = () => {
    Alert.alert(
      t('settingsScreen.downloadRequired', 'Download Required'),
      t('settingsScreen.downloadMessage', 'To use all app features, you need to download the latest content. This includes articles, templates, and other resources.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('settingsScreen.downloadNow', 'Download Now'), onPress: handleDownloadContent }
      ]
    );
  };

  const handleDownloadContent = async () => {
    try {
      setDownloading(true);
      setDownloadProgress(t('settingsScreen.preparingDownload', 'Preparing download...'));
      
      // Fetch all content metadata from Firebase
      setDownloadProgress(t('settingsScreen.fetchingData', 'Fetching latest content...'));
      const contentData = await getAllContentForCache();
      
      // Store content metadata
      setDownloadProgress(t('settingsScreen.savingData', 'Saving content locally...'));
      await AsyncStorage.setItem(CONTENT_DATA_KEY, JSON.stringify(contentData));
      
      // Download template files to device storage
      setDownloadProgress(t('settingsScreen.downloadingTemplates', 'Downloading template files...'));
      const { downloadAllTemplates, downloadAllDiagrams } = await import('../services/templateManager');
      await downloadAllTemplates();
      
      // Download diagram images to device storage
      setDownloadProgress(t('settingsScreen.downloadingDiagrams', 'Downloading diagram images...'));
      await downloadAllDiagrams();
      
      // Mark download as complete
      await AsyncStorage.setItem(CONTENT_STATUS_KEY, 'downloaded');
      setContentStatus('downloaded');
      setDownloadProgress('');
      
      // Reload dataStore from AsyncStorage to refresh all screens
      setDownloadProgress(t('settingsScreen.reloadingApp', 'Reloading app...'));
      const dataStore = await import('../services/dataStore');
      await dataStore.default.reloadFromCache();
      
      // Navigate to splash screen to force complete app refresh
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      
      // Show success message
      Alert.alert(
        t('settingsScreen.downloadComplete', 'Download Complete'),
        t('settingsScreen.downloadSuccessMessage', 'Content has been successfully downloaded. The app is now ready to use!'),
        [
          { 
            text: t('common.ok', 'OK'), 
            onPress: () => {
              // Navigate to main app
              navigation.replace('MainTabs');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error downloading content:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('settingsScreen.downloadError', 'Failed to download content. Please check your internet connection and try again.'),
        [{ text: t('common.ok', 'OK') }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleRefreshContent = async () => {
    try {
      setDownloading(true);
      setDownloadProgress(t('settingsScreen.preparingDownload', 'Preparing download...'));
      
      // Fetch all content metadata from Firebase
      setDownloadProgress(t('settingsScreen.fetchingData', 'Fetching latest content...'));
      const contentData = await getAllContentForCache();
      
      // Store content metadata
      setDownloadProgress(t('settingsScreen.savingData', 'Saving content locally...'));
      await AsyncStorage.setItem(CONTENT_DATA_KEY, JSON.stringify(contentData));
      
      // Download/update template files to device storage
      setDownloadProgress(t('settingsScreen.downloadingTemplates', 'Downloading template files...'));
      const { downloadAllTemplates, downloadAllDiagrams } = await import('../services/templateManager');
      await downloadAllTemplates();
      
      // Download/update diagram images to device storage
      setDownloadProgress(t('settingsScreen.downloadingDiagrams', 'Downloading diagram images...'));
      await downloadAllDiagrams();
      
      // Mark update as complete
      await AsyncStorage.setItem(CONTENT_STATUS_KEY, 'downloaded');
      
      setContentStatus('downloaded');
      setDownloadProgress('');
      
      // Reload dataStore from AsyncStorage to refresh all screens
      setDownloadProgress(t('settingsScreen.reloadingApp', 'Reloading app...'));
      const dataStore = await import('../services/dataStore');
      await dataStore.default.reloadFromCache();
      
      // Navigate to splash/loading screen to force complete app refresh
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
      
      // Show success message
      Alert.alert(
        t('settingsScreen.refreshComplete', 'Content Updated'),
        t('settingsScreen.refreshSuccessMessage', 'Content has been updated. The app will restart.'),
        [
          { 
            text: t('common.ok', 'OK'), 
            onPress: () => {
              // Stay on settings screen, content is updated
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error refreshing content:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('settingsScreen.refreshError', 'Failed to update content. Please check your internet connection and try again.'),
        [{ text: t('common.ok', 'OK') }]
      );
    } finally {
      setDownloading(false);
    }
  };

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
          Settings
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

          {/* Content Management Section */}
          <Text style={[
            styles.sectionTitle,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('settingsScreen.contentManagement', 'Content Management')}
          </Text>

          {downloading ? (
            <View style={styles.downloadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={[
                styles.downloadingText,
                { textAlign: isRTL ? 'right' : 'left', marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }
              ]}>
                {downloadProgress}
              </Text>
            </View>
          ) : (
            <>
              {contentStatus !== 'downloaded' ? (
                renderSettingItem(
                  t('settingsScreen.downloadContent', 'Download content updates'),
                  t('settingsScreen.contentNotDownloaded', 'Content not downloaded'),
                  handleDownloadContent,
                  <TouchableOpacity 
                    style={styles.downloadButton} 
                    onPress={handleDownloadContent}
                  >
                    <Text style={styles.downloadButtonText}>
                      {t('settingsScreen.download', 'DOWNLOAD')}
                    </Text>
                  </TouchableOpacity>
                )
              ) : (
                <View>
                  {renderSettingItem(
                    t('settingsScreen.downloadContent', 'Download content updates'),
                    t('settingsScreen.contentDownloaded', 'Content is up to date'),
                    null,
                    <Icon name="check-circle" size={20} color="#4CAF50" />
                  )}
                  <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={handleRefreshContent}
                  >
                    <Icon name="refresh" size={18} color="#fff" />
                    <Text style={styles.refreshButtonText}>
                      {t('settingsScreen.updateContent', 'UPDATE CONTENT')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
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
  downloadingContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  downloadingText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;