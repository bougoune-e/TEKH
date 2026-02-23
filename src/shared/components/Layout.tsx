import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/shared/components/Sidebar";
import Footer from "@/shared/components/Footer";
import SearchBar from "@/shared/components/SearchBar";
import BottomNav from "@/shared/components/BottomNav";
import ThemeToggle from "@/shared/components/ThemeToggle";
import { useAuth } from "@/features/auth/auth.context";
import { Bell, Bot, Settings as SettingsIcon } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";
import PWAInstallBanner from "@/shared/components/PWAInstallBanner";
import NewVersionBanner from "@/shared/components/NewVersionBanner";
import { TekhBot } from "@/features/chatbot/TekhBot";
import { usePWA } from "@/shared/hooks/usePWA";
import { Link } from "react-router-dom";


const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPWA = usePWA();
  const showFooter = location.pathname === "/";

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className={`flex min-h-[100dvh] bg-background text-foreground transition-colors overflow-x-hidden ${isPWA ? 'mode-pwa' : ''} pt-safe pb-safe`}>
      <Sidebar />
      <PWAInstallBanner />
      <div className="flex-1 flex flex-col md:pl-16 relative min-w-0">
        {/* Header pleine largeur — prend bien l'écran */}
        <header className="sticky top-0 z-40 w-full border-b border-border/5 bg-background/95 backdrop-blur-xl transition-all pt-safe shrink-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
            {/* Branding / Logo Area */}
            <div className="flex items-center gap-3">
              <Link
                to={isPWA ? "/settings" : "/"}
                className="md:hidden shrink-0 active:scale-95 transition-transform"
              >
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-border/10 flex items-center justify-center bg-zinc-900 border-white/5">
                  {isPWA ? (
                    <SettingsIcon className="h-6 w-6 text-primary" />
                  ) : (
                    <img src={logo} alt="TΞKΗ+" className="h-full w-full object-cover" />
                  )}
                </div>
              </Link>
            </div>

            {/* Barre de recherche centrée, fluide */}
            <div className="flex-1 min-w-0 max-w-xl mx-auto">
              <SearchBar />
            </div>

            {/* Action Group — Settings masqué en PWA (accès via logo) */}
            <div className="flex items-center gap-2">
              {!isPWA && (
                <Link
                  to="/settings"
                  className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-90"
                  aria-label="Paramètres"
                >
                  <SettingsIcon className="h-[24px] w-[24px] text-foreground hover:text-primary" />
                </Link>
              )}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-tekhbot'))}
                className="p-2 hover:bg-white/5 rounded-full transition-all group/bot active:scale-90"
              >
                <Bot className="h-[24px] w-[24px] text-foreground group-hover/bot:text-primary" />
              </button>
              <button className="relative p-2 hover:bg-white/5 rounded-full transition-all group/bell active:scale-90">
                <Bell className="h-[24px] w-[24px] text-foreground group-hover/bell:text-primary" strokeWidth={2} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 w-full">
          <Outlet />
        </main>
        {showFooter && <Footer />}
      </div>
      <TekhBot />
      <NewVersionBanner />
      <BottomNav />
    </div>
  );
};

export default Layout;
