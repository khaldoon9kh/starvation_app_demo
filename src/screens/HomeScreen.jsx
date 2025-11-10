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
  const englishContent = `**Welcome to the Global Rights Compliance (GRC) Starvation Accountability app!** This mobile app is based on the Second Edition (2022) of GRC's unique [Starvation Training Manual](https://starvationaccountability.org/resources/starvation-training-manual/), a toolkit designed to assist a wide range of professionals and practitioners in identifying, investigating and addressing the deliberate use of starvation as a weapon of war and tool against civilians.

The purpose of this app is to provide users with a succinct, portable version of the Starvation Training Manual, setting out key information to assist practitioners in responding to starvation crimes and violations. The app is divided into the following sections:

**Law on Starvation**: Sets out the international criminal, humanitarian and human rights law frameworks relevant to starvation-related crimes and violations. Particularly useful for practitioners, it explains on an introductory level what to look for in a starvation investigation by analysing under international criminal law (1) the elements of the war crime of starvation, (2) mental elements utilised to establish perpetrators' criminal intent, and (3) the various modes of liability through which perpetrators can be held responsible, in accordance with the International Criminal Court's (ICC) Rome Statute (the key permanent body that is concerned with [accountability](reference) for international crimes).

**Basic Investigation Standards**: Identifies the essential investigative principles and techniques that must be adhered to while conducting an investigation into starvation crimes and violations. This section also features unique practical guides, including how to conduct open-source intelligence (OSINT) investigations and how to interview vulnerable individuals.

**Remedies**: Offers guidance on bringing a case, submission, or complaint before international and domestic courts, UN human rights bodies and investigative mechanisms, and sanctions regimes. This section also analyses the obligations and avenues for engagement arising out of UN Security Council Resolution 2417 on conflict and hunger.

**Starvation-Related Crimes**: Considers, in addition to the elements of the war crime of starvation analysed under 'Law on Starvation', several alternative crimes amounting to genocide, crimes against humanity and war crimes that may be found to have occurred in a starvation situation.

This app also contains several practical **templates and checklists** that would be of use to practitioners while conducting interviews, preparing investigations and collecting evidence, as well as while seeking to raise the issue of starvation violations in an appropriate forum.

For guidance on navigating the app, please see the [User's Guide](#!userguide). To download the app's contents and for updates, please go to [Settings](#!settings).

The app was developed under GRC's flagship '[Accountability](reference) for Mass Starvation: Testing the Limits of the Law' project, funded by the Kingdom of The Netherlands' Ministry of Foreign Affairs. The views expressed here are those of GRC and may not coincide with the official position of The Netherlands.  
More information and additional resources are available at: [https://starvationaccountability.org/](https://starvationaccountability.org/).`;

  const arabicContent = `مرحبًا بك في **تطبيق [المساءلة](reference) عن التجويع لمؤسسة الامتثال للحقوق العالمية (GRC)!** يرتكز هذا التطبيق على الإصدار الثاني (2022) من [دليل تدريب التجويع](https://starvationaccountability.org/resources/starvation-training-manual/) الفريد الخاص بمؤسسة الامتثال للحقوق العالمية، وهو عبارة عن مجموعة أدوات مصممة لمساعدة مجموعة واسعة من المهنيين والممارسين في التعرف والتحقيق والتطرق للاستخدام المتعمد للتجويع كسلاح حرب وأداة ضد المدنيين.

الغرض من هذا التطبيق هو تزويد المستخدمين بنسخة محمولة وموجزة من دليل التدريب على التجويع، مع تحديد المعلومات الأساسية لمساعدة الممارسين في الاستجابة لجرائم وانتهاكات التجويع. وينقسم التطبيق إلى الأقسام التالية:

**قانون التجويع:** يحدد أطر القانون الجنائي الدولي والإنساني وقانون حقوق الإنسان المتصلة بالجرائم والانتهاكات المتعلقة بالتجويع. وهو مفيد بشكل خاص للممارسين، فهو يشرح على المستوى التمهيدي ما يجب البحث عنه في التحقيق في التجويع من خلال التحليل بموجب القانون الجنائي الدولي (1) عناصر جريمة الحرب المتمثلة في التجويع، (2) العناصر العقلية المستخدمة لإثبات النية الإجرامية للجناة، و(3) مختلف أشكال المسؤولية التي يمكن من خلالها تحميل الجناة المسؤولية، وفقاً لنظام روما الأساسي للمحكمة الجنائية الدولية (الهيئة الدائمة الرئيسية المعنية بـ[المساءلة](reference) عن الجرائم الدولية).

**معايير التحقيق الأساسية:** تحديد مبادئ وتقنيات التحقيق الأساسية التي يجب الالتزام بها أثناء إجراء التحقيق في جرائم وانتهاكات التجويع. يحتوي هذا القسم أيضًا على أدلة عملية فريدة من نوعها، بما في ذلك كيفية إجراء تحقيقات مفتوحة المصدر (OSINT) وكيفية إجراء المقابلات.

**سبل الانتصاف:** تقدم إرشادات بشأن رفع قضية أو تقديم شكوى أمام المحاكم الدولية والمحلية، وهيئات حقوق الإنسان التابعة للأمم المتحدة وآليات التحقيق، وأنظمة العقوبات. ويحلل هذا القسم أيضًا الالتزامات وسبل المشاركة الناشئة عن قرار مجلس الأمن التابع للأمم المتحدة رقم 2417 بشأن النزاع والجوع.

**الجرائم المتعلقة بالتجويع:** بالإضافة إلى عناصر جريمة الحرب المتمثلة في التجويع التي تم تحليلها بموجب "قانون التجويع"، هناك العديد من الجرائم البديلة التي ترقى إلى مستوى الإبادة الجماعية والجرائم ضد الإنسانية وجرائم الحرب التي قد يتبين أنها حدثت في حالة التجويع.

ويحتوي هذا التطبيق أيضًا على العديد من **النماذج العملية وقوائم المراجعة** التي قد تكون مفيدة للممارسين أثناء إجراء المقابلات وإعداد التحقيقات وجمع الأدلة، وكذللك أثناء السعي لإثارة قضية انتهاكات التجويع في المنتدى المناسب.

للحصول على إرشادات حول التنقل في التطبيق، يرجى الاطلاع على [دليل المستخدم](#!userguide). لتنزيل محتويات التطبيق والحصول على التحديثات، يرجى الانتقال إلى [الإعدادات](#!settings).

تم تطوير التطبيق في إطار المشروع الرائد لمؤسسة الامتثال للحقوق العالمية "[المساءلة](reference) عن المجاعة الجماعية: اختبار حدود القانون"، بتمويل من وزارة الشؤون الخارجية في مملكة هولندا. الآراء الواردة هنا هي آراء مؤسسة الامتثال للحقوق العالمية وقد لا تتطابق مع الموقف الرسمي لهولندا.  
مزيد من المعلومات والموارد الإضافية متاحة على: [https://starvationaccountability.org/](https://starvationaccountability.org/).`;

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
    } else {
      // Fallback
      console.log('Unhandled link:', url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
        <Text style={styles.title}>OVERVIEW</Text>
        
        {/* Data Status Section */}
        <View style={styles.dataStatusContainer}>
          <Text style={styles.sectionTitle}>Content Status</Text>
          
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
              <Text style={styles.successText}>✅ Content loaded successfully</Text>
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
          <Text style={styles.sectionTitle}>Content Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.subcategories}</Text>
              <Text style={styles.statLabel}>Subcategories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.glossaryTerms}</Text>
              <Text style={styles.statLabel}>Glossary Terms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.diagrams}</Text>
              <Text style={styles.statLabel}>Diagrams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.templates}</Text>
              <Text style={styles.statLabel}>Templates</Text>
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
