import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';

const ContactScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Handle link presses
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    return false; // Prevent default behavior
  };

  // Markdown styles
  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
      textAlign: isRTL ? 'right' : 'left',
    },
    link: {
      color: '#4CAF50',
      textDecorationLine: 'underline',
    },
    paragraph: {
      marginBottom: 12,
    },
    hr: {
      backgroundColor: '#ddd',
      height: 1,
      marginVertical: 16,
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
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
          styles.headerTitle,
          { textAlign: isRTL ? 'right' : 'center' }
        ]}>
          {t('contact') || 'Contact'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={[
            styles.title,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('contact') || 'Contact'}
          </Text>
          
          <Markdown 
            style={markdownStyles}
            onLinkPress={(url) => handleLinkPress(url)}
          >
            {t('contact_description') || 'Content will be provided later. This page will contain contact information and ways to reach support.'}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
});

export default ContactScreen;