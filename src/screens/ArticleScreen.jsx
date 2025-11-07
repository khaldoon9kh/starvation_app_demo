import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { useBookmarks, useGlossary } from '../hooks/useFirebaseData';

const ArticleScreen = ({route, navigation}) => {
  const { t, i18n } = useTranslation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { glossaryTerms } = useGlossary();
  const { title, category, subcategory } = route.params;
  const isRTL = i18n.language === 'ar';
  
  // Modal state for glossary popup
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const articleTitle = title || (i18n.language === 'ar' ? subcategory?.titleAr || subcategory?.titleEn : subcategory?.titleEn) || 'Article';
  const content = subcategory ? (i18n.language === 'ar' ? subcategory.contentAr || subcategory.contentEn : subcategory.contentEn || subcategory.contentAr) : 'Content not available';

  // Function to find glossary term by name
  const findGlossaryTerm = (termName) => {
    if (!glossaryTerms || !Array.isArray(glossaryTerms)) return null;
    
    return glossaryTerms.find(term => {
      // Handle different possible field names for titles
      const titleEn = (term.titleEn || term.term || term.title)?.toLowerCase();
      const titleAr = (term.titleAr || term.termArabic)?.toLowerCase();
      const searchTerm = termName.toLowerCase().trim();
      
      return titleEn === searchTerm || titleAr === searchTerm ||
             titleEn?.includes(searchTerm) || titleAr?.includes(searchTerm);
    });
  };

  // Function to handle term click
  const handleTermClick = (termName) => {
    const term = findGlossaryTerm(termName);
    if (term) {
      setSelectedTerm(term);
      setIsModalVisible(true);
    }
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTerm(null);
  };

  // Function to process content and replace {Term} with clickable components
  const processContentWithTerms = (text) => {
    if (!text) return text;
    
    // Replace {Term} patterns with markdown links that we can handle
    return text.replace(/\{([^}]+)\}/g, (match, termName) => {
      const term = findGlossaryTerm(termName);
      if (term) {
        // Use a special markdown link format that we can intercept
        return `[${termName}](glossary://term/${encodeURIComponent(termName)})`;
      }
      return match; // Return original if term not found
    });
  };
  
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
      <View style={[
        styles.articleHeader,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.articleTitle,
          { textAlign: isRTL ? 'right' : 'center' }
        ]}>{articleTitle}</Text>
        
        <View style={[
          styles.headerActions,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
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
        <Text style={[
          styles.sectionTitle,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>{articleTitle}</Text>
        
        <Markdown 
          style={isRTL ? {...markdownStyles, ...rtlMarkdownStyles} : markdownStyles}
          onLinkPress={(url) => {
            // Handle glossary term links
            if (url.startsWith('glossary://term/')) {
              const termName = decodeURIComponent(url.replace('glossary://term/', ''));
              handleTermClick(termName);
              return false; // Prevent default link handling
            }
            return true; // Allow normal links to be handled
          }}
        >
          {processContentWithTerms(content) || `This section provides comprehensive information about **${articleTitle.toLowerCase()}**. Content will be loaded from Firebase when available.\n\n### Key Features\n- Dynamic content loading\n- Markdown formatting support\n- Multi-language support\n- Glossary term highlighting\n\n### Sample Content\nWhen conducting an {Investigation}, it's important to identify cases of {Malnutrition} early. Click on the highlighted terms to see their definitions from the glossary.\n\nThis demonstrates how {Sample Term} highlighting works in the content.`}
        </Markdown>

        <Text style={[
          styles.sectionTitle,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>Related Resources</Text>
        
        <TouchableOpacity style={[
          styles.relatedLink,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <Text style={[
            styles.linkText,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>Related Template: Investigation Checklist</Text>
          <Icon 
            name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
            size={20} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={[
          styles.relatedLink,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <Text style={[
            styles.linkText,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>Related Article: Basic Investigation Standards</Text>
          <Icon 
            name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
            size={20} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Glossary Term Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isRTL && styles.rtlModal
          ]}>
            {selectedTerm && (
              <>
                <View style={[
                  styles.modalHeader,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}>
                  <Text style={[
                    styles.modalTitle,
                    { textAlign: isRTL ? 'right' : 'left' }
                  ]}>
                    {i18n.language === 'ar' 
                      ? selectedTerm.titleAr || selectedTerm.termArabic || selectedTerm.titleEn || selectedTerm.term || selectedTerm.title
                      : selectedTerm.titleEn || selectedTerm.term || selectedTerm.title || selectedTerm.titleAr || selectedTerm.termArabic
                    }
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <Text style={[
                    styles.modalDefinition,
                    { textAlign: isRTL ? 'right' : 'left' }
                  ]}>
                    {i18n.language === 'ar'
                      ? selectedTerm.definitionAr || selectedTerm.definitionArabic || selectedTerm.definitionEn || selectedTerm.definition || 'Definition not available'
                      : selectedTerm.definitionEn || selectedTerm.definition || selectedTerm.definitionAr || selectedTerm.definitionArabic || 'Definition not available'
                    }
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxWidth: Dimensions.get('window').width - 40,
    minWidth: Dimensions.get('window').width - 80,
    maxHeight: Dimensions.get('window').height * 0.7,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    flex: 1,
  },
  modalDefinition: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  rtlModal: {
    alignItems: 'flex-end',
  },
});

const markdownStyles = {
  // Text styles
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  // Heading styles
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 15,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 18,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 10,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 14,
    marginBottom: 8,
  },
  // Paragraph styles
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  // List styles
  bullet_list: {
    marginBottom: 15,
  },
  ordered_list: {
    marginBottom: 15,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet_list_icon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  bullet_list_content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  ordered_list_icon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  ordered_list_content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  // Emphasis styles
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  em: {
    fontStyle: 'italic',
    color: '#333',
  },
  // Code styles
  code_inline: {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderRadius: 3,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#d63384',
  },
  code_block: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  fence: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  // Link styles
  link: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // Blockquote styles
  blockquote: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingLeft: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  // Table styles (if needed)
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  thead: {
    backgroundColor: '#f8f9fa',
  },
  tbody: {},
  th: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  td: {
    padding: 12,
  },
};

// RTL-specific markdown styles
const rtlMarkdownStyles = {
  text: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  paragraph: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heading1: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heading2: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heading3: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heading4: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  list_item: {
    flexDirection: 'row-reverse',
  },
  bullet_list_icon: {
    marginLeft: 8,
    marginRight: 0,
  },
  ordered_list_icon: {
    marginLeft: 8,
    marginRight: 0,
  },
  bullet_list_content: {
    textAlign: 'right',
  },
  ordered_list_content: {
    textAlign: 'right',
  },
  blockquote: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#4CAF50',
    paddingLeft: 0,
    paddingRight: 15,
    textAlign: 'right',
  },
  code_block: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#4CAF50',
    textAlign: 'right',
  },
  fence: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#4CAF50',
    textAlign: 'right',
  },
};

export default ArticleScreen;
