import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['en'];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS['en'],
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to English ('en') as requested by user
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('lovable_lang');
      return (stored === 'en' || stored === 'si') ? stored : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lovable_lang', lang);
    } catch {
      // storage unavailable
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language] || TRANSLATIONS['en'],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
