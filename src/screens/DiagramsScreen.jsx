import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { getLocalDiagrams } from '../services/templateManager';

const DiagramsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Load local diagrams on mount
  useEffect(() => {
    loadLocalDiagrams();
  }, []);

  const loadLocalDiagrams = async () => {
    try {
      setLoading(true);
      setError(null);
      const localDiagrams = await getLocalDiagrams();
      const diagramsArray = Object.values(localDiagrams);
      setDiagrams(diagramsArray);
    } catch (err) {
      console.error('Error loading local diagrams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDiagramTitle = (diagram) => {
    if (isRTL) {
      return diagram.titleArabic || diagram.titleAr || diagram.title || diagram.titleEn || t('diagrams.noDiagrams', 'Unknown Diagram');
    }
    return diagram.title || diagram.titleEn || diagram.titleArabic || diagram.titleAr || t('diagrams.noDiagrams', 'Unknown Diagram');
  };

  const getDiagramDescription = (diagram) => {
    if (isRTL) {
      return diagram.descriptionArabic || diagram.descriptionAr || diagram.description || diagram.descriptionEn || '';
    }
    return diagram.description || diagram.descriptionEn || diagram.descriptionArabic || diagram.descriptionAr || '';
  };

  const getDiagramImageUrl = (diagram) => {
    // Get language-specific local path (base64 data URI)
    const language = i18n.language === 'ar' ? 'ar' : 'en';
    
    if (language === 'ar') {
      return diagram.localPathAr || diagram.localPathEn || diagram.localPath || null;
    }
    return diagram.localPathEn || diagram.localPathAr || diagram.localPath || null;
  };

  const handleDiagramPress = (diagram) => {
    setSelectedDiagram(diagram);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDiagram(null);
  };

  const downloadDiagram = async () => {
    if (!selectedDiagram) return;

    try {
      setDownloading(true);
      
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('diagrams.permissionDenied', 'Permission Denied'),
          t('diagrams.permissionMessage', 'We need permission to save images to your gallery'),
          [{ text: t('common.ok', 'OK') }]
        );
        setDownloading(false);
        return;
      }

      const imageData = getDiagramImageUrl(selectedDiagram);
      if (!imageData) {
        Alert.alert(
          t('diagrams.error', 'Error'),
          t('diagrams.noImageUrl', 'Image not available locally'),
          [{ text: t('common.ok', 'OK') }]
        );
        setDownloading(false);
        return;
      }

      // Create a unique filename
      const filename = `diagram_${selectedDiagram.id}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Convert base64 to file if needed
      if (imageData.startsWith('data:')) {
        // Extract base64 data
        const base64Data = imageData.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (imageData.startsWith('file://')) {
        // Already a file URI, copy it
        await FileSystem.copyAsync({
          from: imageData,
          to: fileUri
        });
      } else {
        throw new Error('Invalid image data format');
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Starvation Toolkit', asset, false);

      // Clean up temp file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      Alert.alert(
        t('diagrams.success', 'Success'),
        t('diagrams.savedToGallery', 'Diagram saved to your gallery'),
        [{ text: t('common.ok', 'OK') }]
      );
      closeModal();
    } catch (error) {
      console.error('Error downloading diagram:', error);
      Alert.alert(
        t('diagrams.error', 'Error'),
        t('diagrams.downloadFailed', 'Failed to download diagram. Please try again.'),
        [{ text: t('common.ok', 'OK') }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const shareDiagram = async () => {
    if (!selectedDiagram) return;

    try {
      setDownloading(true);

      const imageData = getDiagramImageUrl(selectedDiagram);
      if (!imageData) {
        Alert.alert(
          t('diagrams.error', 'Error'),
          t('diagrams.noImageUrl', 'Image not available locally'),
          [{ text: t('common.ok', 'OK') }]
        );
        setDownloading(false);
        return;
      }

      // Create temp file for sharing
      const filename = `diagram_${selectedDiagram.id}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Convert base64 to file if needed
      if (imageData.startsWith('data:')) {
        // Extract base64 data
        const base64Data = imageData.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (imageData.startsWith('file://')) {
        // Already a file URI, copy it
        await FileSystem.copyAsync({
          from: imageData,
          to: fileUri
        });
      } else {
        throw new Error('Invalid image data format');
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          t('diagrams.error', 'Error'),
          t('diagrams.sharingNotAvailable', 'Sharing is not available on this device'),
          [{ text: t('common.ok', 'OK') }]
        );
      }
    } catch (error) {
      console.error('Error sharing diagram:', error);
      Alert.alert(
        t('diagrams.error', 'Error'),
        t('diagrams.shareFailed', 'Failed to share diagram'),
        [{ text: t('common.ok', 'OK') }]
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'الرسوم التوضيحية' : 'Diagrams'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'الرسوم التوضيحية' : 'Diagrams'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>{t('common.error', 'Error')}: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLocalDiagrams}>
            <Text style={styles.retryButtonText}>{t('common.retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!diagrams || diagrams.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonHeader}
          >
            <Icon 
              name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
              size={28} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.language === 'ar' ? 'الرسوم التوضيحية' : 'Diagrams'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <Icon name="insert-photo" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{t('diagrams.noDiagrams', 'No diagrams available')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Icon 
            name={isRTL ? "keyboard-arrow-right" : "keyboard-arrow-left"} 
            size={28} 
            color="#333" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {i18n.language === 'ar' ? 'الرسوم التوضيحية' : 'Diagrams'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {diagrams.map((diagram, index) => {
          const imageUrl = getDiagramImageUrl(diagram);
          
          return (
            <View key={diagram.id || index} style={styles.diagramCard}>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => handleDiagramPress(diagram)}
                activeOpacity={0.8}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.diagramImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Icon name="image" size={48} color="#ccc" />
                    <Text style={styles.placeholderText}>
                      {t('diagrams.noImage', 'No image available')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.textContainer}>
                <Text style={[styles.diagramTitle, isRTL && styles.rtlText]}>
                  {getDiagramTitle(diagram)}
                </Text>
                <Text style={[styles.diagramDescription, isRTL && styles.rtlText]}>
                  {getDiagramDescription(diagram)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal for diagram actions */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>

            {selectedDiagram && (
              <>
                <Text style={[styles.modalTitle, isRTL && styles.rtlText]}>
                  {getDiagramTitle(selectedDiagram)}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={downloadDiagram}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="file-download" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {t('diagrams.download', 'Download')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={shareDiagram}
                    disabled={downloading}
                  >
                    <Icon name="share" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {t('diagrams.share', 'Share')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>
                    {t('common.cancel', 'Cancel')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  diagramCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagramImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  textContainer: {
    padding: 15,
  },
  diagramTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  diagramDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default DiagramsScreen;
