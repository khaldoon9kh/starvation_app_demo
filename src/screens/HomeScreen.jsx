import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFirebaseData, useDataStatus } from '../hooks/useFirebaseData';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { categories, subcategories, glossaryTerms, diagrams, templates } = useFirebaseData();
  const { isLoading, hasError, error, isOnline, lastUpdated } = useDataStatus();
  
  // Calculate statistics
  const stats = {
    categories: categories.length,
    subcategories: Object.values(subcategories).flat().length,
    glossaryTerms: glossaryTerms.length,
    diagrams: diagrams.length,
    templates: templates.length,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>OVERVIEW</Text>
        
        <Text style={styles.welcomeText}>
          {t('welcome')}
        </Text>
        
        <Text style={styles.normalText}>
          This mobile app is based on the Second Edition (2022) of GRC's unique{' '}
          <Text style={styles.linkText}>Starvation Training Manual</Text>
          , a toolkit designed to assist a wide range of professionals and practitioners in 
          identifying, investigating and addressing the deliberate use of starvation as a 
          weapon of war and tool against civilians.
        </Text>

        {/* Data Status Section */}
        <View style={styles.dataStatusContainer}>
          <Text style={styles.sectionTitle}>Content Status</Text>
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading content from Firebase...</Text>
            </View>
          )}
          
          {hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubText}>
                {isOnline ? 'Using cached content' : 'Check your internet connection'}
              </Text>
            </View>
          )}
          
          {!isLoading && !hasError && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ Content loaded successfully</Text>
              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Content Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.subcategories}</Text>
              <Text style={styles.statLabel}>Subcategories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.glossaryTerms}</Text>
              <Text style={styles.statLabel}>Glossary Terms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.diagrams}</Text>
              <Text style={styles.statLabel}>Diagrams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.templates}</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
          </View>
        </View>

        <Text style={styles.normalText}>
          The purpose of this app is to provide users with a succinct, portable version of the 
          Starvation Training Manual, setting out key information to assist practitioners in 
          responding to starvation crimes and violations. The app is divided into the 
          following sections:
        </Text>

        <Text style={styles.sectionTitle}>Law on Starvation:</Text>
        <Text style={styles.normalText}>
          Sets out the international criminal, humanitarian and human rights law frameworks 
          relevant to starvation-related crimes and violations. Particularly useful for 
          practitioners, it explains on an introductory level what to look for in a starvation 
          investigation by analysing under international criminal law (1) the elements of the 
          war crime of starvation, (2) mental elements utilised to
        </Text>
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
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 20,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 15,
  },
  linkText: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  // Firebase integration styles
  dataStatusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorText: {
    color: '#c62828',
    fontWeight: '500',
  },
  errorSubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  successContainer: {
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  successText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  lastUpdatedText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;
