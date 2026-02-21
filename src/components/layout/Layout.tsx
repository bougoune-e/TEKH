import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/layout/SearchBar";
import BottomNav from "@/components/layout/BottomNav";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";
import PWAInstallBanner from "@/components/layout/PWAInstallBanner";
import { TekhBot } from "@/components/features/chatbot/TekhBot";


const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
        {/* Modern Header */}
        <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-md transition-all">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Logo Mobile */}
            <a href="/" className="md:hidden">
              <img src={logo} alt="TΞKΗ+" className="h-10 w-10 rounded-full" />
            </a>

            {/* Central Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto">
              <SearchBar />
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <div className="hidden sm:block standalone:hidden">
                <ThemeToggle />
              </div>

              {/* 🔔 Notification Bell */}
              <button className="relative p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all group/bell">
                <Bell className="h-6 w-6 text-black dark:text-white group-hover/bell:text-blue-700 dark:group-hover/bell:text-primary" strokeWidth={2} />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-600 rounded-full border-2 border-background" />
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
