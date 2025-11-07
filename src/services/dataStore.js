import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCategories,
  subscribeToCategories,
  getSubcategories,
  getGlossaryTerms,
  subscribeToGlossaryTerms,
  getDiagrams,
  subscribeToDiagrams,
  getTemplates,
  subscribeToTemplates,
  getAllContentForCache
} from './dataService';

class DataStore {
  constructor() {
    this.categories = [];
    this.subcategories = {};
    this.glossaryTerms = [];
    this.diagrams = [];
    this.templates = [];
    this.loading = false;
    this.error = null;
    this.lastUpdated = null;
    
    // Subscriptions
    this.unsubscribers = [];
    
    // Callbacks for state updates
    this.listeners = [];
  }

  // Add listener for state changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of state changes
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  // Get current state
  getState() {
    return {
      categories: this.categories,
      subcategories: this.subcategories,
      glossaryTerms: this.glossaryTerms,
      diagrams: this.diagrams,
      templates: this.templates,
      loading: this.loading,
      error: this.error,
      lastUpdated: this.lastUpdated
    };
  }

  // Load cached data from AsyncStorage
  async loadCachedData() {
    try {
      const cachedData = await AsyncStorage.getItem('appData');
      if (cachedData) {
        const data = JSON.parse(cachedData);
        this.categories = data.categories || [];
        this.subcategories = data.subcategories || {};
        this.glossaryTerms = data.glossary || [];
        this.diagrams = data.diagrams || [];
        this.templates = data.templates || [];
        this.lastUpdated = data.lastUpdated;
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
    return false;
  }

  // Save data to AsyncStorage
  async saveToCache() {
    try {
      const dataToCache = {
        categories: this.categories,
        subcategories: this.subcategories,
        glossary: this.glossaryTerms,
        diagrams: this.diagrams,
        templates: this.templates,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem('appData', JSON.stringify(dataToCache));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  // Initialize data - load from cache first, then sync with Firebase
  async initialize() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Load cached data first for immediate UI update
      const hasCache = await this.loadCachedData();
      
      if (hasCache) {
        console.log('Loaded cached data, syncing with Firebase...');
      }

      // Set up real-time subscriptions
      this.setupSubscriptions();

      // Initial load from Firebase
      await this.loadInitialData();

    } catch (error) {
      console.error('Error initializing data store:', error);
      this.error = error.message;
      this.loading = false;
      this.notifyListeners();
    }
  }

  // Load initial data from Firebase
  async loadInitialData() {
    try {
      // Load categories first as they're needed for subcategories
      const categories = await getCategories();
      this.categories = categories;
      this.notifyListeners();

      // Load other data in parallel
      const [glossaryTerms, diagrams, templates] = await Promise.all([
        getGlossaryTerms(),
        getDiagrams(),
        getTemplates()
      ]);

      this.glossaryTerms = glossaryTerms;
      this.diagrams = diagrams;
      this.templates = templates;

      // Load subcategories for each category
      for (const category of categories) {
        const subcategories = await getSubcategories(category.id);
        this.subcategories[category.id] = subcategories;
      }

      this.loading = false;
      this.lastUpdated = new Date().toISOString();
      this.notifyListeners();

      // Save to cache
      await this.saveToCache();

    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = error.message;
      this.loading = false;
      this.notifyListeners();
    }
  }

  // Set up real-time subscriptions
  setupSubscriptions() {
    // Subscribe to categories
    const unsubscribeCategories = subscribeToCategories((categories) => {
      this.categories = categories;
      this.notifyListeners();
      this.saveToCache();
    });
    this.unsubscribers.push(unsubscribeCategories);

    // Subscribe to glossary terms
    const unsubscribeGlossary = subscribeToGlossaryTerms((terms) => {
      this.glossaryTerms = terms;
      this.notifyListeners();
      this.saveToCache();
    });
    this.unsubscribers.push(unsubscribeGlossary);

    // Subscribe to diagrams
    const unsubscribeDiagrams = subscribeToDiagrams((diagrams) => {
      this.diagrams = diagrams;
      this.notifyListeners();
      this.saveToCache();
    });
    this.unsubscribers.push(unsubscribeDiagrams);

    // Subscribe to templates
    const unsubscribeTemplates = subscribeToTemplates((templates) => {
      this.templates = templates;
      this.notifyListeners();
      this.saveToCache();
    });
    this.unsubscribers.push(unsubscribeTemplates);
  }

  // Get subcategories for a specific category
  getSubcategoriesForCategory(categoryId) {
    return this.subcategories[categoryId] || [];
  }

  // Search functionality
  search(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        categories: [],
        subcategories: [],
        glossary: [],
        diagrams: [],
        templates: []
      };
    }

    const searchLower = searchTerm.toLowerCase();

    const results = {
      categories: this.categories.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower)
      ),
      subcategories: Object.values(this.subcategories).flat().filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.contentEn?.toLowerCase().includes(searchLower) ||
        item.contentAr?.toLowerCase().includes(searchLower)
      ),
      glossary: this.glossaryTerms.filter(item =>
        item.term?.toLowerCase().includes(searchLower) ||
        item.termArabic?.toLowerCase().includes(searchLower) ||
        item.definition?.toLowerCase().includes(searchLower) ||
        item.definitionArabic?.toLowerCase().includes(searchLower)
      ),
      diagrams: this.diagrams.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.descriptionArabic?.toLowerCase().includes(searchLower)
      ),
      templates: this.templates.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.descriptionArabic?.toLowerCase().includes(searchLower)
      )
    };

    return results;
  }

  // Clean up subscriptions
  cleanup() {
    this.unsubscribers.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.unsubscribers = [];
    this.listeners = [];
  }

  // Refresh data from Firebase
  async refresh() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      await this.loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.error = error.message;
      this.loading = false;
      this.notifyListeners();
    }
  }

  // Get bookmarked items (stored locally)
  async getBookmarks() {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks');
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  // Add bookmark
  async addBookmark(item) {
    try {
      const bookmarks = await this.getBookmarks();
      const bookmark = {
        id: item.id,
        type: item.type, // 'category', 'subcategory', 'glossary', 'diagram', 'template'
        title: item.title || item.term,
        titleArabic: item.titleArabic || item.termArabic,
        addedAt: new Date().toISOString()
      };
      
      // Check if already bookmarked
      const exists = bookmarks.find(b => b.id === bookmark.id && b.type === bookmark.type);
      if (!exists) {
        bookmarks.push(bookmark);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
      return bookmarks;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  // Remove bookmark
  async removeBookmark(id, type) {
    try {
      const bookmarks = await this.getBookmarks();
      const filtered = bookmarks.filter(b => !(b.id === id && b.type === type));
      await AsyncStorage.setItem('bookmarks', JSON.stringify(filtered));
      return filtered;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const dataStore = new DataStore();
export default dataStore;