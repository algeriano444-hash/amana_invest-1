/**
 * EXAMPLE: How to Integrate i18n in Complex Components
 * 
 * This file shows patterns used to update components like Projects, Home, Education, etc.
 * Copy these patterns when updating other components.
 */

// ============================================
// PROJECTS PAGE EXAMPLE
// ============================================

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

// Example showing how projects.tsx should be updated:
export function ExampleProjectsPage() {
  const { t, interpolate } = useTranslation();
  const [active, setActive] = useState('all');
  const projects = []; // Array of projects
  
  return (
    <>
      <section className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-14">
          {/* Small label at top */}
          <div className="text-sm font-semibold text-primary">
            {t('projects.allProjects')}
          </div>
          
          {/* Main heading */}
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            {t('projects.title')}
          </h1>
          
          {/* Description with variable */}
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {interpolate('projects.description', { count: projects.length })}
          </p>

          {/* Category filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['all', 'real-estate', 'tech', 'agriculture'].map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={active === c ? "active" : ""}
              >
                {t(`categories.${c}`)} {/* Would need category translations */}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-6">
          {projects.map((p) => (
            <div key={p.id}>
              <h3>{p.name}</h3>
              <p>{t('projects.capital')}: {p.capital}</p>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {projects.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t('projects.noProjects')}
          </p>
        )}
      </section>
    </>
  );
}

// ============================================
// HOME PAGE HERO EXAMPLE
// ============================================

export function ExampleHomeHero() {
  const { t } = useTranslation();
  
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-hero">
      <div className="container mx-auto px-4 py-20 text-center">
        {/* Main heading */}
        <h1 className="font-display text-5xl font-bold text-primary-foreground">
          {t('home.hero_title')}
        </h1>
        
        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/85">
          {t('home.hero_subtitle')}
        </p>
        
        {/* Call-to-action buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button>{t('home.cta_explore')}</button>
          <button>{t('home.cta_learn')}</button>
        </div>
      </div>
    </section>
  );
}

// ============================================
// EDUCATION PAGE EXAMPLE
// ============================================

export function ExampleEducationPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <section className="container mx-auto px-4 py-14">
        <div className="mb-4 inline-flex items-center gap-2">
          <span>🎓</span>
          {/* Academy name */}
          {t('education.academy')}
        </div>
        
        {/* Heading */}
        <h1 className="font-display text-4xl font-bold">
          {t('education.title')}
        </h1>
        
        {/* Description */}
        <p className="mt-4">
          {t('education.description')}
        </p>
        
        {/* Warning box */}
        <div className="mt-8 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <p className="text-sm">
            {t('education.warning')}
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================
// ABOUT PAGE EXAMPLE
// ============================================

export function ExampleAboutPage() {
  const { t } = useTranslation();
  
  const sectors = [
    'sectors.real_estate',
    'sectors.agriculture', 
    'sectors.industry',
    'sectors.trade',
  ];
  
  const values = [
    { icon: '✓', key: 'values.transparency' },
    { icon: '📋', key: 'values.contracts' },
    { icon: '🏢', key: 'values.projects' },
    { icon: '🔒', key: 'values.ownership' },
    { icon: '📊', key: 'values.profits' },
  ];
  
  return (
    <div>
      {/* Header */}
      <h1>{t('about.title')}</h1>
      <p className="text-sm">{t('about.subtitle')}</p>
      
      {/* Description */}
      <p className="mt-4">{t('about.description')}</p>
      
      {/* Mission */}
      <section className="mt-8">
        <h2>{t('about.mission')}</h2>
        <p>{t('about.mission_desc')}</p>
      </section>
      
      {/* Available sectors */}
      <section className="mt-8">
        <h3>{t('about.sectors')}</h3>
        <ul>
          {sectors.map((sector) => (
            <li key={sector}>
              {t(sector, sector)} {/* Fallback to key if translation doesn't exist */}
            </li>
          ))}
        </ul>
      </section>
      
      {/* Values/Advantages */}
      <section className="mt-8">
        <h3>{t('about.values')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {values.map((value) => (
            <div key={value.key} className="flex gap-2">
              <span>{value.icon}</span>
              <p>{t(value.key)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================
// FORM EXAMPLE
// ============================================

export function ExampleForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  
  return (
    <form>
      {/* Input fields */}
      <div>
        <label>{t('auth.email')}</label>
        <input 
          placeholder={t('auth.email_placeholder')}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      
      <div>
        <label>{t('auth.password')}</label>
        <input 
          type="password"
          placeholder={t('auth.password_placeholder')}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      
      {/* Submit button */}
      <button type="submit">
        {t('auth.login')}
      </button>
      
      {/* Link */}
      <p>
        {t('auth.no_account')} 
        <a href="/signup">{t('auth.signup')}</a>
      </p>
    </form>
  );
}

// ============================================
// TRANSLATION INTEGRATION CHECKLIST
// ============================================

/**
 * When integrating i18n into a component:
 * 
 * 1. IMPORT
 *    ✓ import { useTranslation } from '@/hooks/use-translation';
 * 
 * 2. CALL HOOK
 *    ✓ const { t, interpolate, language } = useTranslation();
 * 
 * 3. EXTRACT STRINGS
 *    ✓ Find all hardcoded text in the component
 *    ✓ List them out: title, subtitle, button labels, etc.
 * 
 * 4. ADD TO JSON FILES
 *    ✓ Add to src/locales/ar.json
 *    ✓ Add to src/locales/en.json
 *    ✓ Add to src/locales/fr.json
 * 
 * 5. REPLACE HARDCODED TEXT
 *    ✓ "Home" -> {t('nav.home')}
 *    ✓ "Sign In" -> {t('auth.login')}
 *    ✓ etc.
 * 
 * 6. TEST
 *    ✓ Switch between all 3 languages
 *    ✓ Check layout for RTL language (Arabic)
 *    ✓ Verify no text overflow or layout issues
 * 
 * 7. COMMIT
 *    ✓ All translations complete
 *    ✓ Component works in all languages
 */
