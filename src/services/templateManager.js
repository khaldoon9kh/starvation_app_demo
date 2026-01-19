import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getTemplates, getDiagrams } from './dataService';

const TEMPLATES_STORAGE_KEY = 'downloaded_templates';
const TEMPLATES_METADATA_KEY = 'templates_metadata';
const DIAGRAMS_STORAGE_KEY = 'downloaded_diagrams';
const DIAGRAMS_METADATA_KEY = 'diagrams_metadata';

// ==================== LOCAL TEMPLATE STORAGE ====================

/**
 * Download and store all templates locally
 */
export const downloadAllTemplates = async () => {
  try {
    // Fetch all templates from Firebase
    const templates = await getTemplates();
    
    const downloadedTemplates = {};
    const templatesMetadata = [];
    
    for (const template of templates) {
      try {
        // Download template files (both EN and AR) to local storage
        const localPaths = await downloadTemplateFile(template);
        const hasFile = localPaths !== null && (localPaths.localPathEn || localPaths.localPathAr);
        
        // Store template metadata and file paths
        const templateData = {
          ...template,
          localPathEn: localPaths?.localPathEn || null,
          localPathAr: localPaths?.localPathAr || null,
          downloadedAt: new Date().toISOString(),
          isDownloaded: true,
          hasFile
        };
        
        downloadedTemplates[template.id] = templateData;
        templatesMetadata.push({
          id: template.id,
          title: template.title,
          titleArabic: template.titleArabic,
          categoryEN: template.categoryEN,
          categoryAR: template.categoryAR,
          description: template.description,
          descriptionArabic: template.descriptionArabic,
          fileTypeEn: template.fileTypeEn,
          fileTypeAr: template.fileTypeAr,
          fileExtensionEn: template.fileExtensionEn,
          fileExtensionAr: template.fileExtensionAr,
          pdfOriginalNameEn: template.pdfOriginalNameEn,
          pdfOriginalNameAr: template.pdfOriginalNameAr,
          pdfSizeEn: template.pdfSizeEn,
          pdfSizeAr: template.pdfSizeAr,
          downloadedAt: templateData.downloadedAt,
          isDownloaded: templateData.isDownloaded,
          hasFile: templateData.hasFile,
          localPathEn: templateData.localPathEn,
          localPathAr: templateData.localPathAr
        });
      } catch (error) {
        console.error(`❌ Error downloading template ${template.id}:`, error);
        
        // Store template metadata even if download failed
        const templateData = {
          ...template,
          localPathEn: null,
          localPathAr: null,
          downloadedAt: new Date().toISOString(),
          isDownloaded: true, // Mark as processed
          hasFile: false,
          downloadError: error.message
        };
        
        downloadedTemplates[template.id] = templateData;
        templatesMetadata.push({
          id: template.id,
          title: template.title,
          titleArabic: template.titleArabic,
          categoryEN: template.categoryEN,
          categoryAR: template.categoryAR,
          description: template.description,
          descriptionArabic: template.descriptionArabic,
          fileTypeEn: template.fileTypeEn,
          fileTypeAr: template.fileTypeAr,
          fileExtensionEn: template.fileExtensionEn,
          fileExtensionAr: template.fileExtensionAr,
          pdfOriginalNameEn: template.pdfOriginalNameEn,
          pdfOriginalNameAr: template.pdfOriginalNameAr,
          pdfSizeEn: template.pdfSizeEn,
          pdfSizeAr: template.pdfSizeAr,
          downloadedAt: templateData.downloadedAt,
          isDownloaded: true,
          hasFile: false,
          localPathEn: null,
          localPathAr: null,
          downloadError: error.message
        });
      }
    }
    
    // Store all templates and metadata locally
    await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(downloadedTemplates));
    await AsyncStorage.setItem(TEMPLATES_METADATA_KEY, JSON.stringify(templatesMetadata));
    
    return { 
      success: true, 
      totalTemplates: templates.length, 
      downloadedCount: Object.values(downloadedTemplates).filter(t => t.isDownloaded).length 
    };
  } catch (error) {
    console.error('Error downloading templates:', error);
    throw error;
  }
};

