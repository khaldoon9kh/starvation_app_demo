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
    this.bookmarks = []; // Add bookmarks to state
    this.loading = false;
    this.error = null;
    this.lastUpdated = null;
    
    // Subscriptions
    this.unsubscribers = [];
    
    // Callbacks for state updates
    this.listeners = [];
    
    // Load bookmarks on initialization
    this.loadBookmarksToState();
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
      bookmarks: this.bookmarks, // Include bookmarks in state
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

  // Force reload data from AsyncStorage (after content update)
  async reloadFromCache() {
    this.loading = true;
    this.notifyListeners();
    
    try {
      // Load from app_content_data key (used by Settings download)
      const contentData = await AsyncStorage.getItem('app_content_data');
      
      if (contentData) {
        const data = JSON.parse(contentData);
        
        // Check if subcategories is an array (from getAllSubcategories) or already an object
        let subcategoriesObj = {};
        if (Array.isArray(data.subcategories)) {
          // Convert flat array to hierarchical grouped object by categoryId
          
          // First pass: separate level 1 and level 2 items
          const level1Items = data.subcategories.filter(sub => sub.level === 1 || !sub.level);
          const level2Items = data.subcategories.filter(sub => sub.level === 2);
          
          // Group level 1 items by categoryId
          level1Items.forEach(sub => {
            if (!subcategoriesObj[sub.categoryId]) {
              subcategoriesObj[sub.categoryId] = [];
            }
            
            // Find all sub-subcategories for this subcategory
            const subSubCategories = level2Items
              .filter(item => item.parentSubcategoryId === sub.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Add subcategory with its sub-subcategories
            subcategoriesObj[sub.categoryId].push({
              ...sub,
              subSubCategories
            });
          });
          
          // Sort subcategories by order within each category
          Object.keys(subcategoriesObj).forEach(categoryId => {
            subcategoriesObj[categoryId].sort((a, b) => (a.order || 0) - (b.order || 0));
          });
          
        } else if (typeof data.subcategories === 'object') {
          // Already in object format
          subcategoriesObj = data.subcategories;
        }
        
        this.categories = data.categories || [];
        this.subcategories = subcategoriesObj;
        this.glossaryTerms = data.glossary || [];
        this.diagrams = data.diagrams || [];
        this.templates = data.templates || [];
        this.lastUpdated = new Date().toISOString();
        
        // Also update the appData cache
        await this.saveToCache();
        
        this.loading = false;
        this.notifyListeners();
        
        return true;
      } else {
        console.warn('⚠️ No content data found in AsyncStorage');
        this.loading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      console.error('❌ Error reloading data from cache:', error);
      this.loading = false;
      this.error = error.message;
      this.notifyListeners();
      return false;
    }
  }

  // Initialize data - load from cache first, then sync with Firebase only if offline mode disabled
  async initialize() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Load cached data first for immediate UI update (from 'appData' key)
      const hasCache = await this.loadCachedData();
      
      if (hasCache) {
        this.loading = false;
        this.notifyListeners();
        // Don't set up subscriptions - use only cached data
        return;
      }

      // If no appData cache, try loading from app_content_data (Settings download)
      // This handles the case where the app was closed before saveToCache completed
      const hasContentData = await this.reloadFromCache();
      
      if (hasContentData) {
        this.loading = false;
        this.notifyListeners();
        return;
      }

      // No cache at all - this shouldn't happen if initialized properly, but load from Firebase
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

  // Refresh data from Firebase and update cache
  async refresh() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Clear existing subscriptions
      this.cleanup();

      // Reload all data
      await this.loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
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

  // Search functionality with enhanced matching
  search(searchTerm, language = 'en') {
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        categories: [],
        subcategories: [],
        glossary: [],
        diagrams: [],
        templates: []
      };
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const isArabic = language === 'ar';

    // Enhanced search function that checks multiple fields
    const searchInText = (text, searchTerm) => {
      if (!text || !searchTerm) return false;
      return text.toLowerCase().includes(searchTerm);
    };

    // Language-aware score-based search for better relevance
    const scoreItem = (item, searchTerm, type) => {
      let score = 0;
      const term = searchTerm.toLowerCase();
      
      // Language-specific title matches get highest score
      if (isArabic) {
        // Arabic search - prioritize Arabic fields
        if (item.titleAr && searchInText(item.titleAr, term)) score += 15;
        if (item.titleArabic && searchInText(item.titleArabic, term)) score += 15;
        // Also check English as fallback with lower score
        if (item.title && searchInText(item.title, term)) score += 5;
        if (item.titleEn && searchInText(item.titleEn, term)) score += 5;
      } else {
        // English search - prioritize English fields
        if (item.title && searchInText(item.title, term)) score += 15;
        if (item.titleEn && searchInText(item.titleEn, term)) score += 15;
        // Also check Arabic as fallback with lower score
        if (item.titleAr && searchInText(item.titleAr, term)) score += 5;
        if (item.titleArabic && searchInText(item.titleArabic, term)) score += 5;
      }
      
      // For glossary, also check reference and term fields
      if (type === 'glossary') {
        if (item.reference && searchInText(item.reference, term)) score += 12;
        if (isArabic) {
          if (item.termArabic && searchInText(item.termArabic, term)) score += 15;
          if (item.term && searchInText(item.term, term)) score += 5;
        } else {
          if (item.term && searchInText(item.term, term)) score += 15;
          if (item.termArabic && searchInText(item.termArabic, term)) score += 5;
        }
      }
      
      // Language-specific content matches get high score
      // This searches the ACTUAL ARTICLE CONTENT (not just titles)
      if (isArabic) {
        if (item.contentAr && searchInText(item.contentAr, term)) score += 8;
        if (item.definitionAr && searchInText(item.definitionAr, term)) score += 8;
        if (item.definitionArabic && searchInText(item.definitionArabic, term)) score += 8;
        // Fallback to English
        if (item.contentEn && searchInText(item.contentEn, term)) score += 3;
        if (item.definition && searchInText(item.definition, term)) score += 3;
        if (item.definitionEn && searchInText(item.definitionEn, term)) score += 3;
      } else {
        if (item.contentEn && searchInText(item.contentEn, term)) score += 8;
        if (item.definition && searchInText(item.definition, term)) score += 8;
        if (item.definitionEn && searchInText(item.definitionEn, term)) score += 8;
        // Fallback to Arabic
        if (item.contentAr && searchInText(item.contentAr, term)) score += 3;
        if (item.definitionAr && searchInText(item.definitionAr, term)) score += 3;
        if (item.definitionArabic && searchInText(item.definitionArabic, term)) score += 3;
      }
      
      // Language-specific description matches get lower score
      if (isArabic) {
        if (item.descriptionAr && searchInText(item.descriptionAr, term)) score += 4;
        if (item.descriptionArabic && searchInText(item.descriptionArabic, term)) score += 4;
        if (item.description && searchInText(item.description, term)) score += 2;
        if (item.descriptionEn && searchInText(item.descriptionEn, term)) score += 2;
      } else {
        if (item.description && searchInText(item.description, term)) score += 4;
        if (item.descriptionEn && searchInText(item.descriptionEn, term)) score += 4;
        if (item.descriptionAr && searchInText(item.descriptionAr, term)) score += 2;
        if (item.descriptionArabic && searchInText(item.descriptionArabic, term)) score += 2;
      }
      
      return score;
    };

    // Filter and score results
    const filterAndScore = (items, type) => {
      return items
        .map(item => ({ ...item, score: scoreItem(item, searchLower, type) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
    };

    // Flatten ALL subcategory levels for search
    const flattenSubcategories = () => {
      const allItems = [];
      
      Object.values(this.subcategories).forEach(categorySubcategories => {
        categorySubcategories.forEach(level1Item => {
          // Add level 1 item (even if it's just a header)
          allItems.push(level1Item);
          
          // Add all nested subSubCategories (level 2 items)
          if (level1Item.subSubCategories && Array.isArray(level1Item.subSubCategories)) {
            allItems.push(...level1Item.subSubCategories);
          }
        });
      });
      
      return allItems;
    };

    const results = {
      categories: filterAndScore(this.categories, 'category'),
      subcategories: filterAndScore(flattenSubcategories(), 'subcategory'),
      glossary: filterAndScore(this.glossaryTerms, 'glossary'),
      diagrams: filterAndScore(this.diagrams, 'diagram'),
      templates: filterAndScore(this.templates, 'template')
    };

    return results;
  }

  // Get search suggestions
  getSearchSuggestions(partialTerm) {
    if (!partialTerm || partialTerm.length < 2) return [];
    
    const suggestions = new Set();
    const searchLower = partialTerm.toLowerCase();
    
    const allItems = [
      ...this.categories,
      ...Object.values(this.subcategories).flat(),
      ...this.glossaryTerms
    ];

    // Extract potential search terms from titles
    allItems.forEach(item => {
      // Check English titles
      if (item.title && item.title.toLowerCase().startsWith(searchLower)) {
        suggestions.add(item.title);
      }
      if (item.titleEn && item.titleEn.toLowerCase().startsWith(searchLower)) {
        suggestions.add(item.titleEn);
      }
      // Check Arabic titles
      if (item.titleAr && item.titleAr.includes(partialTerm)) {
        suggestions.add(item.titleAr);
      }
      if (item.titleArabic && item.titleArabic.includes(partialTerm)) {
        suggestions.add(item.titleArabic);
      }
      // For glossary terms - use reference and term fields
      if (item.reference && item.reference.toLowerCase().startsWith(searchLower)) {
        suggestions.add(item.reference);
      }
      if (item.term && item.term.toLowerCase().startsWith(searchLower)) {
        suggestions.add(item.term);
      }
      if (item.termArabic && item.termArabic.includes(partialTerm)) {
        suggestions.add(item.termArabic);
      }
    });

    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
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

  // Load bookmarks into state (called on initialization)
  async loadBookmarksToState() {
    try {
      const bookmarksData = await AsyncStorage.getItem('bookmarks');
      this.bookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading bookmarks to state:', error);
      this.bookmarks = [];
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
      
      // Create a comprehensive bookmark object
      const bookmark = {
        id: item.id,
        type: item.type || 'subcategory', // Default to subcategory
        // Fixed title extraction to handle all field variations
        title: item.titleEn || item.title,
        titleArabic: item.titleAr || item.titleArabic,
        categoryId: item.categoryId, // Store category reference for navigation
        addedAt: new Date().toISOString(),
        // Store complete data with proper field mapping
        fullData: {
          ...item,
          // Ensure consistent field names for ArticleScreen
          titleEn: item.titleEn || item.title,
          titleAr: item.titleAr || item.titleArabic,
          contentEn: item.contentEn,
          contentAr: item.contentAr,
          hasContent: item.hasContent !== false, // Default to true if not specified
          level: item.level || 1,
          order: item.order || 0,
          categoryId: item.categoryId
        }
      };
      
      // Check if already bookmarked
      const exists = bookmarks.find(b => b.id === bookmark.id && b.type === bookmark.type);
      if (!exists) {
        bookmarks.push(bookmark);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
      
      // Update state and notify listeners immediately
      this.bookmarks = bookmarks;
      this.notifyListeners();
      
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
      
      // Update state and notify listeners immediately
      this.bookmarks = filtered;
      this.notifyListeners();
      
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