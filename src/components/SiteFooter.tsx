import { Link } from "@tanstack/react-router";
import { useTranslation } from "@/hooks/use-translation";
import { LogoComponent } from "@/components/LogoComponent";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <LogoComponent size="md" />
            <div>
              <div className="font-display text-lg font-bold">Amana Invest</div>
              <div className="text-xs text-muted-foreground">{t('footer.tagline')}</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            {t('footer.description')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-foreground">
            <span className="h-2 w-2 rounded-full bg-gold" /> {t('footer.launch')}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold">{t('footer.links')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/projects" className="hover:text-primary">{t('footer.links_projects')}</Link></li>
            <li><Link to="/about" className="hover:text-primary">{t('footer.links_investment')}</Link></li>
            <li><Link to="/contact" className="hover:text-primary">{t('footer.links_contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold">{t('footer.partners')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t('footer.partners_banks')}</li>
            <li>{t('footer.partners_council')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Amana Invest — {t('footer.copyright')}.
      </div>
    </footer>
  );
}
