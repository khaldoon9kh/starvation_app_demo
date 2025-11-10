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
    console.log('📥 Starting template download...');
    
    // Fetch all templates from Firebase
    const templates = await getTemplates();
    console.log(`📊 Found ${templates.length} templates to download`);
    
    const downloadedTemplates = {};
    const templatesMetadata = [];
    
    for (const template of templates) {
      try {
        // Download template file to local storage
        const localPath = await downloadTemplateFile(template);
        const hasFile = localPath !== null;
        
        // Store template metadata and file path
        const templateData = {
          ...template,
          localPath,
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
          fileType: template.fileType,
          fileExtension: template.fileExtension,
          pdfOriginalName: template.pdfOriginalName,
          pdfSize: template.pdfSize,
          downloadedAt: templateData.downloadedAt,
          isDownloaded: templateData.isDownloaded,
          hasFile: templateData.hasFile,
          localPath: templateData.localPath
        });
        
        console.log(`✅ Downloaded: ${template.title || template.titleEn}`);
      } catch (error) {
        console.error(`❌ Error downloading template ${template.id}:`, error);
        
        // Store template metadata even if download failed
        const templateData = {
          ...template,
          localPath: null,
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
          fileType: template.fileType,
          fileExtension: template.fileExtension,
          pdfOriginalName: template.pdfOriginalName,
          pdfSize: template.pdfSize,
          downloadedAt: templateData.downloadedAt,
          isDownloaded: true,
          hasFile: false,
          localPath: null,
          downloadError: error.message
        });
      }
    }
    
    // Store all templates and metadata locally
    await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(downloadedTemplates));
    await AsyncStorage.setItem(TEMPLATES_METADATA_KEY, JSON.stringify(templatesMetadata));
    
    console.log('💾 Templates stored locally successfully');
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
 * Download individual template file to device storage
 */
