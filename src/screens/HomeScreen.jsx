import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { useFirebaseData, useDataStatus, useGlossary } from '../hooks/useFirebaseData';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const { categories, subcategories, glossaryTerms, diagrams, templates } = useFirebaseData();
  const { isLoading, hasError, error, isOnline, lastUpdated } = useDataStatus();
  const { glossaryTerms: glossaryTermsFromHook } = useGlossary();
  
  // Calculate statistics
  const stats = {
    categories: categories.length,
    subcategories: Object.values(subcategories).flat().length,
    glossaryTerms: glossaryTerms.length,
    diagrams: diagrams.length,
    templates: templates.length,
  };

  // Define content based on language
  const englishContent = `**Welcome to the Global Rights Compliance (GRC) Starvation Accountability app!**  
This mobile app is based on the Second Edition (2022) of GRC's [Starvation Training Manual](https://starvationaccountability.org/resources/starvation-training-manual/), a toolkit designed to support a wide range of professionals and practitioners in identifying, investigating, and addressing the deliberate use of starvation as a weapon of war and a tool against civilians.

The purpose of this app is to provide users with a concise, portable version of the Starvation Training Manual, setting out key information to assist practitioners in responding to starvation-related crimes and violations. The app is divided into the following sections:

**Law on Starvation**: Sets out the international criminal, humanitarian, and human rights law frameworks relevant to starvation-related crimes and violations. It explains at an introductory level what to look for in a starvation investigation by analysing, under international criminal law, (1) the elements of the war crime of starvation, (2) the mental elements used to establish criminal intent, and (3) the various modes of liability through which perpetrators may be held responsible, in accordance with the International Criminal Court’s Rome Statute.

**Basic Investigation Standards**: Identifies essential investigative principles and techniques to be followed when conducting investigations into starvation-related crimes and violations. This section also includes practical guidance, such as conducting open-source intelligence (OSINT) investigations and interviewing vulnerable individuals.

**Remedies**: Provides guidance on bringing cases, submissions, or complaints before international and domestic courts, UN human rights bodies and mechanisms, and sanctions regimes. This section also analyses obligations and engagement avenues arising from UN Security Council Resolution 2417 on conflict and hunger.

**Starvation-Related Crimes**: Examines, in addition to the war crime of starvation, other crimes under international law that may arise in starvation contexts, including genocide, crimes against humanity, and war crimes.

This app also contains practical **templates and checklists** that may support practitioners during interviews, investigations, evidence collection, and when raising concerns about starvation violations in appropriate forums.

For guidance on navigating the app, please see the [User's Guide](#!userguide). To download content and manage updates, please go to [Settings](#!settings).

This app was developed as part of GRC’s project **“Accountability for Mass Starvation: Testing the Limits of the Law”**, which received financial support from the Dutch Ministry of Foreign Affairs. The content of this app reflects the work of Global Rights Compliance alone.

**Disclaimer:** This application is an independent educational resource and is **not affiliated with, endorsed by, or representative of any government entity**, including the Government of the Netherlands.

More information and additional resources are available at:  
[https://starvationaccountability.org/](https://starvationaccountability.org/).`;

