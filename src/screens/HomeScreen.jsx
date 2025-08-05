import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>OVERVIEW</Text>
        
        <Text style={styles.welcomeText}>
          Welcome to the Global Rights Compliance (GRC) Starvation Accountability app!{' '}
          <Text style={styles.normalText}>
            This mobile app is based on the Second Edition (2022) of GRC's unique{' '}
          </Text>
          <Text style={styles.linkText}>Starvation Training Manual</Text>
          <Text style={styles.normalText}>
            , a toolkit designed to assist a wide range of professionals and practitioners in 
            identifying, investigating and addressing the deliberate use of starvation as a 
            weapon of war and tool against civilians.
          </Text>
        </Text>

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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;
