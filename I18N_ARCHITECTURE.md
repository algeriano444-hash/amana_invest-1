# i18n Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Root                         │
│                  (src/routes/__root.tsx)                    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  <LanguageProvider>    (Language Context)          │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────┐    │    │
│  │  │  <QueryClientProvider>                    │    │    │
│  │  │                                           │    │    │
│  │  │  ┌──────────────────────────────────┐    │    │    │
│  │  │  │  Components using i18n:         │    │    │    │
│  │  │  │  - SiteHeader                    │    │    │    │
│  │  │  │  - SiteFooter                    │    │    │    │
│  │  │  │  - LanguageSwitcher              │    │    │    │
│  │  │  │  - All other pages               │    │    │    │
│  │  │  └──────────────────────────────────┘    │    │    │
│  │  │                                           │    │    │
│  │  │  ┌──────────────────────────────────┐    │    │    │
│  │  │  │  <Toaster />                     │    │    │    │
│  │  │  └──────────────────────────────────┘    │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ User Changes Language (Click Dropdown)                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  LanguageSwitcher     │
         │  setLanguage('en')    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────────────────┐
         │  LanguageContext                 │
         │  - Updates language state        │
         │  - Loads translation JSON        │
         │  - Updates document lang & dir   │
         │  - Saves to localStorage         │
         └───────────┬──────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
  ┌────────┐  ┌────────────────┐  ┌──────────────┐
  │ ar.json│  │  document.lang │  │ localStorage │
  │(Reload)│  │  document.dir  │  │   .setItem   │
  └────────┘  └────────────────┘  └──────────────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │ Context Notifies Subscribers │
      │ (All useTranslation hooks)   │
      └───────────┬──────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
┌─────────────┬─────────────┬──────────────┐
│SiteHeader   │SiteFooter   │All Pages     │
│Re-renders   │Re-renders   │Re-render     │
└─────────────┴─────────────┴──────────────┘
     │            │            │
     └────────────┼────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ New Content Displayed │
        │ (No Page Reload!)     │
        └──────────────────────┘
```

## Translation Key Resolution Flow

```
Component Calls: t('projects.title')
        │
        ▼
useTranslation Hook
        │
        ▼
    ┌─────────────────────────────┐
    │ Split key by dots:          │
    │ ['projects', 'title']       │
    └─────────┬───────────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ Access translations object: │
    │ translations[projects]      │
    │ → [title]                   │
    └─────────┬───────────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ Return translated value:    │
    │ "مشاريع حقيقية، استثمار آمن" │
    └─────────────────────────────┘
```

## localStorage Flow

```
┌─────────────────────────────────────────┐
│ Application First Load                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Check localStorage         │
    │ localStorage.getItem('lang')
    └──────┬─────────────┬───────┘
           │             │
        Found         Not Found
           │             │
           ▼             ▼
    ┌────────┐    ┌──────────────┐
    │Get 'ar'│    │Default to 'ar'│
    └────┬───┘    └───────┬───────┘
         │                │
         └────────┬───────┘
                  │
                  ▼
     ┌────────────────────────┐
     │ Load Translations      │
     │ from ar.json           │
     └────────────────────────┘

┌─────────────────────────────────────────┐
│ User Changes Language to 'en'           │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ setLanguage('en')          │
    └────────┬───────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ localStorage.setItem         │
    │ ('language', 'en')           │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Persist for next visit       │
    │ (No data loss on reload)     │
    └──────────────────────────────┘
```

## Component Integration Pattern

```
Traditional Component          →         i18n Integrated Component

┌─────────────────────────┐             ┌──────────────────────────────┐
│ import React            │             │ import React                 │
│                         │             │ import { useTranslation }    │
│ function MyComponent()  │             │   from '@/hooks/...'         │
│ {                       │             │                              │
│   return (              │      →      │ function MyComponent() {      │
│     <h1>                │             │   const { t } = useTranslation()
│       My Title          │             │                              │
│     </h1>              │             │   return (                   │
│   )                     │             │     <h1>                     │
│ }                       │             │       {t('section.title')}   │
└─────────────────────────┘             │     </h1>                    │
                                        │   )                          │
                                        │ }                            │
                                        └──────────────────────────────┘
