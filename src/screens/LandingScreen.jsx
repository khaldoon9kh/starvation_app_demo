import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const LandingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.dir() === 'rtl';

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleGoToSettings = () => {
    // Navigate to settings with a flag to show download prompt
    navigation.navigate('Settings', { showDownloadPrompt: true });
  };

  return (
    <ScrollView style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.content}>


        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.titleRTL]}>
            {t('landing.letsGetReady', 'LET\'S GET READY')}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={[styles.description, isRTL && styles.descriptionRTL]}>
            {t('landing.description', 'For the safety and security of our users, the content of this app must be manually downloaded and updated. You are seeing this message because the app currently has no content downloaded. Please go to settings and download the most recent version of the app\'s content.')}
          </Text>

          {/* Settings Button */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleGoToSettings}
            activeOpacity={0.8}
          >
            <Icon name="settings" size={20} color="#fff" style={[!isRTL && styles.buttonIcon]} />
            <Text style={styles.settingsButtonText}>
              {t('landing.settings', 'SETTINGS')}
            </Text>
            {isRTL && (
              <Icon name="settings" size={20} color="#fff" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>

          {/* Language Selection */}
          <View style={styles.languageButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.languageButton,
                i18n.language === 'en' && styles.activeLanguageButton
              ]}
              onPress={() => changeLanguage('en')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageButtonText,
                i18n.language === 'en' && styles.activeLanguageButtonText
              ]}>
                English
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.languageButton,
                i18n.language === 'ar' && styles.activeLanguageButton
              ]}
              onPress={() => changeLanguage('ar')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageButtonText,
                i18n.language === 'ar' && styles.activeLanguageButtonText
              ]}>
                العربية
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Icon name="info-outline" size={20} color="#666" />
          <Text style={[styles.infoText, isRTL && styles.infoTextRTL]}>
            {t('landing.infoNote', 'This ensures you always have the latest and most secure content.')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerRTL: {
    direction: 'rtl',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  languageButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    minWidth: 100,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  languageButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeLanguageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleRTL: {
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  descriptionRTL: {
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  infoTextRTL: {
    marginLeft: 0,
    marginRight: 8,
    textAlign: 'center',
  },
});

export default LandingScreen;