import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LibraryScreen = ({navigation}) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const libraryData = [
    {
      id: 'law-starvation',
      title: 'Law on Starvation',
      color: '#2196F3',
      expandable: true,
      items: [
        'ICL Framework',
        'IHL Framework', 
        'IHRL Framework',
        'IHRL at a Glance',
        'Human Rights Obligations',
        'Starvation and ESC Rights',
        'Starvation and CP Rights'
      ]
    },
    {
      id: 'basic-investigation',
      title: 'Basic Investigation Standards',
      color: '#2196F3',
      expandable: false
    },
    {
      id: 'remedies',
      title: 'Remedies',
      color: '#2196F3',
      expandable: false
    },
    {
      id: 'starvation-crimes',
      title: 'Starvation-Related Crimes',
      color: '#2196F3',
      expandable: false
    },
    {
      id: 'glossary',
      title: 'Glossary',
      color: '#4CAF50',
      expandable: false
    },
    {
      id: 'diagrams',
      title: 'Diagrams',
      color: '#4CAF50',
      expandable: false
    }
  ];

  const renderSection = (section) => (
    <View key={section.id} style={styles.sectionContainer}>
      <TouchableOpacity
        style={[styles.sectionItem, {borderLeftColor: section.color}]}
        onPress={() => {
          if (section.expandable) {
            toggleSection(section.id);
          } else {
            navigation.navigate('Article', {title: section.title});
          }
        }}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Icon 
          name={section.expandable ? 
            (expandedSections[section.id] ? 'keyboard-arrow-down' : 'keyboard-arrow-right') : 
            'keyboard-arrow-right'
          } 
          size={24} 
          color="#4CAF50" 
        />
      </TouchableOpacity>
      
      {section.expandable && expandedSections[section.id] && section.items && (
        <View style={styles.subItemsContainer}>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.subItem, {borderLeftColor: section.color}]}
              onPress={() => navigation.navigate('Article', {title: item})}>
              <Text style={styles.subItemTitle}>{item}</Text>
              <Icon name="keyboard-arrow-right" size={20} color="#4CAF50" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>THIS IS YOUR STARVATION LIBRARY</Text>
        
        {libraryData.map(section => renderSection(section))}
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
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
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
    marginTop: 5,
  },
  subItem: {
    backgroundColor: '#fff',
    padding: 15,
    paddingLeft: 30,
    borderRadius: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    elevation: 1,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  subItemTitle: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
});

export default LibraryScreen;
