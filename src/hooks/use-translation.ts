import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { t, language } = useLanguage();

  const translate = (key: string, defaultValue?: string): string => {
    return t(key, defaultValue);
  };

  // Helper for interpolation
  const interpolate = (key: string, variables: Record<string, string | number> = {}): string => {
    let text = t(key, key);
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(`{${varKey}}`, String(value));
    });
    return text;
  };

  return {
    t: translate,
    interpolate,
    language,
  };
}
