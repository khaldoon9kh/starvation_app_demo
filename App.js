import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SavedScreen from './src/screens/SavedScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import ExportScreen from './src/screens/ExportScreen';
import ArticleScreen from './src/screens/ArticleScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Header component
const AppHeader = ({title, showSearch = true, showMenu = true}) => (
  <View style={styles.header}>
    <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
    <View style={styles.headerContent}>
      <Text style={styles.arabicText}>العربية</Text>
      <View style={styles.headerIcons}>
        {showSearch && (
          <Icon name="search" size={24} color="#4CAF50" style={styles.icon} />
        )}
        {showMenu && (
          <Icon name="menu" size={24} color="#4CAF50" style={styles.icon} />
        )}
      </View>
    </View>
  </View>
);

// Stack navigator for Library (includes article details)
const LibraryStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="LibraryMain" component={LibraryScreen} />
    <Stack.Screen name="Article" component={ArticleScreen} />
  </Stack.Navigator>
);

// Stack navigator for Templates (includes export screen)
const TemplatesStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="TemplatesMain" component={TemplatesScreen} />
    <Stack.Screen name="Export" component={ExportScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Library') {
          iconName = 'library-books';
        } else if (route.name === 'Saved') {
          iconName = 'bookmark';
        } else if (route.name === 'Templates') {
          iconName = 'description';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
      tabBarStyle: styles.tabBar,
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Library" component={LibraryStack} />
    <Tab.Screen name="Saved" component={SavedScreen} />
    <Tab.Screen name="Templates" component={TemplatesStack} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <AppHeader />
        <TabNavigator />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 10,
    elevation: 3,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arabicText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
});

export default App;