/**
 * Download individual template file to device storage (bilingual version)
 * Downloads BOTH English and Arabic versions and stores them separately
 */
const downloadTemplateFile = async (template) => {
  try {
    const { getTemplateDocumentUrl } = await import('./firebase');
    const templatesDir = `${FileSystem.documentDirectory}templates/`;
    
    // Create templates directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(templatesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(templatesDir, { intermediates: true });
    }
    
    const result = {};
    
    // Download English version
    if (template.pdfFilePathEn) {
      try {
        const fileUrlEn = await getTemplateDocumentUrl(template.pdfFilePathEn);
        const fileNameEn = template.pdfFileNameEn || `template_${template.id}_en.${template.fileExtensionEn || 'pdf'}`;
        const localUriEn = `${templatesDir}${fileNameEn}`;
        
        const downloadResultEn = await FileSystem.downloadAsync(fileUrlEn, localUriEn);
        
        if (downloadResultEn.status === 200) {
          result.localPathEn = downloadResultEn.uri;
        }
      } catch (error) {
        result.localPathEn = null;
      }
    }
    
    // Download Arabic version
    if (template.pdfFilePathAr) {
      try {
        const fileUrlAr = await getTemplateDocumentUrl(template.pdfFilePathAr);
        const fileNameAr = template.pdfFileNameAr || `template_${template.id}_ar.${template.fileExtensionAr || 'pdf'}`;
        const localUriAr = `${templatesDir}${fileNameAr}`;
        
        const downloadResultAr = await FileSystem.downloadAsync(fileUrlAr, localUriAr);
        
        if (downloadResultAr.status === 200) {
          result.localPathAr = downloadResultAr.uri;
        }
      } catch (error) {
        result.localPathAr = null;
      }
    }
    
    // Return object with both paths
    return result.localPathEn || result.localPathAr ? result : null;
    
  } catch (error) {
    return null;
  }
};

/**
 * Get locally stored templates
 */
export const getLocalTemplates = async () => {
  try {
    const templatesData = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
    return templatesData ? JSON.parse(templatesData) : {};
  } catch (error) {
    console.error('Error getting local templates:', error);
    return {};
  }
};

/**
 * Get templates metadata for quick access
 */
export const getTemplatesMetadata = async () => {
  try {
    const metadataData = await AsyncStorage.getItem(TEMPLATES_METADATA_KEY);
    return metadataData ? JSON.parse(metadataData) : [];
  } catch (error) {
    console.error('Error getting templates metadata:', error);
    return [];
  }
};

/**
 * Get local templates by category
 */
