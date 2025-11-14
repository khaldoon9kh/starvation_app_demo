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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalTemplatesByCategory, openLocalTemplate, getLocalTemplates } from '../services/templateManager';

const CONTENT_DATA_KEY = 'app_content_data';

const CategoryTemplatesScreen = ({ route, navigation }) => {
  const { category, categoryDisplayName } = route.params;
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    loadLocalTemplates();
  }, [category, i18n.language]);

  const loadLocalTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const language = i18n.language === 'ar' ? 'ar' : 'en';
      const categoryKey = language === 'ar' ? 'categoryAR' : 'categoryEN';
      
      // Try to load from main content cache first
      const contentDataStr = await AsyncStorage.getItem(CONTENT_DATA_KEY);
      
      let categoryTemplates = [];
      
      if (contentDataStr) {
        try {
          const contentData = JSON.parse(contentDataStr);
          const allTemplates = contentData.templates || [];
          
          if (category === 'all') {
            categoryTemplates = allTemplates;
          } else {
            // Filter by category
            categoryTemplates = allTemplates.filter(template => 
              (template[categoryKey] || template.category) === category
            );
          }
        } catch (parseErr) {
          console.error('Error parsing cached content:', parseErr);
        }
      }
      
      // Fallback: Load from old separate storage if needed
      if (categoryTemplates.length === 0) {
        if (category === 'all') {
          const allTemplates = await getLocalTemplates();
          categoryTemplates = Object.values(allTemplates);
        } else {
          categoryTemplates = await getLocalTemplatesByCategory(category, language);
        }
      }
      
      setTemplates(categoryTemplates);
    } catch (err) {
      console.error('Error loading local category templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTitle = (template) => {
    if (isRTL) {
      return template.titleArabic || template.title || 'Unknown Template';
    }
    return template.title || 'Unknown Template';
  };

  const getTemplateDescription = (template) => {
    if (isRTL) {
      return template.descriptionArabic || template.description || '';
    }
    return template.description || '';
  };

  const getTemplateIcon = (template) => {
    const language = i18n.language === 'ar' ? 'ar' : 'en';
    const fileExtension = language === 'ar'
      ? (template.fileExtensionAr || template.fileExtension)
      : (template.fileExtensionEn || template.fileExtension) || 'document';
    
    switch (fileExtension.toLowerCase()) {
      case 'pdf':
        return 'picture-as-pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table-chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      default:
        return 'description';
    }
  };

  const getTemplateColor = () => {
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

  const handleTemplatePress = async (template) => {
    // Check if template has local file info (bilingual version)
    // If not from cache, check downloaded templates storage
    let hasLocalFile = template.hasFile && (template.localPathEn || template.localPathAr || template.localPath);
    
    if (!hasLocalFile) {
      try {
        const downloadedTemplates = await getLocalTemplates();
        const downloaded = downloadedTemplates[template.id];
        hasLocalFile = downloaded && downloaded.hasFile && (downloaded.localPathEn || downloaded.localPathAr || downloaded.localPath);
      } catch (error) {
        console.error('Error checking downloaded templates:', error);
      }
    }
    
    if (!hasLocalFile) {
      // Template file not available
      Alert.alert(
        t('templates.fileNotAvailable', 'File Not Available'),
        t('templates.downloadFailed', 'This template could not be downloaded or is not available.'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    // Template has local file - show options
    Alert.alert(
      getTemplateTitle(template),
      getTemplateDescription(template) || t('templates.templateReady', 'Template is ready to open'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('templates.viewInfo', 'View Info'), onPress: () => showTemplateInfo(template) },
        { text: t('templates.open', 'Open'), onPress: () => openTemplateFile(template) }
      ]
    );
  };

  const showTemplateInfo = (template) => {
    const title = getTemplateTitle(template);
    const description = getTemplateDescription(template);
    const language = i18n.language === 'ar' ? 'ar' : 'en';
    
    // Get language-specific file info
    const fileExtension = language === 'ar' 
      ? (template.fileExtensionAr || template.fileExtension)?.toUpperCase()
      : (template.fileExtensionEn || template.fileExtension)?.toUpperCase() || 'Document';
    
    const originalName = language === 'ar' 
      ? (template.pdfOriginalNameAr || template.pdfOriginalName)
      : (template.pdfOriginalNameEn || template.pdfOriginalName) || 'Unknown';
    
    const fileSize = language === 'ar'
      ? (template.pdfSizeAr || template.pdfSize)
      : (template.pdfSizeEn || template.pdfSize);
    
    const fileSizeText = fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Unknown';
    const downloadDate = template.downloadedAt ? new Date(template.downloadedAt).toLocaleDateString() : 'Unknown';
    const fileStatus = template.hasFile ? t('templates.fileAvailable', 'Available locally') : t('templates.fileNotAvailable', 'Not available');
    
    Alert.alert(
      title,
      `${description}\n\n${t('templates.originalName', 'Original Name')}: ${originalName}\n${t('templates.fileType', 'File Type')}: ${fileExtension}\n${t('templates.fileSize', 'File Size')}: ${fileSizeText}\n${t('templates.downloadedAt', 'Downloaded')}: ${downloadDate}\n${t('templates.status', 'Status')}: ${fileStatus}`,
      [
        { text: t('common.ok', 'OK') },
        ...(template.hasFile ? [{ 
          text: t('templates.open', 'Open File'), 
          onPress: () => openTemplateFile(template) 
        }] : [])
      ]
    );
  };

  const openTemplateFile = async (template) => {
    try {
      console.log(`🎯 Opening template: ${getTemplateTitle(template)}`);
      
      // Check if template has local path info
      // If not, try to get it from the downloaded templates storage
      let templateWithLocalPath = template;
      
      if (!template.localPathEn && !template.localPathAr && !template.localPath) {
        console.log('📦 Template missing local path info, checking downloaded templates...');
        const downloadedTemplates = await getLocalTemplates();
        const downloaded = downloadedTemplates[template.id];
        
        if (downloaded && (downloaded.localPathEn || downloaded.localPathAr || downloaded.localPath) && downloaded.hasFile) {
          console.log('✅ Found template in downloaded storage');
          templateWithLocalPath = {
            ...template,
            localPathEn: downloaded.localPathEn,
            localPathAr: downloaded.localPathAr,
            localPath: downloaded.localPath, // Legacy support
            hasFile: downloaded.hasFile
          };
        } else {
          throw new Error('Template file is not available locally');
        }
      }
      
      await openLocalTemplate(templateWithLocalPath, i18n.language);
      
      console.log('✅ Template opened successfully');
    } catch (error) {
      console.error('❌ Error opening template:', error);
      
      Alert.alert(
        t('templates.openError', 'Open Error'),
        `${t('templates.failedToOpen', 'Failed to open template')}\n\n${error.message}`,
        [{ text: t('common.ok', 'OK') }]
      );
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: categoryDisplayName || category,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon 
            name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
            size={28} 
            color="#333" 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, category, categoryDisplayName, isRTL]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('common.error', 'Error')}: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLocalTemplates}>
          <Text style={styles.retryButtonText}>{t('common.retry', 'Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (templates.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="folder-open" size={64} color="#ccc" />
        <Text style={styles.emptyText}>{t('templates.noTemplatesInCategory', 'No templates in this category')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.content}>
        <View style={styles.templatesGrid}>
          {templates.map((template) => (
            <TouchableOpacity 
              key={template.id} 
              style={styles.templateCard}
              onPress={() => handleTemplatePress(template)}
              activeOpacity={0.7}
            >
              <View style={styles.documentPreview}>
                <View style={[
                  styles.documentIcon, 
                  {backgroundColor: getTemplateColor()}
                ]}>
                  <Icon 
                    name={getTemplateIcon(template)} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.documentContent}>
                  <View style={styles.documentLine} />
                  <View style={styles.documentLine} />
                  <View style={styles.documentLine} />
                  <View style={[styles.documentLine, {width: '60%'}]} />
                </View>
                {template.fileExtension && (
                  <View style={styles.fileTypeBadge}>
                    <Text style={styles.fileTypeText}>
                      {template.fileExtension.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[
                styles.templateTitle, 
                isRTL && styles.templateTitleRTL
              ]}>
                {getTemplateTitle(template)}
              </Text>
              <Text style={[
                styles.templateDescription, 
                isRTL && styles.templateDescriptionRTL
              ]}>
                {getTemplateDescription(template)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  documentPreview: {
    height: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 15,
    padding: 10,
    position: 'relative',
  },
  documentIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentContent: {
    flex: 1,
  },
  documentLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
    borderRadius: 1,
  },
  fileTypeBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  fileTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  templateTitleRTL: {
    textAlign: 'right',
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  templateDescriptionRTL: {
    textAlign: 'right',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryTemplatesScreen;