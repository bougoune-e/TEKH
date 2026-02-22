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
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <PWAInstallBanner />
      <div className="flex-1 flex flex-col md:pl-16 relative">
        {/* Premium Native Header (Pinterest-Smooth) */}
        <header className="sticky top-0 z-40 border-b border-border/5 bg-background/90 backdrop-blur-xl transition-all h-safe-header pt-safe">
          <div className="container mx-auto px-5 h-[70px] flex items-center justify-between gap-4">
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

            {/* Central Search Bar - Pinterest Style (Centered & Fluid) */}
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>

            {/* Action Group (Icons 24px) */}
            <div className="flex items-center gap-2">
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

        <main className="flex-1">
          <Outlet />
        </main>
        {showFooter && <Footer />}
      </div>
      <TekhBot />
      <BottomNav />
    </div>
  );
};

export default Layout;
