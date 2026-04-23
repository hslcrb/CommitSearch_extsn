import en from './en.json';
import ko from './ko.json';

export type Language = 'en' | 'ko';

const translations = { en, ko };

export const t = (key: keyof typeof en, lang: Language = 'en') => {
  return translations[lang][key] || translations['en'][key];
};
