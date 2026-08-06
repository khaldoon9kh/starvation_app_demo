import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import translations
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Get device locale safely
const getDeviceLanguage = () => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0 && locales[0].languageCode) {
      return locales[0].languageCode;
    }
  } catch (e) {
    // Fallback to English if locale detection fails
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