const arabicContent = `مرحبًا بك في **تطبيق المساءلة عن التجويع التابع لمؤسسة الامتثال للحقوق العالمية (GRC)!**  
يعتمد هذا التطبيق على الإصدار الثاني (2022) من [دليل تدريب التجويع](https://starvationaccountability.org/resources/starvation-training-manual/) الصادر عن مؤسسة الامتثال للحقوق العالمية، وهو دليل عملي يهدف إلى دعم مجموعة واسعة من المهنيين والممارسين في التعرف على الاستخدام المتعمد للتجويع كسلاح حرب والتحقيق فيه والتصدي له.

يهدف هذا التطبيق إلى تزويد المستخدمين بنسخة مختصرة ومحمولة من دليل تدريب التجويع، تتضمن معلومات أساسية لمساعدة الممارسين في التعامل مع الجرائم والانتهاكات المتعلقة بالتجويع. وينقسم التطبيق إلى الأقسام التالية:

**قانون التجويع:** يعرض أطر القانون الجنائي الدولي والقانون الدولي الإنساني وقانون حقوق الإنسان ذات الصلة بالجرائم والانتهاكات المرتبطة بالتجويع. ويوضح على المستوى التمهيدي ما ينبغي البحث عنه أثناء التحقيق، من خلال تحليل (1) عناصر جريمة الحرب المتمثلة في التجويع، (2) العناصر الذهنية لإثبات القصد الجنائي، و(3) أشكال المسؤولية التي يمكن من خلالها مساءلة الجناة، وفقًا لنظام روما الأساسي للمحكمة الجنائية الدولية.

**معايير التحقيق الأساسية:** يحدد المبادئ والتقنيات الأساسية التي يجب الالتزام بها عند إجراء تحقيقات في جرائم وانتهاكات التجويع. كما يتضمن إرشادات عملية مثل كيفية إجراء تحقيقات المصادر المفتوحة (OSINT) وكيفية إجراء المقابلات مع الفئات الضعيفة.

**سبل الانتصاف:** يقدم إرشادات بشأن رفع القضايا أو تقديم الشكاوى أمام المحاكم الدولية والمحلية، وهيئات وآليات حقوق الإنسان التابعة للأمم المتحدة، وأنظمة العقوبات. كما يحلل الالتزامات وسبل المشاركة الناشئة عن قرار مجلس الأمن رقم 2417 بشأن النزاع والجوع.

**الجرائم المرتبطة بالتجويع:** يتناول، بالإضافة إلى جريمة الحرب المتمثلة في التجويع، جرائم أخرى قد تنطبق في سياقات التجويع، بما في ذلك الإبادة الجماعية والجرائم ضد الإنسانية وجرائم الحرب.

يتضمن هذا التطبيق أيضًا مجموعة من **النماذج العملية وقوائم المراجعة** التي قد تساعد الممارسين أثناء إجراء المقابلات، وإعداد التحقيقات، وجمع الأدلة، وكذلك عند إثارة قضايا انتهاكات التجويع أمام الجهات المختصة.

للاطلاع على إرشادات استخدام التطبيق، يرجى الرجوع إلى [دليل المستخدم](#!userguide).  
ولتنزيل المحتوى وإدارة التحديثات، يرجى الانتقال إلى [الإعدادات](#!settings).

تم تطوير هذا التطبيق في إطار مشروع مؤسسة الامتثال للحقوق العالمية  
**"المساءلة عن المجاعة الجماعية: اختبار حدود القانون"**، والذي تلقى دعمًا ماليًا من وزارة الشؤون الخارجية الهولندية. ويعكس محتوى هذا التطبيق عمل مؤسسة الامتثال للحقوق العالمية وحدها.

**إخلاء مسؤولية:** هذا التطبيق مورد تعليمي مستقل، ولا يمثل ولا يرتبط بأي جهة حكومية، كما أنه غير معتمد من قبل أي حكومة، بما في ذلك حكومة مملكة هولندا.

لمزيد من المعلومات والموارد الإضافية، يرجى زيارة:  
[https://starvationaccountability.org/](https://starvationaccountability.org/).`;


  const content = i18n.language === 'ar' ? arabicContent : englishContent;

  // Function to find glossary term by reference
  const findGlossaryTerm = (reference) => {
    return glossaryTermsFromHook.find(term => 
      term.reference?.toLowerCase() === reference.toLowerCase() || 
      term.id?.toLowerCase() === reference.toLowerCase()
    );
  };

  // Handles: 1) [display text](glossary_reference) for flexible glossary linking
  //          2) --- for green horizontal divider lines
  const processContentWithTerms = (text) => {
    if (!text) return text;
    
    let processedText = text;
    
    // 1. Handle glossary links: [display text](glossary_reference)
    // Example: [International Human Rights Law](IHRL) becomes a clickable link
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, displayText, glossaryRef) => {
      // Check if this is a glossary reference (not a regular URL like http:// or https://)
      if (!glossaryRef.includes('://') && !glossaryRef.startsWith('http') && !glossaryRef.startsWith('mailto:')) {
        const term = findGlossaryTerm(glossaryRef);
        if (term) {
          // Convert to internal glossary protocol for handling
          return `[${displayText}](glossary://term/${encodeURIComponent(glossaryRef)})`;
        }
      }
      // Return original for regular links or non-existent glossary terms
      return match;
    });
    
    // 2. Handle horizontal dividers: --- becomes a markdown horizontal rule
    // This will be styled as a green line in the markdown styles
    processedText = processedText.replace(/^---$/gm, '\n---\n');
    
    return processedText;
  };

  // Modal state for glossary popup
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLinkPress = (url) => {
    if (url.startsWith('glossary://')) {
      const termId = decodeURIComponent(url.replace('glossary://term/', ''));
      const term = findGlossaryTerm(termId);
      if (term) {
        setSelectedTerm(term);
        setIsModalVisible(true);
      }
    } else if (url.startsWith('http') || url.startsWith('mailto:')) {
      Linking.openURL(url);
    } else if (url.startsWith('#!')) {
      // Handle internal navigation - for HomeScreen, we don't have navigation prop, so alert or ignore
      const screen = url.replace('#!', '');
      Alert.alert('Navigation', `Navigate to ${screen}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
        <Text style={styles.title}>{t('homeScreen.overview')}</Text>
        
        {/* Data Status Section */}
        <View style={styles.dataStatusContainer}>
          <Text style={styles.sectionTitle}>{t('homeScreen.contentStatus')}</Text>
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading content from Firebase...</Text>
            </View>
          )}
          
          {hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubText}>
                {isOnline ? 'Using cached content' : 'Check your internet connection'}
              </Text>
            </View>
          )}
          
          {!isLoading && !hasError && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ {t('homeScreen.contentLoaded')}</Text>
              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>{t('homeScreen.contentStatistics')}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.categories}</Text>
              <Text style={styles.statLabel}>{t('homeScreen.categories')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.subcategories}</Text>
              <Text style={styles.statLabel}>{t('homeScreen.subcategories')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.glossaryTerms}</Text>
              <Text style={styles.statLabel}>{t('homeScreen.glossaryTerms')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.diagrams}</Text>
              <Text style={styles.statLabel}>{t('homeScreen.diagrams')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.templates}</Text>
              <Text style={styles.statLabel}>{t('homeScreen.templates')}</Text>
            </View>
          </View>
        </View>
        
        <Markdown 
          style={i18n.language === 'ar' ? {...markdownStyles, ...rtlMarkdownStyles} : markdownStyles}
          onLinkPress={handleLinkPress}
        >
          {processContentWithTerms(content)}
        </Markdown>
        
        

      </View>
    </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {i18n.language === 'ar'
                  ? selectedTerm?.termArabic || selectedTerm?.term || 'Term'
                  : selectedTerm?.term || selectedTerm?.termArabic || 'Term'
                }
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[
                styles.modalDefinition,
                { textAlign: i18n.language === 'ar' ? 'right' : 'left' }
              ]}>
                {i18n.language === 'ar'
                  ? selectedTerm?.definitionArabic || selectedTerm?.definition || 'Definition not available'
                  : selectedTerm?.definition || selectedTerm?.definitionArabic || 'Definition not available'
                }
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const markdownStyles = {
  // Text styles
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  // Heading styles
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 15,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 18,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 10,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 14,
    marginBottom: 8,
  },
  // Paragraph styles
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  // List styles
  bullet_list: {
    marginBottom: 15,
  },
  ordered_list: {
    marginBottom: 15,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet_list_icon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  bullet_list_content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  ordered_list_icon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  ordered_list_content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  // Emphasis styles
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  em: {
    fontStyle: 'italic',
    color: '#333',
  },
  // Code styles
  code_inline: {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderRadius: 3,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#d63384',
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#d63384',
    marginBottom: 15,
  },
  // Link styles
  link: {
    color: '#FF0000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // Blockquote styles
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingLeft: 15,
    marginLeft: 0,
    marginBottom: 15,
    fontStyle: 'italic',
    color: '#666',
  },
  // Horizontal rule - green divider line
  hr: {
    height: 2,
    backgroundColor: '#4CAF50',
    marginVertical: 16,
    borderRadius: 1,
  },
};

const rtlMarkdownStyles = {
  // RTL-specific overrides
  text: {
    textAlign: 'right',
  },
  paragraph: {
    textAlign: 'right',
  },
  bullet_list_content: {
    textAlign: 'right',
  },
  ordered_list_content: {
    textAlign: 'right',
  },
  link: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  blockquote: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#4CAF50',
    paddingLeft: 0,
    paddingRight: 15,
    marginLeft: 0,
    marginRight: 0,
  },
  hr: {
    height: 2,
    backgroundColor: '#4CAF50',
    marginVertical: 16,
    borderRadius: 1,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 20,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 15,
  },
  linkText: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  // Firebase integration styles
  dataStatusContainer: {
    // marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorText: {
    color: '#c62828',
    fontWeight: '500',
  },
  errorSubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  successContainer: {
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  successText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  lastUpdatedText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    maxHeight: 300,
    padding: 15,
  },
  modalDefinition: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default HomeScreen;
