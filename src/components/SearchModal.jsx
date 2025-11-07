import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSearch } from '../hooks/useFirebaseData';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 90;

const SearchModal = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { searchResults, isSearching, search } = useSearch();
  const [searchText, setSearchText] = useState('');
  const isRTL = i18n.language === 'ar';

  // Perform search when searchText changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, search]);

  // Clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      search('');
    }
  }, [visible, search]);

  // Calculate total results
  const totalResults = searchResults.categories.length + 
                      searchResults.subcategories.length + 
                      searchResults.glossary.length + 
                      searchResults.diagrams.length + 
                      searchResults.templates.length;

  const handleResultPress = (item, type) => {
    onClose();
    
    if (type === 'subcategory') {
      // Navigate to the article
      navigation.navigate('Library');
      setTimeout(() => {
        navigation.navigate('Article', {
          subcategory: item,
          category: { id: item.categoryId }, // Include category info
          title: i18n.language === 'ar' ? item.titleAr || item.titleEn : item.titleEn || item.titleAr
        });
      }, 100);
    } else if (type === 'category') {
      // Navigate to library and expand the category
      navigation.navigate('Library');
    } else if (type === 'glossary') {
      // For glossary terms, show them in a modal or navigate to a glossary section
      // For now, navigate to library
      navigation.navigate('Library');
    } else if (type === 'template') {
      // Navigate to templates
      navigation.navigate('Templates');
    }
  };

  const getResultTitle = (item, type) => {
    if (type === 'glossary') {
      return i18n.language === 'ar' 
        ? item.titleAr || item.termArabic || item.titleEn || item.term || item.title
        : item.titleEn || item.term || item.title || item.titleAr || item.termArabic;
    }
    return i18n.language === 'ar' 
      ? item.titleAr || item.titleEn || item.title
      : item.titleEn || item.title || item.titleAr;
  };

  const getResultContent = (item, type) => {
    if (type === 'glossary') {
      return i18n.language === 'ar'
        ? item.definitionAr || item.definitionArabic || item.definitionEn || item.definition
        : item.definitionEn || item.definition || item.definitionAr || item.definitionArabic;
    } else if (type === 'subcategory') {
      return i18n.language === 'ar'
        ? item.contentAr || item.contentEn
        : item.contentEn || item.contentAr;
    } else {
      return i18n.language === 'ar'
        ? item.descriptionAr || item.descriptionArabic || item.descriptionEn || item.description
        : item.descriptionEn || item.description || item.descriptionAr || item.descriptionArabic;
    }
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '**$1**');
  };

  const renderSearchResult = (item, type) => {
    const title = getResultTitle(item, type);
    const content = getResultContent(item, type);
    const truncatedContent = content ? content.substring(0, 150) + '...' : '';
    const highlightedTitle = highlightSearchTerm(title, searchText);
    const highlightedContent = highlightSearchTerm(truncatedContent, searchText);

    return (
      <TouchableOpacity
        key={`${type}-${item.id}`}
        style={[
          styles.resultItem,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}
        onPress={() => handleResultPress(item, type)}
      >
        <View style={styles.resultContent}>
          <View style={[
            styles.resultHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.resultTitle,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {title}
            </Text>
            <View style={[
              styles.sectionBadge,
              { backgroundColor: getSectionColor(type) }
            ]}>
              <Text style={styles.sectionBadgeText}>
                {getSectionName(type)}
              </Text>
            </View>
          </View>
          
          {content && (
            <Text style={[
              styles.resultSnippet,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {truncatedContent}
            </Text>
          )}
        </View>
        
        <Icon 
          name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    );
  };

  const getSectionColor = (type) => {
    switch (type) {
      case 'category': return '#2196F3';
      case 'subcategory': return '#4CAF50';
      case 'glossary': return '#FF9800';
      case 'diagram': return '#9C27B0';
      case 'template': return '#F44336';
      default: return '#666';
    }
  };

  const getSectionName = (type) => {
    switch (type) {
      case 'category': return t('categories') || 'Categories';
      case 'subcategory': return t('articles') || 'Articles';
      case 'glossary': return t('glossary') || 'Glossary';
      case 'diagram': return t('diagrams') || 'Diagrams';
      case 'template': return t('templates') || 'Templates';
      default: return type;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.searchContainer,
          { top: HEADER_HEIGHT }
        ]}>
          {/* Search Input */}
          <View style={[
            styles.searchInputContainer,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Icon 
              name="search" 
              size={20} 
              color="#666" 
              style={[
                styles.searchIcon,
                isRTL ? { marginLeft: 10, marginRight: 0 } : { marginRight: 10, marginLeft: 0 }
              ]}
            />
            <TextInput
              style={[
                styles.searchInput,
                { textAlign: isRTL ? 'right' : 'left' }
              ]}
              placeholder={t('search_placeholder') || 'Search articles, glossary, templates...'}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Results Section */}
          <ScrollView style={styles.resultsContainer}>
            {searchText.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={[
                  styles.resultsCount,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {totalResults} {t('documents_match') || 'documents match your search'}
                </Text>
              </View>
            )}

            {isSearching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>
                  {t('searching') || 'Searching...'}
                </Text>
              </View>
            )}

            {!isSearching && searchText.length > 0 && totalResults === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={[
                  styles.noResultsText,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {t('no_results') || 'No results found'}
                </Text>
                <Text style={[
                  styles.noResultsSubtext,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {t('try_different_keywords') || 'Try different keywords or check spelling'}
                </Text>
              </View>
            )}

            {/* Results by section */}
            {searchResults.subcategories.length > 0 && (
              <View style={styles.sectionResults}>
                <Text style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  WITHIN SECTION
                </Text>
                {searchResults.subcategories.map(item => renderSearchResult(item, 'subcategory'))}
              </View>
            )}

            {searchResults.categories.length > 0 && (
              <View style={styles.sectionResults}>
                <Text style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  CATEGORIES
                </Text>
                {searchResults.categories.map(item => renderSearchResult(item, 'category'))}
              </View>
            )}

            {searchResults.glossary.length > 0 && (
              <View style={styles.sectionResults}>
                <Text style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  GLOSSARY
                </Text>
                {searchResults.glossary.map(item => renderSearchResult(item, 'glossary'))}
              </View>
            )}

            {searchResults.templates.length > 0 && (
              <View style={styles.sectionResults}>
                <Text style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  TEMPLATES
                </Text>
                {searchResults.templates.map(item => renderSearchResult(item, 'template'))}
              </View>
            )}

            {searchResults.diagrams.length > 0 && (
              <View style={styles.sectionResults}>
                <Text style={[
                  styles.sectionTitle,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  DIAGRAMS
                </Text>
                {searchResults.diagrams.map(item => renderSearchResult(item, 'diagram'))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  resultsContainer: {
    maxHeight: height - HEADER_HEIGHT - 100,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  sectionResults: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  resultSnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SearchModal;