```

## Document State Changes

```
┌──────────────────────────────────────────────────────────┐
│                   HTML Document                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ <html lang="ar" dir="rtl">                         │  │
│  │                                                    │  │
│  │   When language = 'ar':                           │  │
│  │   • Document direction: Right-to-Left             │  │
│  │   • Text flows: Right → Left                       │  │
│  │   • Sidebar/Nav: Right side                        │  │
│  │                                                    │  │
│  │ <html lang="en" dir="ltr">                        │  │
│  │                                                    │  │
│  │   When language = 'en' or 'fr':                   │  │
│  │   • Document direction: Left-to-Right             │  │
│  │   • Text flows: Left → Right                       │  │
│  │   • Sidebar/Nav: Left side                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  JavaScript Updates These Attributes:                   │
│  • document.documentElement.lang                        │
│  • document.documentElement.dir                         │
│  • CSS respects [dir] attribute                         │
└──────────────────────────────────────────────────────────┘
```

## Context Hook Subscription Model

```
┌────────────────────────────────────────────────────────┐
│ LanguageContext (Provider)                             │
│ - Maintains language state                             │
│ - Loads translations                                   │
│ - Notifies all subscribers on change                   │
└─────────────────┬──────────────────────────────────────┘
                  │
        ┌─────────┴─────────┬─────────────┐
        │                   │             │
        ▼                   ▼             ▼
   ┌──────────┐         ┌──────────┐  ┌──────────┐
   │Component │         │Component │  │Component │
   │ A        │         │ B        │  │ C        │
   │useTransl.│         │useTransl.│  │useTransl.│
   └──────────┘         └──────────┘  └──────────┘
        │                   │             │
        └─────────┬─────────┴─────────────┘
                  │
         Re-render on state change
         (Language context change)
```

## File Dependencies

```
Application Root
    ↓
__root.tsx
    ├─ Imports: LanguageProvider
    └─ Wraps: <LanguageProvider>
         ├─ SiteHeader.tsx
         │   ├─ Uses: useTranslation()
         │   ├─ Includes: LanguageSwitcher
         │   └─ Translates: nav.*, auth.*
         │
         ├─ SiteFooter.tsx
         │   ├─ Uses: useTranslation()
         │   └─ Translates: footer.*
         │
         ├─ Page Components (projects, home, etc.)
         │   ├─ Uses: useTranslation()
         │   └─ Translates: section-specific keys
         │
         └─ All other routes
             └─ Can use: useTranslation()
                 └─ From locales/*.json

LanguageProvider
    ├─ From: contexts/LanguageContext.tsx
    ├─ Loads: locales/ar.json, en.json, fr.json
    ├─ Manages: language state, document attrs
    └─ Uses: localStorage for persistence

useTranslation()
    ├─ From: hooks/use-translation.ts
    ├─ Calls: useLanguage() from context
    ├─ Provides: t(), interpolate(), language
    └─ Used by: All components needing translations

LanguageSwitcher
    ├─ From: components/LanguageSwitcher.tsx
    ├─ Uses: useLanguage() to change language
    ├─ Shows: Dropdown with 3 languages
    └─ Included in: SiteHeader
```

## Cache & Performance

```
App Load:
  ├─ Load ar.json (cached in translations state)
  ├─ Set document.lang = "ar"
  └─ All components use cached translations

Language Switch (ar → en):
  ├─ Load en.json (new network request)
  ├─ Update context state
  ├─ Re-render subscribed components
  ├─ Update document.lang = "en"
  └─ Cached for subsequent switches

Subsequent Switch (ar):
  ├─ Already cached in context
  ├─ NO network request
  ├─ Just update state
  ├─ Re-render components
  └─ Update document.lang = "ar"
  └─ Fast! (no loading delay)
```

## Key Benefits

```
✅ Reactive System
   └─ Changes without page reload

✅ Optimized Performance
   └─ Translations cached after first load

✅ Automatic RTL/LTR
   └─ Document direction updates automatically

✅ Persistent State
   └─ Language saved in localStorage

✅ Simple API
   └─ Just use t('key') or interpolate()

✅ Scalable Structure
   └─ Easy to add new languages/sections

✅ Type Safety
   └─ Organized key structure
```
