import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, BookOpen, Calculator, Sun, Moon, User, ClipboardList } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { useTheme } from '@/theme/ThemeProvider';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeals } from '@/context/DealsContext';
import UserAvatar from '@/components/UserAvatar';

const iconBtn = 'h-12 w-12 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover hover:scale-105 transition-spring inline-flex items-center justify-center transform-gpu will-change-transform';

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const { user } = useAuth();

  const displayName = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name || (user as any)?.email || '';
  const displayEmail = (user as any)?.email || '';
  const { deals } = useDeals();
  const myCount = useMemo(() => {
    const uid = (user as any)?.id;
    if (!uid) return 0;
    return deals.filter((d) => d.ownerId === uid).length;
  }, [deals, user]);

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Search, label: 'Explorer', path: '/deals' },
    { icon: Plus, label: 'Publier', path: '/post' },
    { icon: ClipboardList, label: 'Mes publications', path: '/mes-publications' },
    { icon: BookOpen, label: 'Charte', path: '/charte' },
    { icon: Calculator, label: 'Simulateur', path: '/simulateur' },
    { icon: ClipboardList, label: 'Diagnostic', path: '/diagnose' },
  ];
  const colorMap: Record<string, string> = {
    'Accueil': 'text-sky-500',
    'Explorer': 'text-fuchsia-500',
    'Publier': 'text-emerald-500',
    'Mes publications': 'text-amber-500',
    'Charte': 'text-rose-500',
    'Simulateur': 'text-violet-500',
    'Diagnostic': 'text-blue-500',
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-background border-r border-border flex-col items-center py-4 gap-3">
      {/* Logo */}
      <Link to="/" className="mb-2">
        <img src="/assets/logos/robot.png" alt="Tekh" className="h-10 w-10 rounded-full ring-1 ring-border object-cover" />
      </Link>

      {/* Nav */}
      <nav className="mt-2 flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          const color = colorMap[item.label] || 'text-primary';
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link to={item.path} className={`${iconBtn} ${active ? 'bg-primary text-primary-foreground border-2 border-primary' : ''}`} aria-label={item.label}>
                  <Icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : color}`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={iconBtn}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</TooltipContent>
        </Tooltip>

        {user ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link to="/profile" className={iconBtn} aria-label="Profil">
                <UserAvatar user={user} size="sm" />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div className="text-sm">
                  <div className="font-semibold leading-none">{displayName}</div>
                  {displayEmail && <div className="text-muted-foreground text-xs mt-1">{displayEmail}</div>}
                  <div className="text-xs text-muted-foreground mt-1">Publications: {myCount}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-1">
                <Link to="/profile" className="text-sm underline">Voir le profil</Link>
                <Link to="/mes-publications" className="text-sm underline">Mes publications</Link>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/login" className={iconBtn} aria-label="Se connecter">
                <User className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Se connecter</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
