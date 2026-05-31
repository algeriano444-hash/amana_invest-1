#!/usr/bin/env node

/**
 * i18n Quick Reference - Common Translation Patterns
 * 
 * Copy these patterns to quickly integrate translations in any component
 */

// ============================================
// BASIC USAGE
// ============================================

// Pattern 1: Simple text replacement
import { useTranslation } from '@/hooks/use-translation';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('nav.home')}</h1>;
}

// ============================================
// WITH VARIABLES
// ============================================

// Pattern 2: Dynamic content with interpolation
function ProjectCount() {
  const { interpolate } = useTranslation();
  const projects = 10;
  
  return <p>{interpolate('projects.description', { count: projects })}</p>;
}

// ============================================
// CONDITIONAL RENDERING
// ============================================

// Pattern 3: Language-specific content
function LanguageInfo() {
  const { language } = useTranslation();
  
  return (
    <>
      {language === 'ar' && <p>محتوى عربي</p>}
      {language === 'en' && <p>English content</p>}
      {language === 'fr' && <p>Contenu français</p>}
    </>
  );
}

// ============================================
// COMPLEX FORMS
// ============================================

// Pattern 4: Form labels and validation
function LoginForm() {
  const { t } = useTranslation();
  
  return (
    <form>
      <label>{t('auth.email')}</label>
      <input placeholder={t('auth.email_placeholder')} />
      <button>{t('auth.login')}</button>
    </form>
  );
}

// ============================================
// LISTS AND ITERATIONS
// ============================================

// Pattern 5: Translatable list items
function NavigationMenu() {
  const { t } = useTranslation();
  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.projects', path: '/projects' },
    { key: 'nav.packages', path: '/packages' },
  ];
  
  return (
    <nav>
      {navItems.map(item => (
        <Link key={item.key} to={item.path}>
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}

// ============================================
// ADDING NEW TRANSLATIONS
// ============================================

/**
 * STEP 1: Add to ar.json
 * {
 *   "newFeature": {
 *     "title": "عنوان الميزة الجديدة",
 *     "description": "وصف الميزة"
 *   }
 * }
 * 
 * STEP 2: Add to en.json
 * {
 *   "newFeature": {
 *     "title": "New Feature Title",
 *     "description": "Feature description"
 *   }
 * }
 * 
 * STEP 3: Add to fr.json
 * {
 *   "newFeature": {
 *     "title": "Titre de la Nouvelle Fonctionnalité",
 *     "description": "Description de la fonctionnalité"
 *   }
 * }
 * 
 * STEP 4: Use in component
 * const { t } = useTranslation();
 * <h1>{t('newFeature.title')}</h1>
 */

// ============================================
// TRANSLATION CHECKLIST
// ============================================

/**
 * When translating a component:
 * 
 * [ ] Import useTranslation hook
 * [ ] Extract all hardcoded text strings
 * [ ] Add strings to all JSON files (ar, en, fr)
 * [ ] Replace hardcoded strings with t() calls
 * [ ] Test with all three languages
 * [ ] Verify RTL/LTR layout is correct
 * [ ] Check for text overflow/layout issues
 */

// ============================================
// COMMON TRANSLATION KEYS
// ============================================

/**
 * Nav Keys: nav.*
 * Auth Keys: auth.*
 * Projects Keys: projects.*
 * Home Keys: home.*
 * Packages Keys: packages.*
 * Education Keys: education.*
 * About Keys: about.*
 * Contact Keys: contact.*
 * Contract Keys: contract.*
 * Language Keys: language.*
 */
