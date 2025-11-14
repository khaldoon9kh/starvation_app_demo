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

  // Perform search when searchText changes (language-aware)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(searchText, i18n.language);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, search, i18n.language]);

  // Clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      search('', i18n.language);
    }
  }, [visible, search, i18n.language]);

  // Calculate total results
  const totalResults = searchResults.categories.length + 
                      searchResults.subcategories.length + 
                      searchResults.glossary.length + 
                      searchResults.diagrams.length + 
                      searchResults.templates.length;

  const handleResultPress = (item, type) => {
    onClose();
    
    if (type === 'subcategory') {
      // Check if item has content
      const hasContent = !!(item.contentEn || item.contentAr || item.hasContent);
      
      console.log('🔘 Search result pressed:', {
        type,
        id: item.id,
        level: item.level,
        hasContent,
        parentSubcategoryId: item.parentSubcategoryId,
        titleEn: item.titleEn?.substring(0, 50),
        titleAr: item.titleAr?.substring(0, 50)
      });
      
      if (hasContent) {
        // Clean up the item object - remove nested arrays to avoid navigation issues
        const cleanItem = {
          id: item.id,
          categoryId: item.categoryId,
          titleEn: item.titleEn,
          titleAr: item.titleAr,
          contentEn: item.contentEn,
          contentAr: item.contentAr,
          descriptionEn: item.descriptionEn,
          descriptionAr: item.descriptionAr,
          level: item.level,
          parentSubcategoryId: item.parentSubcategoryId,
          order: item.order,
          hasContent: item.hasContent,
          colorHex: item.colorHex,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
          // Intentionally exclude subSubCategories array
        };
        
        // Navigate directly to the article screen with content
        const navParams = {
          subcategory: cleanItem,
          category: { id: item.categoryId },
          title: i18n.language === 'ar' ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)
        };
        
        console.log('📍 Navigating to Article with params:', {
          subcategoryId: navParams.subcategory.id,
          categoryId: navParams.category.id,
          title: navParams.title,
          level: navParams.subcategory.level,
          hasContentEn: !!navParams.subcategory.contentEn,
          hasContentAr: !!navParams.subcategory.contentAr
        });
        
        // Navigate to Library tab first, which mounts the LibraryStack
        navigation.navigate('Library');
        
        // Then navigate to Article within that stack after a brief delay
        // This ensures proper back navigation to Library instead of Home
        setTimeout(() => {
          navigation.navigate('Library', {
            screen: 'Article',
            params: navParams
          });
        }, 50);
      } else {
        // No content - just a header/category - go to Library
        console.log('📚 No content found - navigating to Library instead');
        navigation.navigate('Library');
      }
    } else if (type === 'category') {
      // Navigate to library to show the category
      navigation.navigate('Library');
    } else if (type === 'glossary') {
      // Navigate to library (glossary terms are shown there)
      navigation.navigate('Library');
    } else if (type === 'template') {
      // Navigate to the specific template category
      const category = i18n.language === 'ar' 
        ? (item.categoryAR || item.categoryEN || item.category)
        : (item.categoryEN || item.categoryAR || item.category);
      
      if (category) {
        // Navigate to Templates tab first
        navigation.navigate('Templates');
        
        // Then navigate to CategoryTemplates within that stack
        // This ensures proper back navigation
        setTimeout(() => {
          navigation.navigate('Templates', {
            screen: 'CategoryTemplates',
            params: {
              category: category,
              categoryDisplayName: category
            }
          });
        }, 50);
      } else {
        navigation.navigate('Templates');
      }
    } else if (type === 'diagram') {
      // Diagrams are shown in articles, so just go to library
      navigation.navigate('Library');
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

  // Extract contextual snippet around the search term
  const getContextualSnippet = (text, searchTerm, maxLength = 150) => {
    if (!text || !searchTerm) return text?.substring(0, maxLength) + '...' || '';
    
    const lowerText = text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerSearchTerm);
    
    // If search term not found, return beginning of text
    if (index === -1) {
      return text.substring(0, maxLength) + '...';
    }
    
    // Calculate start and end positions for snippet
    const padding = Math.floor((maxLength - searchTerm.length) / 2);
    let start = Math.max(0, index - padding);
    let end = Math.min(text.length, index + searchTerm.length + padding);
    
    // Adjust to not cut words in the middle
    if (start > 0) {
      const spaceIndex = text.lastIndexOf(' ', start);
      if (spaceIndex > start - 20 && spaceIndex > 0) {
        start = spaceIndex + 1;
      }
    }
    
    if (end < text.length) {
      const spaceIndex = text.indexOf(' ', end);
      if (spaceIndex > 0 && spaceIndex < end + 20) {
        end = spaceIndex;
      }
    }
    
    // Build snippet with ellipsis
    let snippet = '';
    if (start > 0) snippet += '...';
    snippet += text.substring(start, end);
    if (end < text.length) snippet += '...';
    
    return snippet;
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '**$1**');
  };

  // Render text with highlighted search terms
  const renderHighlightedText = (text, searchTerm, baseStyle, isRTL) => {
    if (!text || !searchTerm) {
      return (
        <Text style={[baseStyle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {text}
        </Text>
      );
    }
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <Text style={[baseStyle, { textAlign: isRTL ? 'right' : 'left' }]}>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
          return (
            <Text
              key={index}
              style={isMatch ? styles.highlightedText : {}}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderSearchResult = (item, type) => {
    const title = getResultTitle(item, type);
    const content = getResultContent(item, type);
    
    // Get contextual snippet around search term
    const snippet = content ? getContextualSnippet(content, searchText, 180) : '';
    
    // Highlight search term in title and snippet
    const highlightedTitle = highlightSearchTerm(title, searchText);
    const highlightedSnippet = highlightSearchTerm(snippet, searchText);

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
            {renderHighlightedText(title, searchText, styles.resultTitle, isRTL)}
            <View style={[
              styles.sectionBadge,
              { backgroundColor: getSectionColor(type) }
            ]}>
              <Text style={styles.sectionBadgeText}>
                {getSectionName(type)}
              </Text>
            </View>
          </View>
          
          {snippet && (
            <View style={[
              styles.snippetContainer,
              { alignItems: isRTL ? 'flex-end' : 'flex-start' }
            ]}>
              {renderHighlightedText(snippet, searchText, styles.resultSnippet, isRTL)}
            </View>
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
  snippetContainer: {
    marginTop: 5,
  },
  highlightedText: {
    backgroundColor: '#FFEB3B',
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
});

export default SearchModal;