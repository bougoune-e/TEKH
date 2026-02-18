import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseApi";
import { Bell } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";

// Icône user.svg inline — visible en mode clair ET sombre
const UserSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
    <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
  </svg>
);

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
      <div className="flex-1 flex flex-col md:pl-16">
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
              <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                <Bell className="h-6 w-6 text-foreground" strokeWidth={2} />
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
      <BottomNav />
    </div>
  );
};

export default Layout;
