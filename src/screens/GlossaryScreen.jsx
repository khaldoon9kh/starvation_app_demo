import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useGlossary } from '../hooks/useFirebaseData';

const GlossaryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { glossaryTerms, loading, error } = useGlossary();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (glossaryTerms) {
      filterTerms(searchQuery);
    }
  }, [glossaryTerms, searchQuery, i18n.language]);

  const filterTerms = (query) => {
    if (!query.trim()) {
      setFilteredTerms(glossaryTerms);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = glossaryTerms.filter(term => {
      const termText = isRTL 
        ? (term.termArabic || term.term || '').toLowerCase()
        : (term.term || term.termArabic || '').toLowerCase();
      
      const definitionText = isRTL
        ? (term.definitionArabic || term.definition || '').toLowerCase()
        : (term.definition || term.definitionArabic || '').toLowerCase();

      return termText.includes(lowerQuery) || definitionText.includes(lowerQuery);
    });

    setFilteredTerms(filtered);
  };

  const getTermTitle = (term) => {
    if (isRTL) {
      return term.termArabic || term.term || 'Unknown Term';
    }
    return term.term || term.termArabic || 'Unknown Term';
  };

  const getTermDefinition = (term) => {
    if (isRTL) {
      return term.definitionArabic || term.definition || '';
    }
    return term.definition || term.definitionArabic || '';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'المسرد' : 'Glossary'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'المسرد' : 'Glossary'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>{t('common.error', 'Error')}: {error}</Text>
        </View>
      </View>
    );
  }

  if (!glossaryTerms || glossaryTerms.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'المسرد' : 'Glossary'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <Icon name="menu-book" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {i18n.language === 'ar' ? 'لا توجد مصطلحات متاحة' : 'No glossary terms available'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Icon 
            name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
            size={28} 
            color="#333" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {i18n.language === 'ar' ? 'المسرد' : 'Glossary'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isRTL && styles.searchInputRTL]}
          placeholder={i18n.language === 'ar' ? 'ابحث في المصطلحات...' : 'Search terms...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Terms Count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, isRTL && styles.rtlText]}>
          {filteredTerms.length} {i18n.language === 'ar' ? 'مصطلح' : 'terms'}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {filteredTerms.map((term, index) => (
          <View key={term.id || index} style={styles.termCard}>
            <View style={styles.termHeader}>
              <Icon name="bookmark" size={20} color="#4CAF50" style={styles.termIcon} />
              <Text style={[styles.termTitle, isRTL && styles.rtlText]}>
                {getTermTitle(term)}
              </Text>
            </View>
            <Text style={[styles.termDefinition, isRTL && styles.rtlText]}>
              {getTermDefinition(term)}
            </Text>
          </View>
        ))}

        {filteredTerms.length === 0 && searchQuery.trim() !== '' && (
          <View style={styles.noResultsContainer}>
            <Icon name="search-off" size={48} color="#ccc" />
            <Text style={[styles.noResultsText, isRTL && styles.rtlText]}>
              {i18n.language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  searchInputRTL: {
    textAlign: 'right',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  termCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termIcon: {
    marginRight: 8,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
  },
  termDefinition: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  rtlText: {
    textAlign: 'right',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default GlossaryScreen;
