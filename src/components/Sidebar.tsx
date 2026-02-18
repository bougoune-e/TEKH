import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, LayoutGrid, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logos/robott.jpeg';

// Icône user.svg inline — visible en mode clair ET sombre
const UserSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
    <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Compass, label: 'Explorer', path: '/deals' },
    { icon: LayoutGrid, label: 'Upgrade', path: '/simulateur' },
  ];

  const handleProfileClick = () => {
    navigate(user ? '/profile' : '/login');
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 bg-white dark:bg-slate-900 flex-col items-center py-8 z-50 border-r border-border/10">
      {/* Logo */}
      <Link to="/" className="mb-12">
        <img src={logo} alt="TΞKΗ+" className="h-10 w-10 rounded-xl" />
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-10">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={`relative transition-all duration-300 hover:scale-110 ${active ? 'text-primary dark:text-primary scale-110' : 'text-black dark:text-white hover:text-primary dark:hover:text-primary'}`}
                  aria-label={item.label}
                >
                  <Icon
                    className="h-8 w-8 nav-icon"
                    strokeWidth={active ? 3 : 2}
                    fill={active ? 'currentColor' : 'none'}
                  />
                  {active && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
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
              className={`relative transition-all duration-300 hover:scale-110 ${location.pathname === '/settings' ? 'text-primary' : 'text-black dark:text-white hover:text-primary'}`}
              aria-label="Paramètres"
            >
              <Settings
                className="h-8 w-8 nav-icon"
                strokeWidth={location.pathname === '/settings' ? 3 : 2}
                fill={location.pathname === '/settings' ? 'currentColor' : 'none'}
              />
              {location.pathname === '/settings' && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Paramètres</TooltipContent>
        </Tooltip>

        {/* 👤 Profil User — même style que les autres icônes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleProfileClick}
              className={`relative transition-all duration-300 hover:scale-110 ${location.pathname === '/profile'
                ? 'text-primary scale-110'
                : 'text-black dark:text-white hover:text-primary dark:hover:text-primary'
                }`}
              aria-label="Profil"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-8 w-8 nav-icon"
                fill={location.pathname === '/profile' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={location.pathname === '/profile' ? 0 : 1.5}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
                <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
              </svg>
              {location.pathname === '/profile' && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(0,255,65,0.6)]" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Mon Profil</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;
