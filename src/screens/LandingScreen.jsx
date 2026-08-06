import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllContentForCache, estimateDownloadSize, formatBytes } from '../services/dataService';

const CONTENT_STATUS_KEY = 'app_content_status';
const CONTENT_DATA_KEY = 'app_content_data';

// Download phases: 'idle' | 'downloading' | 'done'
const LandingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [fetchingSize, setFetchingSize] = useState(true);
  const [sizeEstimate, setSizeEstimate] = useState(null);
  const [downloadPhase, setDownloadPhase] = useState('idle');
  const [progress, setProgress] = useState(0);      // 0-100
  const [progressLabel, setProgressLabel] = useState('');
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '', isNetworkError: false });

  useEffect(() => {
    fetchSizeEstimate();
  }, []);

  // Detects whether an error is caused by no internet connection
  const isNetworkError = (e) => {
    if (!e) return false;
    const code = e?.code || '';
    const msg  = (e?.message || '').toLowerCase();
    return (
      code === 'unavailable' ||
      code === 'network-request-failed' ||
      msg.includes('network') ||
      msg.includes('offline') ||
      msg.includes('internet') ||
      msg.includes('connection') ||
      msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      (e instanceof TypeError && msg.includes('fetch'))
    );
  };

  const showErrorModal = (e) => {
    const networkError = isNetworkError(e);
    setErrorModal({
      visible: true,
      isNetworkError: networkError,
      title: networkError
        ? t('error.noInternetTitle', 'No Internet Connection')
        : t('error.genericTitle', 'Something Went Wrong'),
      message: networkError
        ? t('error.noInternetMessage', 'Please check your Wi-Fi or mobile data and try again.')
        : t('error.genericMessage', 'An unexpected error occurred. Please try again.'),
    });
  };

  const fetchSizeEstimate = async () => {
    setFetchingSize(true);
    try {
      const estimate = await estimateDownloadSize();
      setSizeEstimate(estimate);
    } catch (e) {
      setSizeEstimate({ bytes: 0, hasSize: false });
      // Only show the modal if the size fetch fails — it means Firebase is unreachable.
      // The user can still press Download and will get a clearer error then.
      showErrorModal(e);
    } finally {
      setFetchingSize(false);
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  const handleStartDownload = async () => {
    setDownloadPhase('downloading');
    setProgress(0);
    try {
      setProgressLabel(t('settingsScreen.preparingDownload', 'Preparing download...'));
      setProgress(5);
      await new Promise(resolve => setTimeout(resolve, 150));

      setProgressLabel(t('settingsScreen.fetchingData', 'Fetching latest content...'));
      setProgress(10);
      const contentData = await getAllContentForCache();
      setProgress(30);

      setProgressLabel(t('settingsScreen.savingData', 'Saving content locally...'));
      await AsyncStorage.setItem(CONTENT_DATA_KEY, JSON.stringify(contentData));
      setProgress(40);

      const { downloadAllTemplates, downloadAllDiagrams } = await import('../services/templateManager');

      setProgressLabel(t('settingsScreen.downloadingTemplates', 'Downloading template files...'));
      await downloadAllTemplates((p) => {
        setProgress(Math.round(40 + p * 30));
      });
      setProgress(70);

      setProgressLabel(t('settingsScreen.downloadingDiagrams', 'Downloading diagram images...'));
      await downloadAllDiagrams((p) => {
        setProgress(Math.round(70 + p * 20));
      });
      setProgress(90);

      await AsyncStorage.setItem(CONTENT_STATUS_KEY, 'downloaded');

      setProgressLabel(t('settingsScreen.finishingUp', 'Finishing up...'));
      const dataStore = await import('../services/dataStore');
      await dataStore.default.reloadFromCache();
      setProgress(100);

      await new Promise(resolve => setTimeout(resolve, 500));
      setDownloadPhase('done');

      const rootNavigation = navigation.getParent() || navigation;
      rootNavigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      setDownloadPhase('idle');
      setProgress(0);
      showErrorModal(error);
    }
  };

  const sizeStr = sizeEstimate?.hasSize ? formatBytes(sizeEstimate.bytes) : null;

  return (
    <View style={styles.container}>

      {/* ── No-internet / Error Modal ────────────────────────── */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal(m => ({ ...m, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconRow}>
              <Icon
                name={errorModal.isNetworkError ? 'wifi-off' : 'error-outline'}
                size={42}
                color={errorModal.isNetworkError ? '#FF9800' : '#f44336'}
              />
            </View>
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setErrorModal(m => ({ ...m, visible: false }));
                fetchSizeEstimate();
              }}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.modalBtnText}>{t('common.tryAgain', 'Try Again')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={styles.globeButton}
          onPress={() => setShowLanguageMenu(v => !v)}
          activeOpacity={0.7}
        >
          <Icon name="language" size={26} color="#4CAF50" />
          <Text style={styles.currentLangLabel}>
            {i18n.language === 'ar' ? 'ع' : 'EN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Language Dropdown ────────────────────────────────── */}
      {showLanguageMenu && (
        <View style={styles.langMenuWrapper}>
          <TouchableOpacity
            style={styles.langMenuBackdrop}
            onPress={() => setShowLanguageMenu(false)}
            activeOpacity={1}
          />
          <View style={[styles.langMenu, isRTL && styles.langMenuRTL]}>
            <TouchableOpacity
              style={[styles.langOption, i18n.language === 'en' && styles.langOptionActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.langOptionText, i18n.language === 'en' && styles.langOptionTextActive]}>
                English
              </Text>
              {i18n.language === 'en' && <Icon name="check" size={16} color="#4CAF50" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOption, i18n.language === 'ar' && styles.langOptionActive]}
              onPress={() => changeLanguage('ar')}
            >
              <Text style={[styles.langOptionText, i18n.language === 'ar' && styles.langOptionTextActive]}>
                العربية
              </Text>
              {i18n.language === 'ar' && <Icon name="check" size={16} color="#4CAF50" />}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Main Content ─────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRTL]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.titleRTL]}>
            {t('landing.letsGetReady', "LET'S GET READY")}
          </Text>
        </View>

        {/* ── IDLE PHASE: size card + download button ────────── */}
        {downloadPhase === 'idle' && (
          <>
            <Text style={[styles.description, isRTL && styles.descriptionRTL]}>
              {t('landing.downloadDescription', 'To use this app, additional content must be downloaded to your device. This includes articles, templates, diagrams, and glossary terms.')}
            </Text>

            <View style={styles.sizeCard}>
              {fetchingSize ? (
                <View style={styles.sizeCardRow}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.sizeLoadingText}>
                    {t('settingsScreen.estimatingSizes', 'Checking download size...')}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.sizeCardRow}>
                    <Icon name="cloud-download" size={28} color="#4CAF50" />
                    <View style={styles.sizeCardText}>
                      <Text style={styles.sizeLabel}>
                        {t('landing.downloadSize', 'Download Size')}
                      </Text>
                      <Text style={styles.sizeValue}>
                        {sizeStr
                          ? t('settingsScreen.estimatedSize', '~{{size}}', { size: sizeStr })
                          : t('settingsScreen.sizeUnavailable', 'Size not available')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.sizeCardRow}>
                    <Icon name="wifi" size={18} color="#888" />
                    <Text style={styles.wifiNote}>
                      {t('settingsScreen.wifiRecommended', 'A Wi-Fi connection is recommended for large downloads.')}
                    </Text>
                  </View>
                </>
              )}
            </View>



            <TouchableOpacity
              style={[styles.downloadBtn, fetchingSize && styles.downloadBtnDisabled]}
              onPress={handleStartDownload}
              disabled={fetchingSize}
              activeOpacity={0.8}
            >
              <Icon name="file-download" size={20} color="#fff" style={styles.btnIcon} />
              <Text style={styles.downloadBtnText}>
                {t('landing.downloadNow', 'DOWNLOAD NOW')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── DOWNLOADING PHASE: progress bar ───────────────── */}
        {downloadPhase === 'downloading' && (
          <View style={styles.progressContainer}>
            <Icon name="cloud-download" size={44} color="#4CAF50" style={styles.progressIcon} />
            <Text style={styles.progressTitle}>
              {t('landing.downloadingContent', 'Downloading Content')}
            </Text>
            <Text style={[styles.progressLabel, isRTL && styles.progressLabelRTL]}>
              {progressLabel}
            </Text>

            {/* Progress bar track */}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.progressPercent}>{progress}%</Text>

            <View style={styles.doNotCloseRow}>
              <Icon name="warning" size={14} color="#FF9800" />
              <Text style={styles.doNotCloseText}>
                {t('landing.doNotClose', 'Please keep the app open until download is complete.')}
              </Text>
            </View>
          </View>
        )}

        {/* ── Bottom note (idle only) ──────────────────────── */}
        {downloadPhase === 'idle' && (
          <View style={styles.bottomInfo}>
            <Icon name="info-outline" size={16} color="#aaa" />
            <Text style={[styles.infoText, isRTL && styles.infoTextRTL]}>
              {t('landing.infoNote', 'This ensures you always have the latest and most secure content.')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // ── Top bar ────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarRTL: {
    flexDirection: 'row-reverse',
  },
  topBarSpacer: { flex: 1 },
  globeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    gap: 4,
  },
  currentLangLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },

  // ── Language dropdown ──────────────────────────────────────
  langMenuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  langMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  langMenu: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  langMenuRTL: {
    right: undefined,
    left: 16,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  langOptionActive: {
    backgroundColor: '#f0faf0',
  },
  langOptionText: {
    fontSize: 15,
    color: '#444',
  },
  langOptionTextActive: {
    color: '#4CAF50',
    fontWeight: '700',
  },

  // ── Scroll content ─────────────────────────────────────────
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
  },
  scrollContentRTL: {
    direction: 'rtl',
  },

  // ── Header ─────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleRTL: { textAlign: 'center' },

  // ── Description ────────────────────────────────────────────
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555',
    textAlign: 'center',
    marginBottom: 28,
  },
  descriptionRTL: { textAlign: 'center' },

  // ── Size card ───────────────────────────────────────────────
  sizeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  sizeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeCardText: { flex: 1 },
  sizeLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sizeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  sizeLoadingText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  wifiNote: {
    fontSize: 12,
    color: '#888',
    flex: 1,
    lineHeight: 18,
  },

  // ── Download button ────────────────────────────────────────
  downloadBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 220,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadBtnDisabled: {
    backgroundColor: '#a5d6a7',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnIcon: { marginRight: 10 },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ── Progress container ─────────────────────────────────────
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressIcon: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressLabelRTL: { textAlign: 'center' },

  // Progress bar
  barTrack: {
    width: '100%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 7,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 24,
  },

  // Do-not-close warning
  doNotCloseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  doNotCloseText: {
    fontSize: 12,
    color: '#795548',
    flex: 1,
  },

  // ── Error / No-internet modal ──────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  modalIconRow: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // ── Bottom info ────────────────────────────────────────────
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#aaa',
    flex: 1,
    lineHeight: 18,
  },
  infoTextRTL: { textAlign: 'right' },
});

export default LandingScreen;