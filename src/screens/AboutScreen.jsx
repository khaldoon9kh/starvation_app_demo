import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { useGlossary } from '../hooks/useFirebaseData';

const AboutScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { glossaryTerms } = useGlossary();

  // Modal state for glossary popup
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define content based on language
  const englishContent = `### About Us

**Global Rights Compliance** (GRC) is a hybrid international law and development firm with one mission: to seek and achieve justice through the innovative application of the law. We specialise in on-the-ground international humanitarian law (IHL) and human rights issues in conflict-affected and high-risk areas around the world, working to identify, prevent and mitigate adverse IHL and human rights impacts.

More information is available at [globalrightscompliance.com](https://globalrightscompliance.com/). For more information on our Starvation program see: [starvationaccountability.org/](https://starvationaccountability.org/).

### About the Manual

This app is based on GRC's [Starvation Training Manual: An International Framework Guide to the Law of Starvation](https://starvationaccountability.org/resources/starvation-training-manual/) (Second Edition, 2022), as edited by:

**Catriona Murdoch**: Called to the Bar of England and Wales in 2009 and a member of 1 Crown Office Row Chambers in England, Catriona has practiced across several of the international criminal tribunals and courts, advising on crimes arising out of the Rwandan Genocide, the conflicts in Iraq, Yemen, Syria, South Sudan and the former Yugoslavia. Domestically she is instructed in European Convention of Human Rights claims. Catriona is ranked as a leading junior in both the Legal 500 and Chambers and Partners, where she was recommended as 'star of the future'. Catriona is a Partner at GRC and leads the "[Accountability](reference) for Mass Starvation: Testing the Limits of the Law" Project.

The Second Edition is drafted by:

**Yuqing Liu**: Yuqing is a Chinese lawyer specialised in international criminal law and international humanitarian law. Since 2014, Yuqing has served as a legal officer as well as in various other capacities in different Defence teams at the International Residual Mechanism for Criminal Tribunals (IRMCT), the Special Tribunal for Lebanon (STL) and the International Criminal Court (ICC). She is on the Justice Rapid Response Expert Roster as of July 2019 for her investigative expertise especially in the area of telecommunications. Yuqing joined GRC in September 2021 and works on the "[Accountability](reference) for Mass Starvation" project.

**Niriksha Sanghvi**: Admitted to practice in India, Niriksha specialises in international criminal law, humanitarian law and business and human rights. Since 2019, Niriksha serves as legal assistant in a Defence team at the International Residual Mechanism for Criminal Tribunals (IRMCT). With GRC, Niriksha has worked on phase I and phase II of the "[Accountability](reference) for Mass Starvation" project, "International Law and Defining Russia's Involvement in Crimea and Donbas" project and "Business and Human Rights" projects. Niriksha has also worked with an international human rights NGO on gender-based violence and a prominent corporate law firm in India. She holds a Bachelor of Laws from Gujarat National Law University, India and an Advanced LLM in Public International Law with a specialisation in international criminal law from Leiden University, Netherlands.

**Prachiti Venkatraman**: Called to the Bar of England and Wales in 2017, Prachiti specialises in international criminal and human rights law. With GRC, Prachiti works on the "[Accountability](reference) for Mass Starvation" Project. She regularly conducts analytical research and drafts policy and advisory papers on the use of starvation as a weapon of war, the applicable international criminal and humanitarian laws, relevant regional and international human rights framework, and the implementation and utility of UNSC 2417. Prachiti holds a Master of Laws in International and European Law, with a specialisation in Public International Law, from the University of Amsterdam as well as a Master of Laws in Professional Legal Practice from BPP University, London. She completed her Bachelor of Laws at the University of Warwick.

**Sofia Poulopoulou**: Sofia is an international jurist specialised in IHL. Prior to GRC, Sofia was a doctoral researcher, and a staff member of the Kalshoven-Gieskes Forum on IHL at Leiden University. Sofia has lectured and delivered extensive training on IHL and has also been accepted as a visiting research fellow at the Graduate Institute of International and Development Studies in Geneva.

Additionally, we are immensely grateful to **Wayne Jordash QC**, the Managing Partner at GRC and **David Akerson**, Senior Legal Consultant for their expert review. We also thank our former Legal Consultant with GRC – **Kate Vigneswaran** for her inputs on various sub-sections of the manual and open-source investigation (OSINT) experts – **Yvonne McDermott Rees**, Professor of Law at Swansea University and Principal Investigator on OSR4Rights and **Dan Anlezark**, Clinton and Sky Global Challenges Scholar and OSINT specialist previously serving the Group of Eminent Regional and International Experts on Yemen (GEE Yemen) for their inputs on the OSINT section of the Manual.

The First Edition of the Manual was drafted by experienced international criminal and human rights lawyers and former Consultants at GRC - **Margherita Stevioli**, **Uzay Yasar Aysev** along with **Niriksha Sanghvi** and externally reviewed by **Oliver Windridge**.

We are also grateful to the volunteers and interns who have over the years assisted in making the Manual.`;

  const arabicContent = `### نبذة عنا

**مؤسسة الامتثال للحقوق العالمية (GRC)** هي مؤسسة دولية متخصصة في القانون والتنمية لديها رسالة واحدة تتمثل في: التماس العدالة وتحقيقها من خلال تطبيق القانون بصورة مبتكرة. ونحن متخصصون في تطبيقات القانون الإنساني الدولي (IHL) وقضايا حقوق الإنسان على أرض الواقع في المناطق المتأثرة بالنزاعات والمناطق المعرضة للخطر الشديد في جميع أنحاء العالم، من خلال العمل على تحديد التداعيات السلبية للقانون الإنساني الدولي وحقوق الإنسان ومنعها والتخفيف من حِدتها.

وتتوفر المزيد من المعلومات على: [globalrightscompliance.org](https://globalrightscompliance.com/)، كما تتوفر معلومات عن برنامجنا المخصص للتجويع على: [starvationaccountability.org/](https://starvationaccountability.org/).

### نبذة عن الدليل

يستند تطبيق [المساءلة](reference) عن التجويع (Starvation Accountability) على الهاتف المحمول (تطبيق التجويع) إلى الدليل التدريبي للتجويع: وهو دليل إطار عمل دولي بشأن قانون حظر التجويع (الطبعة الثانية) (الدليل التدريبي للتجويع). وهو جزء من مشروع "[المساءلة](reference) عن التجويع: اختبار حدود القانون"، وهو مشروع رائد لمؤسسة الامتثال للحقوق العالمية وتموله وزارة الخارجية في مملكة هولندا. الآراء المعرب عنها هنا تمثل آراء المؤلف (المؤلفين) ولا تعكس السياسة أو الموقف الرسمي لمملكة هولندا.

الدليل التدريبي للتجويع: دليل إطار عمل دولي بشأن قانون حظر التجويع تم تحريره من قِبل:

**كاتريونا مردوخ:** وهي محامية منتسبة إلى نقابة المحامين في إنجلترا وويلز في عام 2009 وعضوًا في 1 Crown Office Row Chambers في إنجلترا، وقد مارست كاتريونا مهامها القانونية في العديد من المحاكم الجنائية الدولية، بتقديم المشورات بشأن الجرائم الناشئة عن الإبادة الجماعية في رواندا، والنزاعات في كل من العراق واليمن وسوريا وجنوب السودان ويوغوسلافيا السابقة. وعلى الصعيد المحلي، يتم تكليفها في الدعاوى ذات الصلة بالاتفاقية الأوروبية لحقوق الإنسان. وقد صُنفت كاتريونا كإحدى الشابات الرائدات في كل من Legal 500 وChambers and Partners، حيث تم ترشيحها كـ "نجمة المستقبل" كما أنها شريكة في مؤسسة الامتثال للحقوق العالمية (GRC) وتقود مشروع "[المساءلة](reference) عن التجويع الجماعي: اختبار حدود القانون".

أما الطبعة الثانية فهي من تأليف:

**يوتشينغ ليو:** وهي محامية صينية متخصصة في القانون الجنائيّ الدوليّ والقانون الإنساني الدولي. وقد عملت يوتشينغ، منذ عام 2014، كموظفة قانونية وكذلك في مناصب أخرى مختلفة في فرق الدفاع المختلفة في الآلية الدولية لتصريف الأعمال المتبقية للمحكمتين الجنائيتين (IRMCT)، والمحكمة الدولية الخاصة بلبنان (STL)، والمحكمة الجنائية الدولية (ICC). كما أن يوتشينغ مدرجة في قائمة خبراء الاستجابة السريعة في مجال العدالة منذ يوليو 2019 نظرًا لخبرتها في التحقيق خاصةً في مجال الاتصالات. وقد انضمت يوتشينغ إلى مؤسسة الامتثال للحقوق العالمية (GRC) في سبتمبر 2021 وتعمل في مشروع "[المساءلة](reference) عن التجويع الجماعي".

**نيريكشا سانغفي:** نيريكشا هي محامية حاصلة على إجازة ممارسة المحاماة في الهند، وهي متخصصة في القانون الجنائيّ الدوليّ والقانون الإنساني الدولي وقانون الأعمال التجارية وحقوق الإنسان. وتعمل نيريكشا، منذ عام 2019، كمساعد قانوني في فريق الدفاع في الآلية الدولية لتصريف الأعمال المتبقية للمحكمتين الجنائيتين (IRMCT). ومع مؤسسة الامتثال للحقوق العالمية (GRC)، عملت نيريكشا في المرحلة الأولى والمرحلة الثانية من مشروع "[المساءلة](reference) عن التجويع الجماعي"، ومشروع "القانون الدولي وتحديد تورط روسيا في شبه جزيرة القرم ودونباس" ومشاريع "الأعمال التجارية وحقوق الإنسان". كما عملت نيريكشا أيضًا مع منظمة غير حكومية دولية لحقوق الإنسان في مجال العنف القائم على النوع الاجتماعي ومع شركة محاماة بارزة في الهند. وهي حاصلة على بكالوريوس في القانون من جامعة غوجارات الوطنية للقانون، بالهند، ودرجة الماجستير في القانون الدولي العام مع تخصص في القانون الجنائيّ الدوليّ من جامعة ليدن، هولندا.

**براتشيتي فينكاترامان:** وهي محامية تم استدعاؤها إلى نقابة المحامين في إنجلترا وويلز في عام 2017، وهي متخصصة في القانون الجنائيّ الدوليّ وقانون حقوق الإنسان. وتعمل براتشيتي مع مؤسسة الامتثال للحقوق العالمية (GRC) على مشروع "[المساءلة](reference) عن التجويع الجماعي". وتجري بانتظام أبحاثًا تحليلية ومشاريع سياسات وتؤلف مقالات استشارية بشأن استخدام التجويع كسلاح في الحرب، والقوانين الجنائية والإنسانية الدولية المعمول بها، وإطار حقوق الإنسان الإقليمي والدولي ذي الصلة، وتنفيذ قرار مجلس الأمن رقم 2417 والاستدلال به. وبراتشيتي حاصلة على درجة الماجستير في القانون في كل من القانون الدولي والأوروبي، مع تخصص في القانون الدولي العام من جامعة أمستردام، بالإضافة إلى درجة الماجستير في القانون في الممارسة القانونية المهنية من جامعة پي پي بي، لندن. كما حصلت على درجة البكالوريوس في القانون في جامعة وارويك.

**صوفيا بولوبولو:** صوفيا هي محامية دولية متخصصة في القانون الإنساني الدولي. وقبل انضمامها إلى مؤسسة الامتثال للحقوق العالمية (GRC)، كانت صوفيا باحثة دكتوراه وعضوًا في منتدى كالشوفن-جيسكس حول القانون الدولي الإنساني في جامعة لايدن. وقد ألقت صوفيا محاضرات وقدمت تدريبًا مكثفًا عن القانون الإنساني الدولي، كما تم قبولها كزميلة باحثة زائرة في المعهد العالي للدراسات الدولية والتنموية في جنيف.

بالإضافة إلى ذلك، نحن في غاية الامتنان لكل من **واين جورداش**، الشريك الإداري في مؤسسة الامتثال للحقوق العالمية (GRC) و**ديفيد أكيرسون**، كبير المستشارين القانونيين لمراجعتهم المتخصصة. كما نتقدم بالشكر إلى مستشارتنا القانونية السابقة لدى مؤسسة الامتثال للحقوق العالمية (GRC) - **كيت فينيسواران** على مساهماتها في الأقسام الفرعية المختلفة من الدليل ولخبراء التحقيقات مفتوحة المصدر (OSINT) **إيفون ماكديرموت ريس**، أستاذ القانون في جامعة سوانسي والمحقق الرئيسي في OSR4Rights، و**دان أنليزارك** الباحث في برنامج التحديات العالمية المقدم من Clinton and Sky وأخصائي التحقيقات مفتوحة المصدر (OSINT) وعمل سابقًا لدى فريق الخبراء الدوليين والإقليميين بشأن اليمن، لمساهماتهم في قسم التحقيقات مفتوحة المصدر في الدليل.

وقد تولى إعداد الطبعة الأولى من الدليل محامون ذوو خبرة دولية في مجال الجرائم الجنائية وحقوق الإنسان ومستشارون سابقون لدى مؤسسة الامتثال للحقوق العالمية (GRC) وهم - **مارغريتا ستيفيولي**، و**أوزاي ياسار آيسيف**، إلى جانب **نيريكشا سانغفي**، وتمت مراجعته خارجيًا على يد **أوليفر ويندريدج**.

ونحن ممتنون أيضًا للمتطوعين والمتدربين الذين ساعدونا على مر السنين في إعداد هذا الدليل.`;

  const content = i18n.language === 'ar' ? arabicContent : englishContent;

  // Function to find glossary term by reference
  const findGlossaryTerm = (reference) => {
    return glossaryTerms.find(term => 
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
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, displayText, glossaryRef) => {
      // Check if this is a glossary reference (not a regular URL)
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
    processedText = processedText.replace(/^---$/gm, '\n---\n');
    
    return processedText;
  };

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
      const screen = url.replace('#!', '');
      Alert.alert('Navigation', `Navigate to ${screen}`);
    } else {
      console.log('Unhandled link:', url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { textAlign: isRTL ? 'right' : 'center' }
        ]}>
          {t('about') || 'About'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <Markdown 
            style={isRTL ? {...markdownStyles, ...rtlMarkdownStyles} : markdownStyles}
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
  // Link styles - bold red for glossary links
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
    color: '#FF0000',
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
  header: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34, // Same as back button to center the title
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
});

export default AboutScreen;