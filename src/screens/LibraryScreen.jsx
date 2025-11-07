import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useCategories, useSubcategories } from '../hooks/useFirebaseData';

const LibraryScreen = ({navigation}) => {
  const { t, i18n } = useTranslation();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = i18n.language === 'ar';

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic can be added here if needed
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const navigateToSubcategory = (category, subcategory) => {
    navigation.navigate('Article', { 
      category, 
      subcategory,
      title: i18n.language === 'ar' ? subcategory.titleArabic || subcategory.title : subcategory.title
    });
  };

  if (categoriesLoading && categories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading library content...</Text>
      </View>
    );
  }

  if (categoriesError && categories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading content</Text>
        <Text style={styles.errorSubText}>{categoriesError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }


      


  // Component to render subcategories for a category
  const SubcategoriesList = ({ categoryId }) => {
    const { subcategories, loading, error } = useSubcategories(categoryId);

    if (loading) {
      return (
        <View style={styles.loadingSubcategories}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading subcategories...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorSubcategories}>
          <Text style={styles.errorText}>Error loading subcategories</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.subItemsContainer,
        isRTL 
          ? { borderRightWidth: 4, borderRightColor: '#2196F3', borderLeftWidth: 0 }
          : { borderLeftWidth: 4, borderLeftColor: '#2196F3', borderRightWidth: 0 }
      ]}>
        {subcategories.map((subcategory) => (
          <View key={subcategory.id}>
            {subcategory.subSubCategories && subcategory.subSubCategories.length > 0 ? (
              // Render expandable subcategory with subSubCategories
              <View>
                <TouchableOpacity
                  style={[
                    styles.subItem, 
                    styles.expandableSubItem,
                    { 
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      borderLeftColor: isRTL ? 'transparent' : '#4CAF50',
                      borderRightColor: isRTL ? '#4CAF50' : 'transparent',
                      borderLeftWidth: isRTL ? 0 : 4,
                      borderRightWidth: isRTL ? 4 : 0,
                      marginBottom: expandedSubcategories[subcategory.id] ? 0 : 5,  
                      borderBottomLeftRadius: expandedSubcategories[subcategory.id] ? 0 : 6,
                      borderBottomRightRadius: expandedSubcategories[subcategory.id] ? 0 : 6,
                    }
                  ]}
                  onPress={() => toggleSubcategory(subcategory.id)}>
                  <Text style={[styles.subItemText, isRTL && styles.rtlText]}>
                    {i18n.language === 'ar' ? subcategory.titleAr || subcategory.titleEn : subcategory.titleEn}
                  </Text>
                  <Icon 
                    name={expandedSubcategories[subcategory.id] 
                      ? 'keyboard-arrow-down' 
                      : isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
                
                {expandedSubcategories[subcategory.id] && (
                  <View 
                    style={[
                    styles.subSubItemsContainer,
                    { 
                      borderLeftColor: isRTL ? 'transparent' : '#4CAF50',
                      borderRightColor: isRTL ? '#4CAF50' : 'transparent',
                      borderLeftWidth: isRTL ? 0 : 4,
                      borderRightWidth: isRTL ? 4 : 0,
                    }
                  ]}
                  >
                    {subcategory.subSubCategories.map((subSub) => (
                      <TouchableOpacity
                        key={subSub.id}
                        style={[
                          styles.subSubItem,
                          { 
                            flexDirection: isRTL ? 'row-reverse' : 'row',
                            borderLeftColor: isRTL ? 'transparent' : 'black',
                            borderRightColor: isRTL ? 'black' : 'transparent',
                            borderLeftWidth: isRTL ? 0 : 4,
                            borderRightWidth: isRTL ? 4 : 0,
                            marginLeft: 10,
                          }
                        ]}
                        onPress={() => navigateToSubcategory({ id: categoryId }, subSub)}>
                        <Text style={[styles.subSubItemText, isRTL && styles.rtlText]}>
                          {i18n.language === 'ar' ? subSub.titleAr || subSub.titleEn : subSub.titleEn}
                        </Text>
                        <Icon 
                          name={isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} 
                          size={16} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              // Render regular subcategory without subSubCategories
              <TouchableOpacity
                style={[
                    styles.subItem, 
                    styles.expandableSubItem,
                    { 
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      borderLeftColor: isRTL ? 'transparent' : '#4CAF50',
                      borderRightColor: isRTL ? '#4CAF50' : 'transparent',
                      borderLeftWidth: isRTL ? 0 : 4,
                      borderRightWidth: isRTL ? 4 : 0,
                    }
                  ]}
                onPress={() => navigateToSubcategory({ id: categoryId }, subcategory)}>
                <Text style={[styles.subItemText, isRTL && styles.rtlText]}>
                  {i18n.language === 'ar' ? subcategory.titleAr || subcategory.titleEn : subcategory.titleEn}
                </Text>
                <Icon 
                  name={isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderCategory = (category) => {
    return (
      <View key={category.id} style={styles.sectionContainer}>
        <TouchableOpacity
          style={[
            styles.sectionItem,
            { 
              flexDirection: isRTL ? 'row-reverse' : 'row',
              borderLeftColor: isRTL ? 'transparent' : '#2196F3',
              borderRightColor: isRTL ? '#2196F3' : 'transparent',
              borderLeftWidth: isRTL ? 0 : 4,
              borderRightWidth: isRTL ? 4 : 0,
            },
            expandedSections[category.id] 
              ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0} 
              : {borderBottomLeftRadius: 6, borderBottomRightRadius: 6}
          ]}
          onPress={() => toggleSection(category.id)}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {i18n.language === 'ar' ? category.titleAr || category.titleEn : category.titleEn}
          </Text>
          <Icon 
            name={expandedSections[category.id] 
              ? 'keyboard-arrow-down' 
              : isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        {expandedSections[category.id] && (
          <SubcategoriesList categoryId={category.id} />
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.rtlTitle]}>THIS IS YOUR STARVATION LIBRARY</Text>
        
        {categories.map(renderCategory)}
        
        {categories.length === 0 && !categoriesLoading && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isRTL && styles.rtlText]}>No content available</Text>
            <Text style={[styles.emptySubText, isRTL && styles.rtlText]}>Check your internet connection and try again</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  subItemsContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  expandableSubItem: {
    backgroundColor: '#fff',
    borderLeftColor: '#4CAF50',
  },
  subItem: {
    backgroundColor: '#fff',
    padding: 15,
    paddingLeft: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 5,
    elevation: 3,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  subItemTitle: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  subItemText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  // New styles for Firebase integration
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#c62828',
    fontWeight: '500',
    textAlign: 'center',
  },
  errorSubText: {
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingSubcategories: {
    padding: 15,
    alignItems: 'center',
  },
  errorSubcategories: {
    padding: 15,
    alignItems: 'center',
  },
  subSubItemsContainer: {
    paddingTop: 5,
    marginBottom: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,

  },
  subSubItem: {
    backgroundColor: '#fff',
    padding: 12,
    paddingLeft: 25,
    borderRadius: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 10,
  },
  subSubItemText: {
    fontSize: 13,
    color: '#000',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  // RTL-specific styles
  rtlTitle: {
    textAlign: 'right',
  },
  rtlText: {
    textAlign: 'right',
  },
});

export default LibraryScreen;
