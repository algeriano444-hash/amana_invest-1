import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Import translation files
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const resources = {
  ar: {
    translation: arTranslations,
  },
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

// Get stored language or default to 'ar'
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : 'ar';
const defaultLanguage = savedLanguage || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Set document properties
if (typeof window !== 'undefined') {
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // Listen for language changes
  i18n.on('languageChanged', (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  });
}

export default i18n;
