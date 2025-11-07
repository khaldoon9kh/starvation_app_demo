import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const CONTENT_STATUS_KEY = 'app_content_status';

const SplashScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    checkAppData();
  }, []);

  const checkAppData = async () => {
    try {
      // Add a small delay to show the splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if content is cached
      const contentStatus = await AsyncStorage.getItem(CONTENT_STATUS_KEY);
      
      if (contentStatus === 'downloaded') {
        // Content exists - go straight to main app
        console.log('Content found - navigating to main app');
        navigation.replace('MainTabs');
      } else {
        // No content - show landing page for download prompt
        console.log('No content found - navigating to landing page');
        navigation.replace('Landing');
      }
    } catch (error) {
      console.error('Error checking app data:', error);
      // On error, default to landing page
      navigation.replace('Landing');
    }
  };

  return (
    <View style={styles.container}>
      {/* App Logo/Icon Area */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          {/* Justice scales image representing legal accountability */}
          <Image 
            source={require('../../assets/images/image.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.appName}>
          {t('app.name', 'GRC Starvation Toolkit')}
        </Text>
        
        <Text style={styles.appSubtitle}>
          {t('app.subtitle', 'Legal Accountability & Investigation Guide')}
        </Text>
      </View>

      {/* Loading Area */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>
          {t('splash.loading', 'Loading...')}
        </Text>
      </View>

      {/* Version/Copyright */}
      <View style={styles.bottomContainer}>
        <Text style={styles.versionText}>
          {t('app.version', 'Version 1.0')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: 48,
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 280,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SplashScreen;