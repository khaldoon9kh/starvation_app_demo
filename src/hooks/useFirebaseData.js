import { useState, useEffect, useCallback } from 'react';
import dataStore from '../services/dataStore';

// Main hook for accessing Firebase data
export const useFirebaseData = () => {
  const [state, setState] = useState(dataStore.getState());

  useEffect(() => {
    // Add listener for data changes
    const removeListener = dataStore.addListener(setState);
    
    // Initialize data store if not already initialized
    if (!state.lastUpdated && !state.loading) {
      dataStore.initialize();
    }

    return removeListener;
  }, []);

  const refresh = useCallback(() => {
    dataStore.refresh();
  }, []);

  return {
    ...state,
    refresh,
    getSubcategoriesForCategory: (categoryId) => dataStore.getSubcategoriesForCategory(categoryId),
    search: (searchTerm) => dataStore.search(searchTerm)
  };
};

// Hook for categories
export const useCategories = () => {
  const { categories, loading, error } = useFirebaseData();
  return { categories, loading, error };
};

// Hook for subcategories of a specific category
export const useSubcategories = (categoryId) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;

    const updateSubcategories = (state) => {
      const subs = dataStore.getSubcategoriesForCategory(categoryId);
      setSubcategories(subs);
      setLoading(state.loading);
      setError(state.error);
    };

    const removeListener = dataStore.addListener(updateSubcategories);
    updateSubcategories(dataStore.getState());

    return removeListener;
  }, [categoryId]);

  return { subcategories, loading, error };
};

// Hook for glossary terms
export const useGlossary = () => {
  const { glossaryTerms, loading, error } = useFirebaseData();
  
  // Add fallback glossary terms if no Firebase data is available
  const getFallbackGlossary = () => [
    {
      id: 'sample-term-1',
      titleEn: 'Sample Term',
      titleAr: 'مصطلح عينة',
      definitionEn: 'This is a sample definition to demonstrate the glossary functionality. Click on highlighted terms to see their definitions.',
      definitionAr: 'هذا تعريف عينة لتوضيح وظيفة المسرد. انقر على المصطلحات المميزة لرؤية تعريفاتها.'
    },
    {
      id: 'investigation-1',
      titleEn: 'Investigation',
      titleAr: 'تحقيق',
      definitionEn: 'A systematic examination or inquiry to discover facts, gather evidence, and determine the truth about a particular matter.',
      definitionAr: 'فحص أو استقصاء منهجي لاكتشاف الحقائق وجمع الأدلة وتحديد الحقيقة حول مسألة معينة.'
    },
    {
      id: 'malnutrition-1',
      titleEn: 'Malnutrition',
      titleAr: 'سوء التغذية',
      definitionEn: 'A condition that occurs when the body does not get enough nutrients or gets too much of certain nutrients, leading to health problems.',
      definitionAr: 'حالة تحدث عندما لا يحصل الجسم على ما يكفي من العناصر الغذائية أو يحصل على الكثير من عناصر غذائية معينة، مما يؤدي إلى مشاكل صحية.'
    }
  ];
  
  const finalGlossaryTerms = glossaryTerms && glossaryTerms.length > 0 
    ? glossaryTerms 
    : getFallbackGlossary();
  
  return { 
    glossaryTerms: finalGlossaryTerms, 
    loading, 
    error 
  };
};

// Hook for diagrams
export const useDiagrams = () => {
  const { diagrams, loading, error } = useFirebaseData();
  return { diagrams, loading, error };
};

// Hook for templates
export const useTemplates = () => {
  const { templates, loading, error } = useFirebaseData();
  return { templates, loading, error };
};

// Hook for search functionality
export const useSearch = () => {
  const [searchResults, setSearchResults] = useState({
    categories: [],
    subcategories: [],
    glossary: [],
    diagrams: [],
    templates: []
  });
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults({
        categories: [],
        subcategories: [],
        glossary: [],
        diagrams: [],
        templates: []
      });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Use setTimeout to debounce search
    const timeoutId = setTimeout(() => {
      const results = dataStore.search(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  return { searchResults, isSearching, search };
};

// Hook for bookmarks
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const savedBookmarks = await dataStore.getBookmarks();
      setBookmarks(savedBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (item) => {
    try {
      const updatedBookmarks = await dataStore.addBookmark(item);
      setBookmarks(updatedBookmarks);
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  }, []);

  const removeBookmark = useCallback(async (id, type) => {
    try {
      const updatedBookmarks = await dataStore.removeBookmark(id, type);
      setBookmarks(updatedBookmarks);
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }, []);

  const isBookmarked = useCallback((id, type) => {
    return bookmarks.some(bookmark => bookmark.id === id && bookmark.type === type);
  }, [bookmarks]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refresh: loadBookmarks
  };
};

// Hook for offline status and data availability
export const useDataStatus = () => {
  const { loading, error, lastUpdated } = useFirebaseData();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // You can implement network status checking here
    // For now, we'll assume online if no error
    setIsOnline(!error || error.includes('network') || error.includes('connection'));
  }, [error]);

  return {
    isLoading: loading,
    hasError: !!error,
    error,
    isOnline,
    lastUpdated,
    isDataAvailable: !!lastUpdated || !loading
  };
};