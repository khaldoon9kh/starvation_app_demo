import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useBookmarks } from '../hooks/useFirebaseData';

const SavedScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { bookmarks, loading, removeBookmark, refresh } = useBookmarks();
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = i18n.language === 'ar';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const handleItemPress = (bookmark) => {
    if (bookmark.type === 'subcategory') {
      // Use the stored full data for proper navigation with fallbacks
      const subcategoryData = bookmark.fullData || {
        id: bookmark.id,
        titleEn: bookmark.title,
        titleAr: bookmark.titleArabic,
        contentEn: 'Content will be loaded from Firebase when available.',
        contentAr: 'سيتم تحميل المحتوى من Firebase عند توفره.',
        categoryId: bookmark.categoryId,
        hasContent: true,
        level: 1
      };
      
      // Navigate directly to the article without going through Library first
      navigation.navigate('Article', {
        subcategory: subcategoryData,
        category: { id: bookmark.categoryId },
        title: i18n.language === 'ar' ? bookmark.titleArabic || bookmark.title : bookmark.title,
      });
    } else if (bookmark.type === 'category') {
      // Navigate to library and focus on the category
      navigation.navigate('Library');
    } else if (bookmark.type === 'template') {
      // Navigate to templates
      navigation.navigate('Templates');
    } else if (bookmark.type === 'glossary') {
      // Navigate to library (glossary terms are used throughout)
      navigation.navigate('Library');
    }
  };

  const handleRemoveBookmark = (bookmark) => {
    Alert.alert(
      t('remove_bookmark') || 'Remove Bookmark',
      t('remove_bookmark_confirm') || 'Are you sure you want to remove this bookmark?',
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('remove') || 'Remove',
          style: 'destructive',
          onPress: () => removeBookmark(bookmark.id, bookmark.type),
        },
      ]
    );
  };

  const getItemColor = (type) => {
    switch (type) {
      case 'category': return '#2196F3';
      case 'subcategory': return '#4CAF50';
      case 'glossary': return '#FF9800';
      case 'diagram': return '#9C27B0';
      case 'template': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getItemTitle = (bookmark) => {
    // Try to get title from fullData first, then from bookmark directly
    const englishTitle = bookmark.fullData?.titleEn || bookmark.title || bookmark.fullData?.title;
    const arabicTitle = bookmark.fullData?.titleAr || bookmark.titleArabic || bookmark.fullData?.titleArabic;
    
    const selectedTitle = i18n.language === 'ar' 
      ? arabicTitle || englishTitle
      : englishTitle || arabicTitle;
    
    // Fallback to a default title if nothing is found
    return selectedTitle || `${bookmark.type} ${bookmark.id}` || 'Saved Item';
  };

  if (loading && bookmarks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('loading') || 'Loading saved items...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#4CAF50']}
        />
      }
    >
      <View style={styles.content}>
        <View style={[
          styles.headerSection,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <Text style={[styles.title]}>
            {t('saved_items_title') || 'THESE ARE YOUR SAVED ITEMS'}
          </Text>
          {__DEV__ && bookmarks.length > 0 && (
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                Alert.alert(
                  'Debug: Clear All Bookmarks',
                  'This will remove all saved items. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear All', 
                      style: 'destructive',
                      onPress: async () => {
                        // Clear all bookmarks for debugging
                        for (const bookmark of bookmarks) {
                          await removeBookmark(bookmark.id, bookmark.type);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.debugButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {bookmarks.map(bookmark => (
          <View key={`${bookmark.type}-${bookmark.id}`} style={styles.savedItemContainer}>
            <TouchableOpacity
              style={[
                styles.savedItem, 
                {
                  borderLeftColor: isRTL ? 'transparent' : getItemColor(bookmark.type),
                  borderRightColor: isRTL ? getItemColor(bookmark.type) : 'transparent',
                  borderLeftWidth: isRTL ? 0 : 4,
                  borderRightWidth: isRTL ? 4 : 0,
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }
              ]}
              onPress={() => handleItemPress(bookmark)}
            >
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {getItemTitle(bookmark)}
                </Text>
                <Text style={[
                  styles.itemType,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {t(bookmark.type) || bookmark.type}
                </Text>
                {bookmark.addedAt && (
                  <Text style={[
                    styles.itemDate,
                    { textAlign: isRTL ? 'right' : 'left' }
                  ]}>
                    {t('saved_on') || 'Saved on'} {new Date(bookmark.addedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              <View style={[
                styles.itemActions,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveBookmark(bookmark)}
                >
                  <Icon name="delete" size={20} color="#666" />
                </TouchableOpacity>
                <Icon 
                  name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                  size={24} 
                  color="#4CAF50" 
                />
              </View>
            </TouchableOpacity>
          </View>
        ))}
        
        {bookmarks.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icon name="bookmark-border" size={64} color="#ccc" />
            <Text style={[
              styles.emptyText,
              { textAlign: isRTL ? 'right' : 'center' }
            ]}>
              {t('no_saved_items') || 'No saved items yet'}
            </Text>
            <Text style={[
              styles.emptySubText,
              { textAlign: isRTL ? 'right' : 'center' }
            ]}>
              {t('save_articles_instruction') || 'Save articles from the Library to access them here'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    flex: 1,
  },
  debugButton: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    marginLeft: 10,
  },
  debugButtonText: {
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  savedItemContainer: {
    marginBottom: 10,
  },
  savedItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    color: '#999',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
    marginRight: 5,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    marginTop: 20,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});

export default SavedScreen;
