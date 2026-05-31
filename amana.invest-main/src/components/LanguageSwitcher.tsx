import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: 'ar' | 'en' | 'fr'; label: string }[] = [
    { code: 'ar', label: t('language.ar', 'العربية') },
    { code: 'en', label: t('language.en', 'English') },
    { code: 'fr', label: t('language.fr', 'Français') },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value) => setLanguage(value as 'ar' | 'en' | 'fr')}>
        <SelectTrigger className="w-[140px] border-0 bg-transparent p-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