export const getLocalTemplatesByCategory = async (category, language = 'en') => {
  try {
    const templates = await getLocalTemplates();
    const categoryField = language === 'ar' ? 'categoryAR' : 'categoryEN';
    
    return Object.values(templates).filter(template => {
      // Check language-specific category field
      if (template[categoryField] === category) {
        return true;
      }
      // Fallback to legacy category field
      if (template.category === category && !template.categoryEN && !template.categoryAR) {
        return true;
      }
      return false;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error getting local templates by category:', error);
    return [];
  }
};

/**
 * Get local template categories
 */
export const getLocalTemplateCategories = async (language = 'en') => {
  try {
    const metadata = await getTemplatesMetadata();
    const categories = new Set();
    const categoryField = language === 'ar' ? 'categoryAR' : 'categoryEN';
    
    metadata.forEach(template => {
      if (template[categoryField]) {
        categories.add(template[categoryField]);
      }
      // Fallback to legacy category field
      else if (template.categoryEN === undefined && template.categoryAR === undefined) {
        // This means it's using legacy category field
        if (template.categoryEN || template.category) {
          categories.add(template.categoryEN || template.category);
        }
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting local template categories:', error);
    return [];
  }
};

/**
 * Get specific template by ID
 */
export const getLocalTemplate = async (templateId) => {
  try {
    const templates = await getLocalTemplates();
    return templates[templateId] || null;
  } catch (error) {
    console.error('Error getting local template:', error);
    return null;
  }
};

/**
 * Check if templates are already downloaded
 */
export const areTemplatesDownloaded = async () => {
  try {
    const metadata = await getTemplatesMetadata();
    return metadata.length > 0;
  } catch (error) {
    console.error('Error checking if templates are downloaded:', error);
    return false;
  }
};

/**
 * Clear all downloaded templates (for testing or reset)
 */
export const clearDownloadedTemplates = async () => {
  try {
    // Remove from AsyncStorage
    await AsyncStorage.removeItem(TEMPLATES_STORAGE_KEY);
    await AsyncStorage.removeItem(TEMPLATES_METADATA_KEY);
    
    // Delete template files from filesystem
    const templatesDir = `${FileSystem.documentDirectory}templates/`;
    const dirInfo = await FileSystem.getInfoAsync(templatesDir);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(templatesDir, { idempotent: true });
    }
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Get download statistics
 */
export const getDownloadStats = async () => {
  try {
    const metadata = await getTemplatesMetadata();
    const withFiles = metadata.filter(t => t.hasFile && !t.downloadError).length;
    const withErrors = metadata.filter(t => t.downloadError).length;
    
    return {
      total: metadata.length,
      downloaded: withFiles,
      failed: withErrors,
      success: metadata.length > 0 ? (withFiles / metadata.length) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting download stats:', error);
    return { total: 0, downloaded: 0, failed: 0, success: 0 };
  }
};

/**
 * Open local template file with native "open with" dialog (bilingual version)
 * Opens the correct language version based on the current app language
 */
export const openLocalTemplate = async (template, language = 'en') => {
  try {
    // Determine which path to use based on language
    const localPath = language === 'ar' ? template.localPathAr : template.localPathEn;
    
    if (!localPath || !template.hasFile) {
      throw new Error('Template file not available locally');
    }
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (!fileInfo.exists) {
      throw new Error('Template file not found on device');
    }
    
    const title = language === 'ar' ? template.titleArabic : template.title;
    
    // Use Expo Sharing to open with native "open with" dialog
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing not available on this device');
    }
    
    await Sharing.shareAsync(localPath, {
      dialogTitle: title || 'Open Template',
      mimeType: getMimeType(template, language),
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error opening template:', error);
    throw error;
  }
};

/**
 * Get MIME type - use fileType directly from Firestore or fallback to extension mapping (bilingual version)
 */
const getMimeType = (template, language = 'en') => {
  // Use language-specific fileType if available
  const fileType = language === 'ar' ? template.fileTypeAr : template.fileTypeEn;
  if (fileType) {
    return fileType;
  }
  
  // Fallback to extension mapping if fileType not available
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
  };
  
  const fileExtension = language === 'ar' ? template.fileExtensionAr : template.fileExtensionEn;
  return mimeTypes[fileExtension?.toLowerCase()] || 'application/octet-stream';
};

/**
 * Update templates (re-download if needed)
 */
export const updateTemplates = async () => {
  try {
    // Check if we have local templates
    const localTemplates = await getLocalTemplates();
    
    // Get latest templates from Firebase
    const latestTemplates = await getTemplates();
    
    // Check if update is needed (simple version - compare count)
    const needsUpdate = Object.keys(localTemplates).length !== latestTemplates.length;
    
    if (needsUpdate) {
      return await downloadAllTemplates();
    } else {
      return { success: true, message: 'Templates are up to date' };
    }
  } catch (error) {
    console.error('Error updating templates:', error);
    throw error;
  }
};

// ==================== LOCAL DIAGRAM STORAGE ====================

/**
 * Download and store all diagram images locally
 */
export const downloadAllDiagrams = async () => {
  try {
    // Fetch all diagrams from Firebase
    const diagrams = await getDiagrams();
    
    const downloadedDiagrams = {};
    const diagramsMetadata = [];
    
    for (const diagram of diagrams) {
      try {
        // Download diagram images (both EN and AR) to local storage
        const localPaths = await downloadDiagramImage(diagram);
        const hasFile = localPaths !== null && (localPaths.localPathEn || localPaths.localPathAr);
        
        // Store diagram metadata and file paths
        const diagramData = {
          ...diagram,
          localPathEn: localPaths?.localPathEn || null,
          localPathAr: localPaths?.localPathAr || null,
          downloadedAt: new Date().toISOString(),
          isDownloaded: true,
          hasFile
        };
        
        downloadedDiagrams[diagram.id] = diagramData;
        diagramsMetadata.push({
          id: diagram.id,
          reference: diagram.reference,
          title: diagram.title,
          titleArabic: diagram.titleArabic,
          description: diagram.description,
          descriptionArabic: diagram.descriptionArabic,
          imageFileNameEn: diagram.imageFileNameEn,
          imageFileNameAr: diagram.imageFileNameAr,
          imageOriginalNameEn: diagram.imageOriginalNameEn,
          imageOriginalNameAr: diagram.imageOriginalNameAr,
          imageSizeEn: diagram.imageSizeEn,
          imageSizeAr: diagram.imageSizeAr,
          downloadedAt: diagramData.downloadedAt,
          isDownloaded: diagramData.isDownloaded,
          hasFile: diagramData.hasFile,
          localPathEn: diagramData.localPathEn,
          localPathAr: diagramData.localPathAr
        });
      } catch (error) {
        console.error(`❌ Error downloading diagram ${diagram.id}:`, error);
        
        // Store diagram metadata even if download failed
        const diagramData = {
          ...diagram,
          localPathEn: null,
          localPathAr: null,
          downloadedAt: new Date().toISOString(),
          isDownloaded: true, // Mark as processed
          hasFile: false,
          downloadError: error.message
        };
        
        downloadedDiagrams[diagram.id] = diagramData;
        diagramsMetadata.push({
          id: diagram.id,
          reference: diagram.reference,
          title: diagram.title,
          titleArabic: diagram.titleArabic,
          description: diagram.description,
          descriptionArabic: diagram.descriptionArabic,
          imageFileNameEn: diagram.imageFileNameEn,
          imageFileNameAr: diagram.imageFileNameAr,
          imageOriginalNameEn: diagram.imageOriginalNameEn,
          imageOriginalNameAr: diagram.imageOriginalNameAr,
          imageSizeEn: diagram.imageSizeEn,
          imageSizeAr: diagram.imageSizeAr,
          downloadedAt: diagramData.downloadedAt,
          isDownloaded: true,
          hasFile: false,
          localPathEn: null,
          localPathAr: null,
          downloadError: error.message
        });
      }
    }
    
    // Store all diagrams and metadata locally
    await AsyncStorage.setItem(DIAGRAMS_STORAGE_KEY, JSON.stringify(downloadedDiagrams));
    await AsyncStorage.setItem(DIAGRAMS_METADATA_KEY, JSON.stringify(diagramsMetadata));
    
    return { 
      success: true, 
      totalDiagrams: diagrams.length, 
      downloadedCount: Object.values(downloadedDiagrams).filter(d => d.isDownloaded).length 
    };
  } catch (error) {
    console.error('Error downloading diagrams:', error);
    throw error;
  }
};

/**
 * Download individual diagram image to device storage (bilingual version)
 * Downloads BOTH English and Arabic versions and stores them separately
 * Stores file paths instead of base64 to save AsyncStorage space
 */
const downloadDiagramImage = async (diagram) => {
  try {
    const { getDiagramImageUrl } = await import('./firebase');
    const diagramsDir = `${FileSystem.documentDirectory}diagrams/`;
    
    // Create diagrams directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(diagramsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(diagramsDir, { intermediates: true });
    }
    
    const result = {};
    
    // Download English version
    if (diagram.imageFilePathEn) {
      try {
        const imageUrlEn = await getDiagramImageUrl(diagram.imageFilePathEn);
        const fileNameEn = diagram.imageFileNameEn || `diagram_${diagram.id}_en.png`;
        const localUriEn = `${diagramsDir}${fileNameEn}`;
        
        const downloadResultEn = await FileSystem.downloadAsync(imageUrlEn, localUriEn);
        
        if (downloadResultEn.status === 200) {
          // Store file path instead of base64 to save AsyncStorage space
          result.localPathEn = localUriEn;
        }
      } catch (error) {
        result.localPathEn = null;
      }
    }
    
    // Download Arabic version
    if (diagram.imageFilePathAr) {
      try {
        const imageUrlAr = await getDiagramImageUrl(diagram.imageFilePathAr);
        const fileNameAr = diagram.imageFileNameAr || `diagram_${diagram.id}_ar.png`;
        const localUriAr = `${diagramsDir}${fileNameAr}`;
        
        const downloadResultAr = await FileSystem.downloadAsync(imageUrlAr, localUriAr);
        
        if (downloadResultAr.status === 200) {
          // Store file path instead of base64 to save AsyncStorage space
          result.localPathAr = localUriAr;
        }
      } catch (error) {
        result.localPathAr = null;
      }
    }
    
    // Return object with both paths
    return result.localPathEn || result.localPathAr ? result : null;
    
  } catch (error) {
    return null;
  }
};

/**
 * Get all downloaded diagrams from local storage
 */
export const getLocalDiagrams = async () => {
  try {
    const diagramsJson = await AsyncStorage.getItem(DIAGRAMS_STORAGE_KEY);
    if (diagramsJson) {
      return JSON.parse(diagramsJson);
    }
    return {};
  } catch (error) {
    console.error('Error reading local diagrams:', error);
    return {};
  }
};

/**
 * Get diagram by reference from local storage
 */
export const getLocalDiagramByReference = async (reference) => {
  try {
    const diagrams = await getLocalDiagrams();
    const diagram = Object.values(diagrams).find(d => d.reference === reference);
    return diagram || null;
  } catch (error) {
    console.error('Error getting local diagram by reference:', error);
    return null;
  }
};

/**
 * Clear all downloaded diagrams
 */
export const clearLocalDiagrams = async () => {
  try {
    // Remove from AsyncStorage
    await AsyncStorage.removeItem(DIAGRAMS_STORAGE_KEY);
    await AsyncStorage.removeItem(DIAGRAMS_METADATA_KEY);
    
    // Delete diagram files from filesystem
    const diagramsDir = `${FileSystem.documentDirectory}diagrams/`;
    const dirInfo = await FileSystem.getInfoAsync(diagramsDir);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(diagramsDir, { idempotent: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing local diagrams:', error);
    throw error;
  }
};

/**
 * Update diagrams if needed (check for changes)
 */
export const updateDiagrams = async () => {
  try {
    // Check if we have local diagrams
    const localDiagrams = await getLocalDiagrams();
    
    // Get latest diagrams from Firebase
    const latestDiagrams = await getDiagrams();
    
    // Check if update is needed (simple version - compare count)
    const needsUpdate = Object.keys(localDiagrams).length !== latestDiagrams.length;
    
    if (needsUpdate) {
      return await downloadAllDiagrams();
    } else {
      return { success: true, message: 'Diagrams are up to date' };
    }
  } catch (error) {
    console.error('Error updating diagrams:', error);
    throw error;
  }
};