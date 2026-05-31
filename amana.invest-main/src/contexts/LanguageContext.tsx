import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';

type Language = 'ar' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, any>;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationMap: Record<Language, Record<string, any>> = {
  ar: arTranslations,
  en: enTranslations,
  fr: frTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'ar';
    }
    return 'ar';
  });

  const [translations, setTranslations] = useState<Record<string, any>>(translationMap[language]);

  // Load translations when language changes
  useEffect(() => {
    try {
      const newTranslations = translationMap[language];
      setTranslations(newTranslations);
      
      // Update document language and direction
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      
      // Save to localStorage
      localStorage.setItem('language', language);
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Function to get nested translation
  const t = (key: string, defaultValue: string = key): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
