import React, { useState, useEffect, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, I18nManager, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import './src/i18n/i18n';
import MenuModal from './src/components/MenuModal';
import SearchModal from './src/components/SearchModal';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SavedScreen from './src/screens/SavedScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import CategoryTemplatesScreen from './src/screens/CategoryTemplatesScreen';
import ArticleScreen from './src/screens/ArticleScreen';
import DiagramsScreen from './src/screens/DiagramsScreen';
import GlossaryScreen from './src/screens/GlossaryScreen';
// Import menu screens
import AboutScreen from './src/screens/AboutScreen';
import ContactScreen from './src/screens/ContactScreen';
import CopyrightScreen from './src/screens/CopyrightScreen';
import DisclaimerScreen from './src/screens/DisclaimerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UserGuideScreen from './src/screens/UserGuideScreen';
import LandingScreen from './src/screens/LandingScreen';
import SplashScreen from './src/screens/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Context that carries the currently-active leaf route name to any consumer (e.g. AppHeader)
const ActiveRouteContext = createContext('Home');

// Recursively walk navigation state to find the name of the currently visible leaf screen
const getActiveRouteName = (state) => {
  if (!state?.routes) return null;
  const route = state.routes[state.index ?? 0];
  if (route?.state) return getActiveRouteName(route.state);
  return route?.name ?? null;
};

// Map every route name to its i18n translation key
const ROUTE_TITLE_MAP = {
  Home:               'home',
  LibraryMain:        'library',
  Article:            'subcategory',
  Diagrams:           'diagramsLabel',
  Glossary:           'glossary',
  Saved:              'bookmarks',
  Templates:      'templatesTab',
  TemplatesMain:  'templatesTab',
  CategoryTemplates:  'categories',
  About:              'about',
  Contact:            'contact',
  Copyright:          'copyright',
  Disclaimer:         'disclaimer',
  Settings:           'settings',
  UserGuide:          'userguide',
};

// Header component
const AppHeader = ({showSearch = true, showMenu = true, onMenuPress, onSearchPress}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Read the currently-active route name from context (set at NavigationContainer level)
  const activeRouteName = useContext(ActiveRouteContext);
  const titleKey = ROUTE_TITLE_MAP[activeRouteName];
  const title = titleKey ? t(titleKey) : t('app.name');
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    
    // Set RTL for Arabic
    I18nManager.forceRTL(newLang === 'ar');
    // Note: In a real app, you might need to restart the app for RTL to take full effect
  };

  return (
    <View style={styles.header}>
      <StatusBar style="light" backgroundColor="#4CAF50" />
      <View style={[
        styles.headerContent,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
        <View style={[
          styles.headerIcons,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress}>
              <Icon 
                name="menu" 
                size={24} 
                color="#4CAF50" 
                style={[
                  styles.icon,
                  isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15, marginRight: 0 }
                ]} 
              />
            </TouchableOpacity>
          )}
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress}>
              <Icon 
                name="search" 
                size={24} 
                color="#4CAF50" 
                style={[
                  styles.icon,
                  isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15, marginRight: 0 }
                ]} 
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.arabicText,
            { textAlign: isRTL ? 'right' : 'center' }
          ]}>
            {title}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleLanguage}>
          <Text style={styles.languageText}>
            {i18n.language === 'ar' ? t('english') : t('arabic')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stack navigator for Library (includes article details and diagrams)
const LibraryStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="LibraryMain" component={LibraryScreen} />
    <Stack.Screen name="Article" component={ArticleScreen} />
    <Stack.Screen name="Diagrams" component={DiagramsScreen} />
    <Stack.Screen name="Glossary" component={GlossaryScreen} />
  </Stack.Navigator>
);

// Stack navigator for Templates
const TemplatesStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="TemplatesMain" component={TemplatesScreen} />
    <Stack.Screen name="CategoryTemplates" component={CategoryTemplatesScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const TabNavigator = () => {
  const { t } = useTranslation();
  
  return (
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStack}
        options={{ tabBarLabel: t('library') }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen}
        options={{ tabBarLabel: t('saved') }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesStack}
        options={{ tabBarLabel: t('templatesTab') }}
      />
    </Tab.Navigator>
  );
};

// Main stack navigator that includes both tab navigator and menu screens
const MainStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="HomeTabs" component={TabNavigator} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Contact" component={ContactScreen} />
    <Stack.Screen name="Copyright" component={CopyrightScreen} />
    <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
  </Stack.Navigator>
);

// Component with header that includes tab navigator
const AppWithHeader = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        onMenuPress={toggleMenu} 
        onSearchPress={toggleSearch} 
      />
      <MainStack />
      <MenuModal 
        visible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
      <SearchModal 
        visible={isSearchVisible} 
        onClose={() => setIsSearchVisible(false)} 
      />
    </View>
  );
};

// Root navigation with splash screen
const RootNavigator = () => {
  const RootStack = createStackNavigator();

  return (
    <RootStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      {/* Splash screen - checks for content and routes accordingly */}
      <RootStack.Screen name="Splash" component={SplashScreen} />
      
      {/* Landing screen - shown when no content exists */}
      <RootStack.Screen name="Landing" component={LandingScreen} />
      
      {/* Main app - shown when content exists */}
      <RootStack.Screen name="MainTabs" component={AppWithHeader} />
      
      {/* Settings screen - accessible from landing for content download */}
      <RootStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Settings' }}
      />
    </RootStack.Navigator>
  );
};

const navigationRef = createNavigationContainerRef();

const App = () => {
  // 'Home' is the correct default — it's the first tab shown inside MainTabs
  const [activeRoute, setActiveRoute] = useState('Home');

  return (
    <ActiveRouteContext.Provider value={activeRoute}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          // Fires once the navigator is fully mounted with all nested state
          const name = getActiveRouteName(navigationRef.getRootState());
          if (name) setActiveRoute(name);
        }}
        onStateChange={(state) => {
          const name = getActiveRouteName(state);
          if (name) setActiveRoute(name);
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </ActiveRouteContext.Provider>
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
  languageText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    // Margin will be handled dynamically based on RTL
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
