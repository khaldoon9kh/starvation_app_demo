import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
const categoriesRef = collection(db, 'categories');
const subcategoriesRef = collection(db, 'subcategories');
const glossaryRef = collection(db, 'glossary');
const diagramsRef = collection(db, 'diagrams');
const templatesRef = collection(db, 'templates');

// ==================== CATEGORIES OPERATIONS ====================

/**
 * Get all categories ordered by their order field
 */
export const getCategories = async () => {
  try {
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time categories updates
 */
export const subscribeToCategories = (callback) => {
  const q = query(categoriesRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(categories);
  }, (error) => {
    console.error('Error in categories subscription:', error);
    // Provide fallback data for development/testing
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.warn('Firebase permissions not configured. Using fallback data.');
      callback(getFallbackCategories());
    } else {
      callback([]);
    }
  });
};

// ==================== SUBCATEGORIES OPERATIONS ====================

/**
 * Get subcategories for a specific category with hierarchical structure
 */
export const getSubcategories = async (categoryId) => {
  try {
    const q = query(
      subcategoriesRef, 
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const allSubcategories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Separate level 1 and level 2 items
    const level1Items = allSubcategories.filter(item => item.level === 1 || !item.level);
    const level2Items = allSubcategories.filter(item => item.level === 2);
    
    // Build hierarchical structure
    return level1Items.map(subcategory => {
      const subSubCategories = level2Items
        .filter(item => item.parentSubcategoryId === subcategory.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return {
        ...subcategory,
        level: subcategory.level || 1,
        subSubCategories
      };
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time subcategories updates for a specific category
 */
export const subscribeToSubcategories = (categoryId, callback) => {
  const q = query(
    subcategoriesRef,
    where('categoryId', '==', categoryId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const allSubcategories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process hierarchical structure
    const level1Items = allSubcategories.filter(item => item.level === 1 || !item.level);
    const level2Items = allSubcategories.filter(item => item.level === 2);
    
    level1Items.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const hierarchicalSubcategories = level1Items.map(subcategory => {
      const subSubCategories = level2Items
        .filter(item => item.parentSubcategoryId === subcategory.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return {
        ...subcategory,
        level: subcategory.level || 1,
        subSubCategories
      };
    });
    
    callback(hierarchicalSubcategories);
  }, (error) => {
    console.error('Error in subcategories subscription:', error);
    // Provide fallback data for development/testing
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.warn('Firebase permissions not configured. Using fallback subcategories data.');
      callback(getFallbackSubcategories(categoryId));
    } else {
      callback([]);
    }
  });
};

/**
 * Get all subcategories (useful for search functionality)
 */
export const getAllSubcategories = async () => {
  try {
    const q = query(subcategoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all subcategories:', error);
    throw error;
  }
};

// ==================== GLOSSARY OPERATIONS ====================

/**
 * Get all glossary terms ordered by order field
 */
export const getGlossaryTerms = async () => {
  try {
    const q = query(glossaryRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time glossary terms updates
 */
export const subscribeToGlossaryTerms = (callback) => {
  const q = query(glossaryRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const terms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(terms);
  }, (error) => {
    console.error('Error in glossary subscription:', error);
    // Provide fallback data for development/testing
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.warn('Firebase permissions not configured. Using fallback glossary data.');
      callback(getFallbackGlossary());
    } else {
      callback([]);
    }
  });
};

/**
 * Search glossary terms by term name
 */
export const searchGlossaryTerms = async (searchTerm) => {
  try {
    const snapshot = await getDocs(glossaryRef);
    const allTerms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const searchLower = searchTerm.toLowerCase();
    return allTerms.filter(term => 
      term.term?.toLowerCase().includes(searchLower) ||
      term.termArabic?.toLowerCase().includes(searchLower) ||
      term.definition?.toLowerCase().includes(searchLower) ||
      term.definitionArabic?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching glossary terms:', error);
    throw error;
  }
};

// ==================== DIAGRAMS OPERATIONS ====================

/**
 * Get all diagrams ordered by order field
 */
export const getDiagrams = async () => {
  try {
    const q = query(diagramsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time diagrams updates
 */
export const subscribeToDiagrams = (callback) => {
  const q = query(diagramsRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const diagrams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(diagrams);
  }, (error) => {
    console.error('Error in diagrams subscription:', error);
    // Provide fallback data for development/testing
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.warn('Firebase permissions not configured. Using fallback diagrams data.');
      callback(getFallbackDiagrams());
    } else {
      callback([]);
    }
  });
};

/**
 * Get diagrams by category
 */
export const getDiagramsByCategory = async (category) => {
  try {
    const q = query(
      diagramsRef,
      where('category', '==', category),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching diagrams by category:', error);
    throw error;
  }
};

// ==================== TEMPLATES OPERATIONS ====================

/**
 * Get all templates ordered by order field
 */
export const getTemplates = async () => {
  try {
    const q = query(templatesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time templates updates
 */
export const subscribeToTemplates = (callback) => {
  const q = query(templatesRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(templates);
  }, (error) => {
    console.error('Error in templates subscription:', error);
    // Provide fallback data for development/testing
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.warn('Firebase permissions not configured. Using fallback templates data.');
      callback(getFallbackTemplates());
    } else {
      callback([]);
    }
  });
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (category) => {
  try {
    const q = query(
      templatesRef,
      where('category', '==', category),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get all content for offline caching
 */
export const getAllContentForCache = async () => {
  try {
    const [categories, allSubcategories, glossaryTerms, diagrams, templates] = await Promise.all([
      getCategories(),
      getAllSubcategories(),
      getGlossaryTerms(),
      getDiagrams(),
      getTemplates()
    ]);

    return {
      categories,
      subcategories: allSubcategories,
      glossary: glossaryTerms,
      diagrams,
      templates,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching all content:', error);
    throw error;
  }
};

/**
 * Search across all content types
 */
export const searchAllContent = async (searchTerm) => {
  try {
    const [categories, subcategories, glossaryTerms, diagrams, templates] = await Promise.all([
      getCategories(),
      getAllSubcategories(),
      searchGlossaryTerms(searchTerm),
      getDiagrams(),
      getTemplates()
    ]);

    const searchLower = searchTerm.toLowerCase();
    
    const results = {
      categories: categories.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower)
      ),
      subcategories: subcategories.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.contentEn?.toLowerCase().includes(searchLower) ||
        item.contentAr?.toLowerCase().includes(searchLower)
      ),
      glossary: glossaryTerms, // Already filtered in searchGlossaryTerms
      diagrams: diagrams.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.descriptionArabic?.toLowerCase().includes(searchLower)
      ),
      templates: templates.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.titleArabic?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.descriptionArabic?.toLowerCase().includes(searchLower)
      )
    };

    return results;
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

// ==================== FALLBACK DATA FOR DEVELOPMENT ====================

/**
 * Fallback categories for when Firebase is not configured
 */
export const getFallbackCategories = () => [
  {
    id: 'law-starvation',
    title: 'Law on Starvation',
    titleArabic: 'قانون الجوع',
    order: 1
  },
  {
    id: 'basic-investigation',
    title: 'Basic Investigation Standards',
    titleArabic: 'معايير التحقيق الأساسية',
    order: 2
  },
  {
    id: 'remedies',
    title: 'Remedies',
    titleArabic: 'سبل الانتصاف',
    order: 3
  }
];

/**
 * Fallback subcategories for when Firebase is not configured
 */
export const getFallbackSubcategories = (categoryId) => {
  const subcategoriesMap = {
    'law-starvation': [
      {
        id: 'icl-framework',
        title: 'ICL Framework',
        titleArabic: 'إطار القانون الجنائي الدولي',
        categoryId,
        level: 1,
        hasContent: true,
        contentEn: 'International Criminal Law framework for starvation crimes.',
        contentAr: 'إطار القانون الجنائي الدولي لجرائم الجوع.',
        order: 1,
        subSubCategories: []
      },
      {
        id: 'ihl-framework',
        title: 'IHL Framework',
        titleArabic: 'إطار القانون الإنساني الدولي',
        categoryId,
        level: 1,
        hasContent: true,
        contentEn: 'International Humanitarian Law provisions.',
        contentAr: 'أحكام القانون الإنساني الدولي.',
        order: 2,
        subSubCategories: []
      }
    ]
  };
  
  return subcategoriesMap[categoryId] || [];
};

/**
 * Fallback glossary for when Firebase is not configured
 */
export const getFallbackGlossary = () => [
  {
    id: 'starvation',
    term: 'Starvation',
    termArabic: 'الجوع',
    definition: 'The deliberate deprivation of food as a weapon of war.',
    definitionArabic: 'الحرمان المتعمد من الطعام كسلاح في الحرب.',
    order: 1
  },
  {
    id: 'war-crime',
    term: 'War Crime',
    termArabic: 'جريمة حرب',
    definition: 'Serious violations of international humanitarian law.',
    definitionArabic: 'انتهاكات جسيمة للقانون الإنساني الدولي.',
    order: 2
  }
];

/**
 * Fallback diagrams for when Firebase is not configured
 */
export const getFallbackDiagrams = () => [
  {
    id: 'legal-framework',
    title: 'Legal Framework',
    titleArabic: 'الإطار القانوني',
    description: 'Visual representation of legal frameworks',
    descriptionArabic: 'التمثيل البصري للأطر القانونية',
    category: 'Legal',
    order: 1
  }
];

/**
 * Fallback templates for when Firebase is not configured
 */
export const getFallbackTemplates = () => [
  {
    id: 'witness-checklist',
    title: 'Witness Risk Checklist',
    titleArabic: 'قائمة مراجعة مخاطر الشاهد',
    description: 'A checklist for assessing witness risks',
    descriptionArabic: 'قائمة مراجعة لتقييم مخاطر الشاهد',
    category: 'Basic Interview',
    order: 1
  }
];