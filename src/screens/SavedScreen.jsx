import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SavedScreen = () => {
  const savedItems = [
    {
      id: 1,
      title: 'Rule 1: Do No Harm',
      color: '#4CAF50'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>THESE ARE YOUR SAVED ITEMS</Text>
        
        {savedItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.savedItem, {borderLeftColor: item.color}]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Icon name="keyboard-arrow-right" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ))}
        
        {savedItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved items yet</Text>
            <Text style={styles.emptySubText}>
              Save articles from the Library to access them here
            </Text>
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
  savedItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemTitle: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SavedScreen;
