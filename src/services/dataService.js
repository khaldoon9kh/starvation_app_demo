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
    // console.log('🔍 Fetching glossary terms from Firebase...');
    const q = query(glossaryRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const glossaryData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // console.log('📚 Glossary terms fetched successfully:');
    // console.log('📊 Total terms:', glossaryData.length);
    // console.log('📋 Glossary data:', glossaryData);
    
    // Log each term for detailed inspection
    // glossaryData.forEach((term, index) => {
    //   console.log(`📖 Term ${index + 1}:`, {
    //     id: term.id,
    //     term: term.term,
    //     termArabic: term.termArabic,
    //     definition: term.definition?.substring(0, 100) + '...', // Show first 100 chars
    //     definitionArabic: term.definitionArabic?.substring(0, 100) + '...',
    //     order: term.order
    //   });
    // });
    
    return glossaryData;
  } catch (error) {
    console.error('❌ Error fetching glossary terms:', error);
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
export const searchGlossaryTerms = async (searchTerm) => {
  try {
    const snapshot = await getDocs(glossaryRef);
    const allTerms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const searchLower = searchTerm.toLowerCase();
    return allTerms.filter(term => 
      term.reference?.toLowerCase().includes(searchLower) ||
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
 * Get templates by category using language-specific category field
 */
export const getTemplatesByCategory = async (category, language = 'en') => {
  try {
    let q;
    const categoryField = language === 'ar' ? 'categoryAR' : 'categoryEN';
    
    // Try new language-specific category field first
    try {
      q = query(
        templatesRef,
        where(categoryField, '==', category),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (templates.length > 0) {
        return templates;
      }
    } catch (error) {
      // Try legacy category field
    }
    
    // Fallback to legacy category field
    q = query(
      templatesRef,
      where('category', '==', category),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    throw error;
  }
};

/**
 * Get unique template categories for specific language
 */
export const getTemplateCategories = async (language = 'en') => {
  try {
    const snapshot = await getDocs(templatesRef);
    const templates = snapshot.docs.map(doc => doc.data());
    
    const categories = new Set();
    const categoryField = language === 'ar' ? 'categoryAR' : 'categoryEN';
    
    templates.forEach(template => {
      // Use language-specific category field
      if (template[categoryField]) {
        categories.add(template[categoryField]);
      }
      // Fallback to legacy category field if new field doesn't exist
      else if (template.category && !template.categoryEN && !template.categoryAR) {
        categories.add(template.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching template categories:', error);
    throw error;
  }
};

/**
 * Get templates grouped by category with proper language support
 */
export const getTemplatesGroupedByCategory = async (language = 'en') => {
  try {
    const allTemplates = await getTemplates();
    const grouped = {};
    
    allTemplates.forEach(template => {
      // Determine category based on language and available fields
      let category;
      if (language === 'ar') {
        category = template.categoryAR || template.category || 'Other';
      } else {
        category = template.categoryEN || template.category || 'Other';
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });
    
    // Sort templates within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    return grouped;
  } catch (error) {
    console.error('Error getting templates grouped by category:', error);
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
 * Search across all content types with enhanced matching
 */
export const searchAllContent = async (searchTerm) => {
  try {
    const [categories, subcategories, glossaryTerms, diagrams, templates] = await Promise.all([
      getCategories(),
      getAllSubcategories(),
      getGlossaryTerms(),
      getDiagrams(),
      getTemplates()
    ]);

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Enhanced search function that checks multiple fields
    const searchInText = (text, searchTerm) => {
      if (!text || !searchTerm) return false;
      return text.toLowerCase().includes(searchTerm);
    };

    // Score-based search for better relevance
    const scoreItem = (item, searchTerm, type) => {
      let score = 0;
      const term = searchTerm.toLowerCase();
      
      // Title matches get highest score
      if (item.title && searchInText(item.title, term)) score += 10;
      if (item.titleAr && searchInText(item.titleAr, term)) score += 10;
      if (item.titleEn && searchInText(item.titleEn, term)) score += 10;
      if (item.titleArabic && searchInText(item.titleArabic, term)) score += 10;
      
      // For glossary, also check reference and term fields
      if (type === 'glossary') {
        if (item.reference && searchInText(item.reference, term)) score += 10;
        if (item.term && searchInText(item.term, term)) score += 10;
        if (item.termArabic && searchInText(item.termArabic, term)) score += 10;
      }
      
      // Content matches get medium score
      if (item.contentEn && searchInText(item.contentEn, term)) score += 5;
      if (item.contentAr && searchInText(item.contentAr, term)) score += 5;
      if (item.definition && searchInText(item.definition, term)) score += 5;
      if (item.definitionArabic && searchInText(item.definitionArabic, term)) score += 5;
      if (item.definitionEn && searchInText(item.definitionEn, term)) score += 5;
      if (item.definitionAr && searchInText(item.definitionAr, term)) score += 5;
      
      // Description matches get lower score
      if (item.description && searchInText(item.description, term)) score += 3;
      if (item.descriptionArabic && searchInText(item.descriptionArabic, term)) score += 3;
      if (item.descriptionEn && searchInText(item.descriptionEn, term)) score += 3;
      if (item.descriptionAr && searchInText(item.descriptionAr, term)) score += 3;
      
      // For templates, also check new category fields
      if (type === 'template') {
        if (item.categoryEN && searchInText(item.categoryEN, term)) score += 5;
        if (item.categoryAR && searchInText(item.categoryAR, term)) score += 5;
        // Legacy category field
        if (item.category && searchInText(item.category, term)) score += 5;
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

    const results = {
      categories: filterAndScore(categories, 'category'),
      subcategories: filterAndScore(subcategories, 'subcategory'),
      glossary: filterAndScore(glossaryTerms, 'glossary'),
      diagrams: filterAndScore(diagrams, 'diagram'),
      templates: filterAndScore(templates, 'template')
    };

    return results;
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

/**
 * Get search suggestions based on partial input
 */
export const getSearchSuggestions = async (partialTerm) => {
  if (!partialTerm || partialTerm.length < 2) return [];
  
  try {
    const [categories, subcategories, glossaryTerms] = await Promise.all([
      getCategories(),
      getAllSubcategories(),
      getGlossaryTerms()
    ]);

    const suggestions = new Set();
    const searchLower = partialTerm.toLowerCase();

    // Extract potential search terms from titles
    [...categories, ...subcategories, ...glossaryTerms].forEach(item => {
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
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

// ==================== SECURE FILE URL HELPERS ====================

/**
 * Transform diagram with secure image URL
 * Reads imageFilePath from Firestore and generates temporary download URL
 * Falls back to imageUrl if imageFilePath not available (backward compatibility)
 */
export const transformDiagramWithSecureUrl = async (diagram) => {
  try {
    // Check if new field-based URL system is available
    if (diagram.imageFilePath) {
      const { getDiagramImageUrl, getDiagramImageUrlFallback } = await import('./firebase');
      const secureImageUrl = await getDiagramImageUrlFallback(diagram.imageFilePath, diagram.imageUrl);
      return {
        ...diagram,
        imageUrl: secureImageUrl || diagram.imageUrl, // Fallback to old URL if generation fails
        imagePath: diagram.imageFilePath // Keep path reference for logging
      };
    }
    
    // Fallback to existing imageUrl field (backward compatibility)
    return diagram;
  } catch (error) {
    console.error('Error transforming diagram:', error);
    return diagram; // Return original if transformation fails
  }
};

/**
 * Transform template with secure PDF URL
 * Reads pdfFilePath from Firestore and generates temporary download URL
 * Falls back to pdfUrl if pdfFilePath not available (backward compatibility)
 */
export const transformTemplateWithSecureUrl = async (template) => {
  try {
    // Check if new field-based URL system is available
    if (template.pdfFilePath) {
      const { getTemplateDocumentUrl, getTemplateDocumentUrlFallback } = await import('./firebase');
      const securePdfUrl = await getTemplateDocumentUrlFallback(template.pdfFilePath, template.pdfUrl);
      return {
        ...template,
        pdfUrl: securePdfUrl || template.pdfUrl, // Fallback to old URL if generation fails
        pdfPath: template.pdfFilePath // Keep path reference for logging
      };
    }
    
    // Fallback to existing pdfUrl field (backward compatibility)
    return template;
  } catch (error) {
    console.error('Error transforming template:', error);
    return template; // Return original if transformation fails
  }
};

/**
 * Transform multiple diagrams with secure URLs (batch operation)
 */
export const transformDiagramsWithSecureUrls = async (diagrams) => {
  try {
    return await Promise.all(diagrams.map(diagram => transformDiagramWithSecureUrl(diagram)));
  } catch (error) {
    console.error('Error transforming diagrams:', error);
    return diagrams; // Return originals if batch transformation fails
  }
};

/**
 * Transform multiple templates with secure URLs (batch operation)
 */
export const transformTemplatesWithSecureUrls = async (templates) => {
  try {
    return await Promise.all(templates.map(template => transformTemplateWithSecureUrl(template)));
  } catch (error) {
    console.error('Error transforming templates:', error);
    return templates; // Return originals if batch transformation fails
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
    reference: 'starvation',
    term: 'Starvation',
    termArabic: 'الجوع',
    definition: 'The deliberate deprivation of food as a weapon of war.',
    definitionArabic: 'الحرمان المتعمد من الطعام كسلاح في الحرب.',
    order: 1
  },
  {
    id: 'war-crime',
    reference: 'war-crime',
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

// ==================== DOWNLOAD SIZE ESTIMATION ====================

/**
 * Estimate total download size of all downloadable binary assets
 * (template PDFs + diagram images, both language versions).
 * Sizes are read from Firestore metadata fields — no files are fetched.
 */
export const estimateDownloadSize = async () => {
  // NOTE: errors are intentionally NOT caught here — let the caller handle them
  // so they can surface the error to the user (e.g. on-screen debug panel).
  const [templates, diagrams] = await Promise.all([
    getTemplates(),
    getDiagrams()
  ]);

  let totalBytes = 0;
  let hasSize = false;

  templates.forEach(template => {
    if (template.pdfSizeEn && typeof template.pdfSizeEn === 'number') {
      totalBytes += template.pdfSizeEn;
      hasSize = true;
    }
    if (template.pdfSizeAr && typeof template.pdfSizeAr === 'number') {
      totalBytes += template.pdfSizeAr;
      hasSize = true;
    }
  });

  diagrams.forEach(diagram => {
    if (diagram.imageSizeEn && typeof diagram.imageSizeEn === 'number') {
      totalBytes += diagram.imageSizeEn;
      hasSize = true;
    }
    if (diagram.imageSizeAr && typeof diagram.imageSizeAr === 'number') {
      totalBytes += diagram.imageSizeAr;
      hasSize = true;
    }
  });

  return {
    bytes: totalBytes,
    hasSize,
    templatesCount: templates.length,
    diagramsCount: diagrams.length,
  };
};

/**
 * Format a byte value into a human-readable string (B / KB / MB).
 */
export const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};