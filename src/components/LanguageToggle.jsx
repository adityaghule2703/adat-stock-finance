// src/components/LanguageToggle.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative p-2 rounded-full transition-all duration-300 hover:scale-110 flex items-center gap-1"
      style={{ background: '#F1F8E9' }}
      title={currentLanguage === 'en' ? 'Switch to Marathi' : 'इंग्रजीमध्ये स्विच करा'}
    >
      <Globe className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#2E7D32' }} />
      <span className="text-xs font-medium hidden sm:inline" style={{ color: '#2E7D32' }}>
        {currentLanguage === 'en' ? 'EN' : 'मराठी'}
      </span>
    </button>
  );
};

export default LanguageToggle;