const downloadTemplateFile = async (template) => {
  try {
    // Try new secure URL system first (Firebase Storage with paths)
    let fileUrl = null;
    
    if (template.pdfFilePath) {
      try {
        const { getTemplateDocumentUrl } = await import('./firebase');
        fileUrl = await getTemplateDocumentUrl(template.pdfFilePath);
        console.log('✅ Using secure URL from pdfFilePath');
      } catch (error) {
        console.warn('⚠️ Failed to generate secure URL from pdfFilePath:', error);
      }
    }
    
    // Fallback to legacy pdfUrl field if new system not available
    if (!fileUrl && template.pdfUrl) {
      fileUrl = template.pdfUrl;
      console.log('✅ Using legacy URL from pdfUrl field');
    }
    
    if (!fileUrl) {
      console.log(`❌ Template ${template.id} has no pdfUrl or pdfFilePath`);
      return null;
    }

    // Use the original file name or create from title
    const fileName = template.pdfOriginalName || 
                    (template.title || `template_${template.id}`) + `.${template.fileExtension || 'pdf'}`;
    
    // Clean filename for filesystem
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Create local file path in document directory
    const localUri = `${FileSystem.documentDirectory}templates/${cleanFileName}`;
    
    console.log(`📥 Downloading: ${template.title}`);
    console.log(`📄 Original: ${template.pdfOriginalName}`);
    console.log(`🔗 From: ${fileUrl}`);
    console.log(`💾 To: ${localUri}`);
    console.log(`📊 Size: ${template.pdfSize} bytes`);
    
    // Create templates directory if it doesn't exist
    const templatesDir = `${FileSystem.documentDirectory}templates/`;
    const dirInfo = await FileSystem.getInfoAsync(templatesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(templatesDir, { intermediates: true });
      console.log(`📁 Created directory: ${templatesDir}`);
    }
    
    // Download file to local storage
    const downloadResult = await FileSystem.downloadAsync(fileUrl, localUri);
    
    if (downloadResult.status === 200) {
      console.log(`✅ Downloaded successfully: ${cleanFileName}`);
      console.log(`📍 Local path: ${downloadResult.uri}`);
      return downloadResult.uri;
    } else {
      console.log(`❌ Download failed with status: ${downloadResult.status}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error downloading template ${template.id}:`, error);
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
    await AsyncStorage.removeItem(TEMPLATES_STORAGE_KEY);
    await AsyncStorage.removeItem(TEMPLATES_METADATA_KEY);
    console.log('🗑️ All downloaded templates cleared');
  } catch (error) {
    console.error('Error clearing downloaded templates:', error);
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
 * Open local template file with native "open with" dialog
 */
export const openLocalTemplate = async (template) => {
  try {
    if (!template.localPath || !template.hasFile) {
      throw new Error('Template file not available locally');
    }
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(template.localPath);
    if (!fileInfo.exists) {
      throw new Error('Template file not found on device');
    }
    
    console.log(`📱 Opening template: ${template.title || template.titleEn}`);
    console.log(`📄 File path: ${template.localPath}`);
    
    // Use Expo Sharing to open with native "open with" dialog
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing not available on this device');
    }
    
    await Sharing.shareAsync(template.localPath, {
      dialogTitle: template.title || 'Open Template',
      mimeType: getMimeType(template),
    });
    
    console.log(`✅ Successfully opened template`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error opening template:', error);
    throw error;
  }
};

/**
 * Get MIME type - use fileType directly from Firestore or fallback to extension mapping
 */
const getMimeType = (template) => {
  // Use fileType directly if available (it contains the full MIME type)
  if (template.fileType) {
    return template.fileType;
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
  
  return mimeTypes[template.fileExtension?.toLowerCase()] || 'application/octet-stream';
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
      console.log('🔄 Templates update needed, downloading...');
      return await downloadAllTemplates();
    } else {
      console.log('✅ Templates are up to date');
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
    console.log('🖼️ Starting diagram download...');
    
    // Fetch all diagrams from Firebase
    const diagrams = await getDiagrams();
    console.log(`📊 Found ${diagrams.length} diagrams to download`);
    
    const downloadedDiagrams = {};
    const diagramsMetadata = [];
    
    for (const diagram of diagrams) {
      try {
        // Download diagram image to local storage
        const localPath = await downloadDiagramImage(diagram);
        const hasFile = localPath !== null;
        
        // Store diagram metadata and file path
        const diagramData = {
          ...diagram,
          localPath,
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
          imageFileName: diagram.imageFileName,
          imageOriginalName: diagram.imageOriginalName,
          imageSize: diagram.imageSize,
          downloadedAt: diagramData.downloadedAt,
          isDownloaded: diagramData.isDownloaded,
          hasFile: diagramData.hasFile,
          localPath: diagramData.localPath
        });
        
        console.log(`✅ Downloaded diagram: ${diagram.title || diagram.reference}`);
      } catch (error) {
        console.error(`❌ Error downloading diagram ${diagram.id}:`, error);
        
        // Store diagram metadata even if download failed
        const diagramData = {
          ...diagram,
          localPath: null,
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
          imageFileName: diagram.imageFileName,
          imageOriginalName: diagram.imageOriginalName,
          imageSize: diagram.imageSize,
          downloadedAt: diagramData.downloadedAt,
          isDownloaded: true,
          hasFile: false,
          localPath: null,
          downloadError: error.message
        });
      }
    }
    
    // Store all diagrams and metadata locally
    await AsyncStorage.setItem(DIAGRAMS_STORAGE_KEY, JSON.stringify(downloadedDiagrams));
    await AsyncStorage.setItem(DIAGRAMS_METADATA_KEY, JSON.stringify(diagramsMetadata));
    
    console.log('💾 Diagrams stored locally successfully');
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
 * Download individual diagram image to device storage
 */
const downloadDiagramImage = async (diagram) => {
  try {
    // Try new secure URL system first (Firebase Storage with paths)
    let imageUrl = null;
    
    if (diagram.imageFilePath) {
      try {
        const { getDiagramImageUrl } = await import('./firebase');
        imageUrl = await getDiagramImageUrl(diagram.imageFilePath);
        console.log('✅ Using secure URL from imageFilePath');
      } catch (error) {
        console.warn('⚠️ Failed to generate secure URL from imageFilePath:', error);
      }
    }
    
    // Fallback to legacy imageUrl field if new system not available
    if (!imageUrl && diagram.imageUrl) {
      imageUrl = diagram.imageUrl;
      console.log('✅ Using legacy URL from imageUrl field');
    }
    
    if (!imageUrl) {
      console.log(`❌ Diagram ${diagram.id} has no imageUrl or imageFilePath`);
      return null;
    }

    // Use imageFileName from Firebase Storage (already unique and clean)
    // This ensures the local filename matches what's in Firebase Storage
    const fileName = diagram.imageFileName || 
                    diagram.imageOriginalName ||
                    (diagram.reference || diagram.title || `diagram_${diagram.id}`) + '.png';
    
    // Don't clean imageFileName since it's already a valid Firebase Storage name
    // Only clean if we fall back to imageOriginalName
    const cleanFileName = diagram.imageFileName ? fileName : fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Create local file path in document directory
    const localUri = `${FileSystem.documentDirectory}diagrams/${cleanFileName}`;
    
    console.log(`🖼️ Downloading: ${diagram.title || diagram.reference}`);
    console.log(`📄 Original: ${diagram.imageOriginalName}`);
    console.log(`🔗 From: ${imageUrl}`);
    console.log(`💾 To: ${localUri}`);
    console.log(`📊 Size: ${diagram.imageSize} bytes`);
    
    // Create diagrams directory if it doesn't exist
    const diagramsDir = `${FileSystem.documentDirectory}diagrams/`;
    const dirInfo = await FileSystem.getInfoAsync(diagramsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(diagramsDir, { intermediates: true });
      console.log('📁 Created diagrams directory');
    }
    
    // Download the file
    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
    
    if (downloadResult.status === 200) {
      console.log(`✅ Diagram downloaded successfully to: ${localUri}`);
      
      // Convert to base64 for React Native Image component
      try {
        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Determine MIME type from file extension
        const extension = cleanFileName.split('.').pop().toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp'
        };
        const mimeType = mimeTypes[extension] || 'image/jpeg';
        
        // Return base64 data URI
        const base64Uri = `data:${mimeType};base64,${base64}`;
        console.log(`✅ Converted to base64 (${base64.length} chars)`);
        return base64Uri;
      } catch (base64Error) {
        console.error('Error converting to base64:', base64Error);
        // Fallback to file URI if base64 conversion fails
        return localUri;
      }
    } else {
      console.error(`❌ Download failed with status: ${downloadResult.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error downloading diagram image:', error);
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
      console.log('🗑️ Deleted diagrams directory');
    }
    
    console.log('✅ Local diagrams cleared');
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
      console.log('🔄 Diagrams update needed, downloading...');
      return await downloadAllDiagrams();
    } else {
      console.log('✅ Diagrams are up to date');
      return { success: true, message: 'Diagrams are up to date' };
    }
  } catch (error) {
    console.error('Error updating diagrams:', error);
    throw error;
  }
};