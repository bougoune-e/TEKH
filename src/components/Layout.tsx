import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
 

const Layout = () => {
  const location = useLocation();
  const showFooter = location.pathname === "/";
 
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-[90px] pb-16 md:pb-0 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 dark:bg-background/50 backdrop-blur-lg supports-[backdrop-filter]:bg-background/40 transition-colors">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-md ring-2 ring-border overflow-hidden">
                <img src="/assets/logos/robot.png" alt="TΞKΗ+" className="h-full w-full object-cover" />
              </span>
            </a>
            <div className="flex-1">
              <SearchBar />
            </div>
            {/* Theme toggle visible on mobile */}
            <ThemeToggle className="md:hidden z-50" />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        {showFooter && <Footer />}
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
