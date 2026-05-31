import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoComponent } from "@/components/LogoComponent";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
<img 
  src="/documents/logo.png" 
  alt="Amana Invest Logo" 
  className="h-12 w-12 object-contain" 
/>          <div className="leading-tight">
            <div className="font-display text-base font-bold text-foreground">{t('header.brand')}</div>
            <div className="text-[10px] font-medium tracking-wide text-muted-foreground">{t('header.tagline')}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>{t('nav.home')}</Link>
          <Link to="/projects" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.projects')}</Link>
          <Link to="/packages" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.packages')}</Link>
          <Link to="/education" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.education')}</Link>
          <Link to="/security" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.security')}</Link>
          <Link to="/about" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.investment')}</Link>
          <Link to="/contact" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground" activeProps={{ className: "text-primary" }}>{t('nav.contact')}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!loading && user ? (
            <Button asChild size="sm" className="bg-gradient-hero shadow-soft">
              <Link to="/dashboard">{t('auth.dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-hero shadow-soft hover:opacity-95">
                <Link to="/signup">{t('auth.signup')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
