import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/shared/components/Sidebar";
import Footer from "@/shared/components/Footer";
import SearchBar from "@/shared/components/SearchBar";
import BottomNav from "@/shared/components/BottomNav";
import { useAuth } from "@/features/auth/auth.context";
import { Bell, Settings as SettingsIcon } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";
import PWAInstallBanner from "@/shared/components/PWAInstallBanner";
import NewVersionBanner from "@/shared/components/NewVersionBanner";
import { usePWA } from "@/shared/hooks/usePWA";
import { Link } from "react-router-dom";


const AUTH_REDIRECT_KEY = "auth_redirect";

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPWA = usePWA();
  const isHomepage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Après OAuth, Supabase peut renvoyer vers /profile ou / au lieu de /admin : on corrige ici.
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
    <div className={`flex min-h-[100dvh] bg-background text-foreground transition-colors overflow-x-hidden ${isPWA ? 'mode-pwa' : ''} pt-safe pb-safe`}>
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
      <Sidebar />
      <PWAInstallBanner />
      <div className={`flex-1 flex flex-col md:pl-16 relative min-w-0 md:pb-0 ${isPWA ? "pb-28" : "pb-20"}`}>
        {/* Header — transparent en haut de la homepage, opaque ailleurs */}
        <header className={`sticky top-0 z-40 w-full transition-all duration-300 pt-safe shrink-0 ${isHomepage && !scrolled && !isPWA
          ? "border-transparent bg-transparent"
          : "border-b border-border/5 bg-background/95 backdrop-blur-xl"
          }`}>
          <div className="w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
            {/* Branding / Logo Area */}
            <div className="flex items-center gap-3">
              <Link
                to={isPWA ? "/settings" : "/"}
                className="md:hidden shrink-0 p-2 hover:bg-white/5 rounded-full transition-all group/settings active:scale-95"
              >
                {isPWA ? (
                  <SettingsIcon className="h-6 w-6 text-foreground group-hover/settings:text-primary" strokeWidth={2} />
                ) : (
                  <div className="h-10 w-10 rounded-xl overflow-hidden border border-border/10 flex items-center justify-center">
                    <img src={logo} alt="TΞKΗ+" className="h-full w-full object-cover" />
                  </div>
                )}
              </Link>
            </div>

            {/* Barre de recherche centrée, fluide */}
            <div className="flex-1 min-w-0 max-w-xl mx-auto">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 hover:bg-white/5 rounded-full transition-all group/bell active:scale-90"
              >
                <Bell className="h-[24px] w-[24px] text-foreground group-hover/bell:text-primary" strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 w-full">
          <Outlet />
        </main>
        {/* Web: footer on all pages. PWA: footer on home page only */}
        {(!isPWA || isHomepage) && <Footer />}
      </div>
      <NewVersionBanner />
      <BottomNav />
    </div>
  );
};

export default Layout;
