import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseApi";
import ThemeToggle from "./ThemeToggle";
import logo from "@/assets/logos/robott.jpeg";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Icône user.svg en inline SVG — visible en mode clair ET sombre
const UserSVG = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
        <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
    </svg>
);

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const handleSignOut = () => supabase.auth.signOut();

    return (
        <nav className="hidden md:flex sticky top-0 z-50 bg-white dark:bg-black backdrop-blur-3xl h-20 items-center px-8 gap-8 border-b border-slate-200 dark:border-white/10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
                <div className="h-11 w-11 rounded-xl overflow-hidden border-2 border-black dark:border-white bg-white group-hover:scale-110 transition-transform">
                    <img src={logo} alt="TΞKΗ+" className="h-full w-full object-cover" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-black dark:text-white group-hover:text-primary transition-colors">
                    TΞKΗ<span className="text-primary italic">+</span>
                </span>
            </Link>

            {/* Global Search */}
            <div className="flex-1 max-w-6xl">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black dark:text-white group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        placeholder="Rechercher des pépites, des modèles, des marques..."
                        className="w-full h-12 pl-12 pr-6 rounded-full bg-slate-100 dark:bg-white/10 border-0 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-black shadow-inner text-black dark:text-white"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">

                {/* Upgrade TEKH+ CTA */}
                <Link
                    to="/simulateur"
                    className={`px-5 py-2 rounded-full font-black text-xs transition-all whitespace-nowrap border-2 ${location.pathname === '/simulateur'
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                            : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
                        }`}
                >
                    Upgrade TEKH+
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* 🔔 Notification Bell — à la place de l'ancien profil */}
                <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                    <Bell className="h-6 w-6 text-black dark:text-white" strokeWidth={2} />
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-600 rounded-full border-2 border-white dark:border-black" />
                </button>

                {/* 👤 Profil User — icône user.svg inline, bien visible */}
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center h-10 w-10 border-2 border-black dark:border-white rounded-full bg-white dark:bg-black hover:scale-110 active:scale-95 transition-all shadow-lg">
                                <UserSVG className="h-6 w-6 text-black dark:text-white" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 mt-2 rounded-[24px] shadow-2xl border-2 border-black dark:border-white p-2 overflow-hidden bg-white dark:bg-zinc-900">
                            <DropdownMenuLabel className="p-6 text-center">
                                <div className="h-16 w-16 mx-auto mb-4 rounded-2xl border-2 border-black dark:border-white shadow-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <UserSVG className="h-9 w-9 text-black dark:text-white" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Compte TΞKΗ+</p>
                                <p className="text-base font-black text-black dark:text-white truncate">{(user as any)?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 h-[2px] mx-4" />
                            <DropdownMenuItem className="p-3 focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer rounded-xl group transition-all text-sm mx-2">
                                <Link to="/profile" className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 rounded-xl bg-black dark:bg-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                                        <UserSVG className="h-5 w-5 text-white dark:text-black" />
                                    </div>
                                    <span className="font-black text-black dark:text-white">Mon Espace</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="p-3 focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer rounded-xl group transition-all text-sm mx-2">
                                <Link to="/settings" className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 rounded-xl bg-black dark:bg-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                                        <Settings className="h-5 w-5 text-white dark:text-black" strokeWidth={2} />
                                    </div>
                                    <span className="font-black text-black dark:text-white">Paramètres</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 h-[2px] mx-4" />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="p-3 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer rounded-xl group text-rose-600 transition-all text-sm mx-2"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/20 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                                        <LogOut className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <span className="font-black">Quitter la session</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-white font-black text-xs hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
                        Se connecter
                    </Link>
                )}

            </div>
        </nav>
    );
};

export default Navbar;
