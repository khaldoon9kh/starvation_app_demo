import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ExportScreen = ({navigation}) => {
  const exportCategories = [
    'All Templates and Checklists',
    'Basic Interview',
    'Special Interview',
    'Evidence Collection',
    'Investigation Preparation',
    'Forum Shopping'
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SELECT TEMPLATES & CHECKLISTS TO EXPORT</Text>
        
        {exportCategories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Icon name="keyboard-arrow-right" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ))}
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
  categoryItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTitle: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});

export default ExportScreen;
