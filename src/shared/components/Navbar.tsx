import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Settings, LogOut, Bot } from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import { supabase } from "@/core/api/supabaseApi";
import ThemeToggle from "@/shared/components/ThemeToggle";
import ProfileIcon from "@/shared/components/ProfileIcon";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logos/robott.jpeg";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";

// Icône user.svg en inline SVG — visible en mode clair ET sombre

const Navbar = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const location = useLocation();
    const handleSignOut = () => supabase.auth.signOut();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="hidden md:flex sticky top-0 z-50 bg-white dark:bg-black backdrop-blur-3xl h-20 items-center px-8 gap-8 border-b border-slate-200 dark:border-white/10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
                <div className="h-11 w-11 rounded-xl overflow-hidden border-2 border-black dark:border-white bg-white group-hover:scale-110 transition-transform">
                    <img src={logo} alt="TΞKΗ+" className="h-full w-full object-cover" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-black dark:text-white group-hover:text-[#064e3b] dark:group-hover:text-primary transition-colors">
                    TΞKΗ<span className="text-[#064e3b] dark:text-primary italic">+</span>
                </span>
            </Link>

            {/* Global Search */}
            <div className="flex-1 max-w-6xl">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black dark:text-white group-focus-within:text-[#064e3b] dark:group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        placeholder={t('search_placeholder', 'Rechercher des pépites, des modèles, des marques...')}
                        className="w-full h-12 pl-12 pr-6 rounded-full bg-slate-100 dark:bg-white/10 border-0 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-black shadow-inner text-black dark:text-white"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">

                {/* Upgrade TEKH+ CTA */}
                <Link
                    to="/simulateur"
                    className={`px-5 py-2 rounded-full font-black text-xs transition-all whitespace-nowrap border-2 ${isActive('/simulateur')
                        ? 'bg-[#064e3b] dark:bg-primary text-white border-[#064e3b] dark:border-primary shadow-lg shadow-[#064e3b]/30 dark:shadow-primary/30'
                        : 'bg-transparent text-[#064e3b] dark:text-primary border-[#064e3b] dark:border-primary hover:bg-[#064e3b] dark:hover:bg-primary hover:text-white'
                        }`}
                >
                    Upgrade TEKH+
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* 🤖 TekhBot Toggle */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('toggle-tekhbot'))}
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-white/10 rounded-full transition-all group/bot"
                >
                    <Bot className="h-6 w-6 text-black dark:text-white group-hover/bot:text-primary" />
                </button>

                {/* 🔔 Notification Bell */}
                <button className="relative p-2 hover:bg-zinc-50 dark:hover:bg-white/10 rounded-full transition-all group/bell">
                    <Bell className="h-6 w-6 text-black dark:text-white group-hover/bell:text-[#064e3b] dark:group-hover/bell:text-primary" strokeWidth={2} />
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-600 rounded-full border-2 border-white dark:border-black" />
                </button>

                {/* Se connecter button if not logged in */}
                {!user ? (
                    <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-white font-black text-xs hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
                        {t('auth.signIn')}
                    </Link>
                ) : (
                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ProfileIcon size="36px" className="text-black dark:text-white" />
                    </Link>
                )}

            </div>
        </nav>
    );
};

export default Navbar;
