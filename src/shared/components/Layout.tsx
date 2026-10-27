import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "@/shared/components/Footer";
import { useAuth } from "@/features/auth/auth.context";
import { Globe2, Menu, Settings as SettingsIcon, X } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";
import NewVersionBanner from "@/shared/components/NewVersionBanner";
import { usePWA } from "@/shared/hooks/usePWA";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const AUTH_REDIRECT_KEY = "auth_redirect";

const Layout = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === "en" ? "en" : "fr";
  const navigate = useNavigate();
  const location = useLocation();
  const isPWA = usePWA();
  const isHomepage = location.pathname === "/";
  const isAccountArea = location.pathname === "/profile" || location.pathname === "/settings";
  // Après OAuth, Supabase peut renvoyer vers /profile ou / au lieu de /admin : on corrige ici.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    const target = sessionStorage.getItem(AUTH_REDIRECT_KEY);
    if (target === "/admin" && (location.pathname === "/profile" || location.pathname === "/")) {
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      navigate("/admin", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // App route ensures standard manifest
  useEffect(() => {
    const link = document.getElementById("app-manifest") as HTMLLinkElement;
    if (link && link.href !== window.location.origin + "/manifest.webmanifest") {
      link.href = "/manifest.webmanifest";
    }
  }, []);

  return (
    <div className={`flex min-h-[100dvh] bg-background text-foreground transition-colors overflow-x-hidden ${isPWA ? 'mode-pwa font-sans' : 'font-editorial'} pt-safe pb-safe`}>
      {/* Background tech ambiance — web uniquement, très subtil */}
      {!isPWA && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src="/header/header-2.png"
            alt=""
            className="absolute w-full h-full object-cover"
            style={{ opacity: 0.022, filter: "blur(40px) saturate(1.4)", transform: "scale(1.1)" }}
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
      )}
      <div className={`flex-1 flex flex-col relative min-w-0 md:pb-0 pb-20`}>
        {/* A solid surface preserves contrast at every scroll position. */}
        {/* Solid, sticky navigation with predictable contrast on every page. */}
        <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border/60 bg-background/95 pt-safe shadow-[0_1px_0_rgba(20,22,26,0.04)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:max-w-7xl lg:px-8">
            <Link to={isPWA ? "/settings" : "/"} className="inline-flex items-center gap-2.5 shrink-0" aria-label={t("layout.homeAria")}>
              {isPWA ? (
                <SettingsIcon className="h-6 w-6 text-foreground" strokeWidth={2} />
              ) : (
                <>
                  <img src={logo} alt="" className="h-9 w-9 rounded-xl object-cover ring-1 ring-border/50 sm:h-10 sm:w-10" />
                  <span className="font-display text-lg font-bold leading-none tracking-tight text-foreground">TΞKΗ+</span>
                </>
              )}
            </Link>

            {!isPWA && (
              <>
                <nav aria-label={t("layout.mainNavigation")} className="hidden items-center gap-6 text-sm font-semibold lg:flex">
                  <Link to="/deals" className="text-muted-foreground transition-colors hover:text-foreground">{t("layout.catalogue")}</Link>
                  <Link to="/#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">{t("layout.howItWorks")}</Link>
                  <Link to="/maintenance" className="text-muted-foreground transition-colors hover:text-foreground">{t("layout.maintenance")}</Link>
                  <Link to="/diagnose" className="text-muted-foreground transition-colors hover:text-foreground">{t("layout.imei")}</Link>
                </nav>
                <div className="hidden items-center gap-3 lg:flex">
                  <button type="button" onClick={() => i18n.changeLanguage(language === "fr" ? "en" : "fr")} aria-label={t("layout.changeLanguage")} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{language.toUpperCase()}</span>
                  </button>
                  <Link to={user ? "/profile" : "/login"} className="rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                    {user ? t("layout.account") : t("layout.login")}
                  </Link>
                  <Link to="/simulateur" className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--tekh-green))] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/10 transition-all hover:-translate-y-0.5 hover:bg-[hsl(142_76%_30%)]">
                    {t("layout.estimate")}
                  </Link>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                  <button type="button" onClick={() => i18n.changeLanguage(language === "fr" ? "en" : "fr")} aria-label={t("layout.changeLanguage")} className="inline-flex h-9 items-center gap-1 rounded-full border border-border/70 px-2 text-[10px] font-bold tracking-wide text-foreground transition-colors hover:bg-muted sm:h-10 sm:px-3 sm:text-xs">
                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{language.toUpperCase()}</span>
                  </button>
                  <Link to="/simulateur" className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--tekh-green))] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white sm:px-4 sm:text-xs">
                    {t("layout.estimateShort")}
                  </Link>
                  <button
                    type="button"
                    aria-label={mobileMenuOpen ? t("layout.closeMenu") : t("layout.openMenu")}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation"
                    onClick={() => setMobileMenuOpen((open) => !open)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground transition-colors hover:bg-muted"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {!isPWA && mobileMenuOpen && (
            <div id="mobile-navigation" className="border-t border-border/60 bg-background px-4 py-4 shadow-lg lg:hidden">
              <nav aria-label={t("layout.mobileNavigation")} className="mx-auto grid max-w-7xl gap-1">
                {[
                  [t("layout.catalogue"), "/deals"],
                  [t("layout.howItWorks"), "/#how-it-works"],
                  [t("layout.maintenance"), "/maintenance"],
                  [t("layout.imei"), "/diagnose"],
                ].map(([label, to]) => (
                  <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                    {label}
                  </Link>
                ))}
                <Link to={user ? "/profile" : "/login"} onClick={() => setMobileMenuOpen(false)} className="mt-2 rounded-xl border border-border/70 px-4 py-3 text-center text-sm font-semibold text-foreground">
                  {user ? t("layout.account") : t("layout.login")}
                </Link>
              </nav>
            </div>
          )}
        </header>
        <main className="flex-1 min-w-0 w-full">
          <Outlet />
        </main>
        {/* Footer web */}
        {!isAccountArea && <Footer />}
      </div>
      <NewVersionBanner />
    </div>
  );
};

export default Layout;
