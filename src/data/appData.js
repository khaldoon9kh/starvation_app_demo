// This file is deprecated - data is now loaded from Firebase
// Import the dataStore to access Firebase data
import dataStore from '../services/dataStore';

// Initialize Firebase data
dataStore.initialize().catch(console.error);

// Export data store for use in components
export { default as dataStore } from '../services/dataStore';

// Helper functions for backward compatibility
export const getLibraryData = () => {
  const state = dataStore.getState();
  return state.categories.map(category => ({
    id: category.id,
    title: category.title,
    titleArabic: category.titleArabic,
    color: '#2196F3', // Default color
    expandable: true,
    items: dataStore.getSubcategoriesForCategory(category.id).map(sub => ({
      id: sub.id,
      title: sub.title,
      titleArabic: sub.titleArabic,
      description: sub.contentEn || 'Content not available',
      descriptionArabic: sub.contentAr || 'المحتوى غير متاح',
      hasContent: sub.hasContent,
      level: sub.level,
      subSubCategories: sub.subSubCategories || []
    }))
  }));
};

export const getTemplatesData = () => {
  const state = dataStore.getState();
  return state.templates.map(template => ({
    id: template.id,
    title: template.title,
    titleArabic: template.titleArabic,
    description: template.description,
    descriptionArabic: template.descriptionArabic,
    category: template.category,
    color: '#4CAF50', // Default color
    pdfUrl: template.pdfUrl,
    pdfFileName: template.pdfFileName,
    pdfOriginalName: template.pdfOriginalName
  }));
};

export const getGlossaryData = () => {
  const state = dataStore.getState();
  return state.glossaryTerms.map(term => ({
    id: term.id,
    term: term.term,
    termArabic: term.termArabic,
    definition: term.definition,
    definitionArabic: term.definitionArabic
  }));
};

export const getDiagramsData = () => {
  const state = dataStore.getState();
  return state.diagrams.map(diagram => ({
    id: diagram.id,
    title: diagram.title,
    titleArabic: diagram.titleArabic,
    description: diagram.description,
    descriptionArabic: diagram.descriptionArabic,
    imageUrl: diagram.imageUrl,
    category: diagram.category
  }));
};

export const getExportCategories = () => {
  const templates = getTemplatesData();
  const categories = [...new Set(templates.map(t => t.category))].filter(Boolean);
  
  return [
    {
      title: 'All Templates and Checklists',
      count: templates.length
    },
    ...categories.map(category => ({
      title: category,
      count: templates.filter(t => t.category === category).length
    }))
  ];
};

// Fallback data for offline use
export const fallbackLibraryData = [
  {
    id: 'offline-placeholder',
    title: 'Content Loading...',
    titleArabic: 'جاري تحميل المحتوى...',
    color: '#2196F3',
    expandable: false,
    description: 'Please check your internet connection'
  }
];

export const fallbackTemplatesData = [
  {
    id: 'offline-placeholder',
    title: 'Templates Loading...',
    titleArabic: 'جاري تحميل القوالب...',
    description: 'Please check your internet connection',
    category: 'System',
    color: '#4CAF50'
  }
];

// For backward compatibility, export the getter functions as default exports
export const libraryData = getLibraryData();
export const templatesData = getTemplatesData();
export const exportCategories = getExportCategories();
