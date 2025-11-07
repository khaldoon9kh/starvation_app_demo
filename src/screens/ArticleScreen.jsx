import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useBookmarks } from '../hooks/useFirebaseData';

const ArticleScreen = ({route, navigation}) => {
  const { t, i18n } = useTranslation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { title, category, subcategory } = route.params;
  
  const articleTitle = title || (i18n.language === 'ar' ? subcategory?.titleArabic || subcategory?.title : subcategory?.title) || 'Article';
  const content = subcategory ? (i18n.language === 'ar' ? subcategory.contentAr || subcategory.contentEn : subcategory.contentEn || subcategory.contentAr) : 'Content not available';
  
  const itemIsBookmarked = subcategory ? isBookmarked(subcategory.id, 'subcategory') : false;

  const toggleSave = async () => {
    if (!subcategory) return;
    
    if (itemIsBookmarked) {
      await removeBookmark(subcategory.id, 'subcategory');
    } else {
      await addBookmark({
        ...subcategory,
        type: 'subcategory'
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Article Header */}
      <View style={styles.articleHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <Text style={styles.articleTitle}>{articleTitle}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={toggleSave}>
            <Icon 
              name={itemIsBookmarked ? "bookmark" : "bookmark-border"} 
              size={24} 
              color="#4CAF50" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Article Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{articleTitle}</Text>
        <Text style={styles.paragraph}>
          {content || `This section provides comprehensive information about ${articleTitle.toLowerCase()}. Content will be loaded from Firebase when available.`}
        </Text>

        <Text style={styles.sectionTitle}>Key Elements</Text>
        <Text style={styles.paragraph}>
          • Legal basis and foundation{'\n'}
          • Procedural requirements{'\n'}
          • Documentation standards{'\n'}
          • Best practices for implementation{'\n'}
          • Common challenges and solutions
        </Text>

        <Text style={styles.sectionTitle}>Application</Text>
        <Text style={styles.paragraph}>
          This framework is essential for practitioners working on starvation-related crimes 
          and violations. It provides the necessary legal and procedural foundation for 
          conducting thorough investigations and building strong cases.
        </Text>

        <Text style={styles.sectionTitle}>Related Resources</Text>
        <TouchableOpacity style={styles.relatedLink}>
          <Text style={styles.linkText}>Related Template: Investigation Checklist</Text>
          <Icon name="keyboard-arrow-right" size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.relatedLink}>
          <Text style={styles.linkText}>Related Article: Basic Investigation Standards</Text>
          <Icon name="keyboard-arrow-right" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  articleHeader: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchButton: {
    padding: 5,
    marginRight: 10,
  },
  saveButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  relatedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
  },
});

export default ArticleScreen;
