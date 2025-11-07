import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { 
  getLocalTemplateCategories,
  areTemplatesDownloaded,
  downloadAllTemplates,
  getDownloadStats,
  getLocalTemplates
} from '../services/templateManager';

const TemplatesScreen = ({navigation}) => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    initializeTemplates();
  }, [i18n.language]);

  const initializeTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if templates are already downloaded
      const templatesExist = await areTemplatesDownloaded();
      
      if (!templatesExist) {
        // Show download prompt
        showDownloadPrompt();
        return;
      }
      
      // Load categories from local storage
      await loadLocalCategories();
    } catch (err) {
      console.error('Error initializing templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCategories = async () => {
    try {
      const language = i18n.language === 'ar' ? 'ar' : 'en';
      const templateCategories = await getLocalTemplateCategories(language);
      
      // Add "All Templates" as the first category
      const allTemplatesCategory = t('templates.allTemplates', 'All Templates');
      const allCategories = [allTemplatesCategory, ...templateCategories];
      
      setCategories(allCategories);
    } catch (err) {
      console.error('Error loading local template categories:', err);
      setError(err.message);
    }
  };

  const showDownloadPrompt = () => {
    Alert.alert(
      t('templates.downloadRequired', 'Download Required'),
      t('templates.downloadMessage', 'Templates need to be downloaded before use. This will download all templates to your device.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('templates.download', 'Download'), onPress: handleDownloadTemplates }
      ]
    );
  };

  const handleDownloadTemplates = async () => {
    try {
      setDownloading(true);
      setDownloadProgress(t('templates.startingDownload', 'Starting download...'));
      
      const result = await downloadAllTemplates();
      
      if (result.success) {
        setDownloadProgress(null);
        
        // Get download statistics
        const stats = await getDownloadStats();
        
        Alert.alert(
          t('templates.success', 'Success'),
          `${t('templates.downloadComplete', 'Templates downloaded successfully')}\n\nTotal: ${stats.total}\nReady: ${stats.downloaded}\n${stats.failed > 0 ? `With Issues: ${stats.failed}` : 'All templates are ready!'}`,
          [
            { 
              text: t('common.ok', 'OK'), 
              onPress: async () => {
                await loadLocalCategories();
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error downloading templates:', err);
      setDownloadProgress(null);
      Alert.alert(
        t('common.error', 'Error'),
        t('templates.downloadError', 'Failed to download templates. Please try again.')
      );
    } finally {
      setDownloading(false);
    }
  };

  const getCategoryColor = (category) => {
    // Special color for "All Templates"
    const allTemplatesCategory = t('templates.allTemplates', 'All Templates');
    if (category === allTemplatesCategory) return '#6366F1'; // Indigo color
    
    const colors = [
      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
      '#F44336', '#00BCD4', '#8BC34A', '#FF5722'
    ];
    const hash = category?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    return colors[Math.abs(hash) % colors.length];
  };

  const getCategoryIcon = (category) => {
    // Special icon for "All Templates"
    const allTemplatesCategory = t('templates.allTemplates', 'All Templates');
    if (category === allTemplatesCategory) return 'apps';
    
    // You can customize icons based on category names
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('checklist')) return 'checklist';
    if (categoryLower.includes('assessment')) return 'assessment';
    if (categoryLower.includes('interview')) return 'record-voice-over';
    if (categoryLower.includes('guide')) return 'menu-book';
    if (categoryLower.includes('template')) return 'description';
    return 'folder';
  };

  const handleCategoryPress = (category) => {
    const allTemplatesCategory = t('templates.allTemplates', 'All Templates');
    
    if (category === allTemplatesCategory) {
      navigation.navigate('CategoryTemplates', { 
        category: 'all',
        categoryDisplayName: allTemplatesCategory
      });
    } else {
      navigation.navigate('CategoryTemplates', { category });
    }
  };

  if (loading || downloading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          {downloading 
            ? (downloadProgress || t('templates.downloading', 'Downloading templates...'))
            : t('common.loading', 'Loading...')
          }
        </Text>
        {downloading && (
          <Text style={styles.downloadHint}>
            {t('templates.downloadHint', 'This may take a few moments...')}
          </Text>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('common.error', 'Error')}: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeTemplates}>
          <Text style={styles.retryButtonText}>{t('common.retry', 'Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }  return (
    <ScrollView style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.titleRTL]}>
          {t('templates.title', 'All Templates and Checklists')}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.subtitleRTL]}>
          {t('templates.categoriesSubtitle', 'Browse templates by category')}
        </Text>
        
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="folder-open" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{t('templates.noCategories', 'No categories available')}</Text>
            <TouchableOpacity style={styles.downloadButton} onPress={showDownloadPrompt}>
              <Text style={styles.downloadButtonText}>{t('templates.downloadNow', 'Download Templates')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryCardContent}>
                  <View style={[
                    styles.categoryIcon, 
                    {backgroundColor: getCategoryColor(category)}
                  ]}>
                    <Icon 
                      name={getCategoryIcon(category)} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  
                  <View style={styles.categoryInfo}>
                    <Text style={[
                      styles.categoryName, 
                      isRTL && styles.categoryNameRTL
                    ]}>
                      {category}
                    </Text>
                  </View>
                  
                  <Icon 
                    name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                    size={24} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Re-download templates button */}
        <TouchableOpacity 
          style={styles.redownloadButton}
          onPress={handleDownloadTemplates}>
          <Icon 
            name="refresh" 
            size={20} 
            color="#fff" 
            style={[!isRTL && styles.redownloadButtonIcon]}
          />
          <Text style={styles.redownloadButtonText}>
            {t('templates.redownload', 'Re-download Templates')}
          </Text>
          {isRTL && (
            <Icon 
              name="refresh" 
              size={20} 
              color="#fff" 
              style={styles.redownloadButtonIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerRTL: {
    direction: 'rtl',
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  downloadHint: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  titleRTL: {
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  subtitleRTL: {
    textAlign: 'left',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryNameRTL: {
    textAlign: 'left',
  },
  categoryHint: {
    fontSize: 14,
    color: '#666',
  },
  categoryHintRTL: {
    textAlign: 'right',
  },
  redownloadButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  redownloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redownloadButtonIcon: {
    marginRight: 10,
  },
});

export default TemplatesScreen;
