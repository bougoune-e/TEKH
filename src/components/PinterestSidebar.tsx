import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Home, Compass, LayoutGrid, Plus, Bell, MessageCircle, User, Settings
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { useAuth } from '@/context/AuthContext';
import { useDeals } from '@/context/DealsContext';
import { useMemo } from 'react';
import UserAvatar from '@/components/UserAvatar';
import { cn } from '@/lib/utils';
import logo from '@/assets/logos/robott.jpeg';

const PinterestSidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { deals } = useDeals();

    const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name || (user as any)?.email || '';
    const displayEmail = (user as any)?.email || '';

    const myCount = useMemo(() => {
        const uid = (user as any)?.id;
        if (!uid) return 0;
        return deals.filter((d) => d.ownerId === uid).length;
    }, [deals, user]);

    const topItems = [
        { icon: Home, label: 'Accueil', path: '/' },
        { icon: Compass, label: 'Explorer', path: '/deals' },
        { icon: LayoutGrid, label: 'Dealboxes', path: '/dealboxes' },
        { icon: Plus, label: 'Publier', path: '/simulateur' },
    ];

    const midItems = [
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: MessageCircle, label: 'Messages', path: '/messages' },
    ];

    const iconBase = "h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative";
    const activeClass = "bg-primary/5 text-primary shadow-[0_4px_12px_rgba(230,0,35,0.1)] scale-105";
    const inactiveClass = "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5";

    return (
        <aside className="hidden md:flex sticky top-0 left-0 h-screen w-20 bg-white dark:bg-black border-r border-slate-100 dark:border-white/5 flex-col items-center py-6 gap-6 z-[60] shrink-0">
            {/* Logo */}
            <RouterLink to="/" className="mb-4">
                <div className="h-9 w-9 bg-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg overflow-hidden">
                    <img src={logo} alt="Tekh" className="h-6 w-6 object-contain" />
                </div>
            </RouterLink>

            <TooltipProvider delayDuration={100}>
                <nav className="flex flex-col gap-3">
                    {topItems.map((item) => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                    <RouterLink to={item.path} className={cn(iconBase, active ? activeClass : inactiveClass)}>
                                        <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", active && "animate-in fade-in zoom-in duration-300")} />
                                    </RouterLink>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-bold border-0 shadow-xl">{item.label}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                <div className="flex flex-col gap-3 mt-4 border-t border-slate-50 dark:border-white/5 pt-4">
                    {midItems.map((item) => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                    <button className={cn(iconBase, inactiveClass)}>
                                        <Icon className="h-6 w-6 group-hover:scale-110" />
                                        {item.label === 'Notifications' && (
                                            <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-black" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-bold border-0 shadow-xl">{item.label}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center gap-3 mt-auto">
                    {user ? (
                        <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                                <RouterLink to="/profile" className={cn(iconBase, inactiveClass)}>
                                    <UserAvatar user={user} size="sm" className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                                </RouterLink>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" className="w-64 p-4 border-0 shadow-2xl rounded-[24px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <UserAvatar user={user} size="md" />
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">{displayName}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{displayEmail}</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <RouterLink to="/profile" className="block text-xs font-bold p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">Mon profil</RouterLink>
                                    <RouterLink to="/mes-publications" className="block text-xs font-bold p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">Mes annonces ({myCount})</RouterLink>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <RouterLink to="/login" className={cn(iconBase, inactiveClass)}>
                                    <User className="h-6 w-6" />
                                </RouterLink>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-bold">Connexion</TooltipContent>
                        </Tooltip>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <RouterLink to="/settings" className={cn(iconBase, inactiveClass, location.pathname === '/settings' && activeClass)}>
                                <Settings className="h-6 w-6 transition-transform group-hover:rotate-45" />
                            </RouterLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-bold border-0 shadow-xl">Paramètres</TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </aside>
    );
};

export default PinterestSidebar;
