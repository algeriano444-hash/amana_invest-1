# Internationalization (i18n) System Documentation

## Overview

This project implements a comprehensive internationalization system supporting Arabic (ar), English (en), and French (fr). The system provides:

- **Reactive Language Switching**: Change language without page reload
- **Persistent Language Selection**: Language preference saved to localStorage
- **RTL/LTR Support**: Automatic document direction based on language
- **Dynamic HTML Attributes**: `lang` and `dir` attributes update automatically
- **Type-Safe Translations**: Easy-to-use translation API

## Directory Structure

```
src/
├── locales/                    # Translation files
│   ├── ar.json               # Arabic translations
│   ├── en.json               # English translations
│   └── fr.json               # French translations
├── contexts/
│   ├── LanguageContext.tsx   # Language context and provider
│   └── index.ts              # Context exports
├── hooks/
│   └── use-translation.ts    # Translation hook
└── components/
    └── LanguageSwitcher.tsx  # Language switcher component
```

## JSON Translation Structure

Translations are organized hierarchically by section/feature:

```json
{
  "nav": {
    "home": "الرئيسية",
    "projects": "المشاريع"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "signup": "إنشاء حساب"
  }
}
```

## Usage

### 1. Wrap Your App with LanguageProvider

The `LanguageProvider` is already integrated in the root layout (`src/routes/__root.tsx`):

```tsx
<LanguageProvider>
  <QueryClientProvider client={queryClient}>
    <Outlet />
  </QueryClientProvider>
</LanguageProvider>
```

### 2. Use Translations in Components

```tsx
import { useTranslation } from '@/hooks/use-translation';

export function MyComponent() {
  const { t, interpolate, language } = useTranslation();

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{interpolate('projects.description', { count: 10 })}</p>
      <span>Current language: {language}</span>
    </div>
  );
}
```

### 3. Add Language Switcher to Header

The `LanguageSwitcher` component is already included in `SiteHeader`:

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// It's already in SiteHeader!
<LanguageSwitcher />
```

## API Reference

### `useTranslation()` Hook

Returns an object with:

```ts
{
  t: (key: string, defaultValue?: string) => string;
  interpolate: (key: string, variables?: Record<string, string | number>) => string;
  language: 'ar' | 'en' | 'fr';
}
```

**Examples:**

```ts
// Simple translation
const welcome = t('nav.home'); // "الرئيسية"

// Translation with variables
const desc = interpolate('projects.description', { count: 5 });
// Result: "اختر من بين 5 مشروعاً..."

// Get current language
console.log(language); // "ar"
```

### `useLanguage()` Hook (Advanced)

For advanced use cases, use the context directly:

```ts
import { useLanguage } from '@/contexts';

const { language, setLanguage, translations, t } = useLanguage();

// Change language
setLanguage('en');

// Access raw translations object
console.log(translations.nav);
```

## Adding New Translations

1. **Add to all language files** (`ar.json`, `en.json`, `fr.json`):

```json
{
  "myFeature": {
    "title": "My Feature Title",
    "description": "Feature description"
  }
}
```

2. **Use in component**:

```tsx
const { t } = useTranslation();
const title = t('myFeature.title');
```

## Interpolation (Variables in Translations)

To include variables in translations:

1. **Add placeholder in JSON**:

```json
{
  "message": "Found {count} projects"
}
```

2. **Use interpolate in component**:

```tsx
const { interpolate } = useTranslation();
const msg = interpolate('message', { count: 10 });
// Result: "Found 10 projects"
```

## Automatic Features

### Language Persistence

Language selection is automatically saved to `localStorage`:

```ts
// On app load, it checks:
const saved = localStorage.getItem('language');
// If found, it's used; otherwise, defaults to 'ar'
```

### Document Direction

The `lang` and `dir` attributes update automatically:

```ts
// When language changes to Arabic:
document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

// When language changes to English:
document.documentElement.lang = 'en';
document.documentElement.dir = 'ltr';
```

### Reactive Updates

Changing language triggers:
- ✅ Automatic re-render of all components using `useTranslation()`
- ✅ Document attributes update
- ✅ localStorage sync
- ✅ No page reload needed

## Supported Languages

| Code | Language | Direction | Display Name |
|------|----------|-----------|--------------|
| `ar` | Arabic | RTL | العربية |
| `en` | English | LTR | English |
| `fr` | French | LTR | Français |

## Current Translated Sections

### Components Already Updated

- ✅ **SiteHeader**: Navigation, authentication buttons
- ✅ **SiteFooter**: Footer links, company description
- ✅ **LanguageSwitcher**: Language selector dropdown

### Ready for Integration

The following sections have translations but need component updates:

- Projects page (title, filters, descriptions)
- Packages page
- Education page
- About page
- Contact page
- Home page hero section
- Contract templates

## Best Practices

1. **Always use translation keys** for user-facing text:
   ```tsx
   // ✅ Good
   <h1>{t('nav.home')}</h1>
   
   // ❌ Avoid
   <h1>Home</h1>
   ```

2. **Organize by feature/section** in JSON:
   ```json
   {
     "featureName": {
       "action": "Translation"
     }
   }
   ```

3. **Keep keys lowercase with dots** for nested values:
   ```ts
   t('section.subsection.key');
   ```

4. **Use interpolate for dynamic content**:
   ```tsx
   const msg = interpolate('count.items', { count: items.length });
   ```

5. **Provide fallback values** (optional):
   ```ts
   t('missing.key', 'Fallback text');
   ```

## Troubleshooting

### Translations Not Showing

1. Check if `LanguageProvider` wraps your app ✓ (Already done in __root.tsx)
2. Verify key exists in all language files
3. Check browser console for errors
4. Ensure JSON files are valid

### Language Not Persisting

- Check browser localStorage is enabled
- Clear localStorage: `localStorage.clear()`
- Reload page

### Wrong Direction (RTL/LTR)

- Check `document.documentElement.dir` in DevTools
- Verify language was set correctly
- Clear browser cache

## Performance Notes

- Translations are loaded on app init
- Subsequent language changes use already-loaded files
- Minimal re-renders (only components using `useTranslation()`)
- localStorage operations are fast

## Future Enhancements

Possible improvements:
- [ ] Lazy loading of translation files
- [ ] Translation management UI
- [ ] Pluralization support
- [ ] Date/number formatting per locale
- [ ] Translation validation in build process
- [ ] Missing key detection
