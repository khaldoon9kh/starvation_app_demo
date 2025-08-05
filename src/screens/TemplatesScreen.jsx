import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TemplatesScreen = ({navigation}) => {
  const templates = [
    {
      id: 1,
      title: 'Witness Risk Checklist',
      description: 'A list of questions guiding the identification and mitigation of risks on a witness prior to, during, and after an interview',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Modes of Liability Checklist',
      description: 'A list of questions to guide an investigation into an incident involving multiple types of actors and various potential modes of liability.',
      color: '#4CAF50'
    },
    {
      id: 3,
      title: 'Risk Assessment Tool',
      description: 'A quick guide for the identification, assessment, mitigation and management of risks in an investigation.',
      color: '#4CAF50'
    },
    {
      id: 4,
      title: 'Trauma Victim Interview Guide',
      description: 'A list of bad and good practices based on a trauma-informed approach',
      color: '#4CAF50'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>All Templates and Checklists</Text>
        <Text style={styles.subtitle}>recommended investigation forms</Text>
        
        <View style={styles.templatesGrid}>
          {templates.map((template, index) => (
            <View key={template.id} style={styles.templateCard}>
              <View style={styles.documentPreview}>
                {/* Placeholder for document preview */}
                <View style={[styles.documentIcon, {backgroundColor: template.color}]}>
                  <Icon name="description" size={20} color="#fff" />
                </View>
                <View style={styles.documentContent}>
                  <View style={styles.documentLine} />
                  <View style={styles.documentLine} />
                  <View style={styles.documentLine} />
                  <View style={[styles.documentLine, {width: '60%'}]} />
                </View>
              </View>
              
              <Text style={styles.templateTitle}>{template.title}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => navigation.navigate('Export')}>
          <Text style={styles.exportButtonText}>Export Templates & Checklists</Text>
          <Icon name="file-download" size={20} color="#fff" />
        </TouchableOpacity>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
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
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default TemplatesScreen;
