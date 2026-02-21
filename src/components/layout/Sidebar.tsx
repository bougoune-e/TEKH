import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, LayoutGrid, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logos/robott.jpeg';
import UserAvatar from "@/components/common/UserAvatar";
import { useTranslation } from 'react-i18next';
import ProfileIcon from "@/components/common/ProfileIcon";

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: Compass, label: t('nav.deals'), path: '/deals' },
    { icon: LayoutGrid, label: t('nav.upgrade'), path: '/simulateur' },
  ];

  const handleProfileClick = () => {
    navigate(user ? '/profile' : '/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 bg-white dark:bg-slate-900 flex-col items-center py-8 z-50 border-r border-border/10 transition-colors">
      {/* Logo */}
      <Link to="/" className="mb-12">
        <img src={logo} alt="TΞKΗ+" className="h-10 w-10 rounded-xl" />
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-10">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={`relative transition-all duration-300 hover:scale-110 ${active
                    ? 'text-[#064e3b] dark:text-primary scale-110'
                    : 'text-black dark:text-slate-500 hover:text-[#064e3b] dark:hover:text-primary'}`}
                  aria-label={item.label}
                >
                  <Icon
                    className="h-8 w-8 nav-icon"
                    strokeWidth={active ? 3 : 2}
                    fill={active ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.2 : 1}
                  />
                  {active && (
                    <span className={`absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full transition-all ${active ? 'bg-[#064e3b] dark:bg-primary shadow-[0_0_15px_rgba(6,78,59,0.5)] dark:shadow-[0_0_15px_rgba(0,255,65,0.5)]' : ''
                      }`} />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pb-8 flex flex-col items-center gap-6">
        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/settings"
              className={`relative transition-all duration-300 hover:scale-110 ${isActive('/settings')
                ? 'text-[#064e3b] dark:text-primary scale-110'
                : 'text-black dark:text-slate-500 hover:text-[#064e3b] dark:hover:text-primary'}`}
              aria-label={t('nav.settings')}
            >
              <Settings
                className="h-8 w-8 nav-icon"
                strokeWidth={isActive('/settings') ? 3 : 2}
                fill={isActive('/settings') ? 'currentColor' : 'none'}
                fillOpacity={isActive('/settings') ? 0.2 : 1}
              />
              {isActive('/settings') && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#064e3b] dark:bg-primary rounded-r-full shadow-[0_0_10px_rgba(6,78,59,0.5)] dark:shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{t('nav.settings')}</TooltipContent>
        </Tooltip>

        {/* 👤 Profil User */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleProfileClick}
              className={`relative transition-all duration-300 hover:scale-110 ${isActive('/profile')
                ? 'scale-110'
                : 'text-black dark:text-slate-500 opacity-100 hover:opacity-100'
                }`}
              aria-label={t('nav.profile')}
            >
              <div className={`h-8 w-8 flex items-center justify-center transition-all ${isActive('/profile') ? 'ring-2 ring-[#064e3b] dark:ring-primary shadow-lg shadow-[#064e3b]/20 rounded-full' : ''}`}>
                <ProfileIcon size="32px" className="text-current" />
              </div>
              {isActive('/profile') && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#064e3b] dark:bg-primary rounded-r-full shadow-[0_0_15px_rgba(6,78,59,0.5)] dark:shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('nav.profile')}</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;
