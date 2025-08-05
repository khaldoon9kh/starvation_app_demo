import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ArticleScreen = ({route, navigation}) => {
  const [isSaved, setIsSaved] = useState(false);
  const {title} = route.params;

  const toggleSave = () => {
    setIsSaved(!isSaved);
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
        
        <Text style={styles.articleTitle}>{title}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={toggleSave}>
            <Icon 
              name={isSaved ? "bookmark" : "bookmark-border"} 
              size={24} 
              color="#4CAF50" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Article Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.paragraph}>
          This section provides comprehensive information about {title.toLowerCase()}. 
          The content here would include detailed legal frameworks, procedural guidelines, 
          and practical considerations for practitioners working in international criminal law.
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
