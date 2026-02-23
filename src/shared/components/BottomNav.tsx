import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Search, Calculator, User, Zap, LayoutGrid } from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import { usePWA } from "@/shared/hooks/usePWA";

import UserAvatar from "@/shared/components/UserAvatar";
import ProfileIcon from "@/shared/components/ProfileIcon";

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPWA = usePWA();

  const navItems = isPWA ? [
    { to: "/", label: "Accueil", Icon: Home },
    { to: "/deals", label: "Explorer", Icon: Compass },
    { to: "/simulateur", label: "Estimer", Icon: Calculator, isFocal: true },
  ] : [
    { to: "/", label: "Accueil", Icon: Home },
    { to: "/deals", label: "Explorer", Icon: Compass },
    {
      to: "/simulateur",
      label: "Upgrade",
      Icon: LayoutGrid
    },
  ];

  const profileActive = pathname === "/profile" || pathname === "/login";
  const profilePath = user ? "/profile" : "/login";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${isPWA
      ? "h-[74px] bg-background/95 backdrop-blur-2xl border-t border-border/10 px-4 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
      : "h-[74px] bg-background/90 backdrop-blur-xl border-t border-border/5 px-2 pb-safe"
      }`}>
      <div className={`flex items-center h-full max-w-md mx-auto justify-around`}>
        {navItems.map(({ to, label, Icon, isFocal }) => {
          const active = pathname === to;

          if (isPWA && isFocal) {
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="relative -top-6 flex flex-col items-center justify-center group"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_12px_24px_rgba(0,255,65,0.3)] group-active:scale-90 bg-primary`}>
                  <Icon className="w-8 h-8 text-black opacity-100" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary mt-2 drop-shadow-sm">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full ${isPWA
                ? `active:scale-95 ${active ? "text-primary" : "text-black dark:text-foreground/40"}`
                : `flex-1 active:scale-90 ${active ? "text-primary" : "text-black dark:text-foreground/60"}`
                }`}
            >
              <Icon
                className={`transition-transform duration-300 ${isPWA ? "h-6 w-6" : "h-[22px] w-[22px]"
                  } ${active ? "scale-110" : ""}`}
                strokeWidth={isPWA ? (active ? 3 : 2) : (active ? 2.5 : 2)}
              />
              <span className={`font-bold tracking-tight ${isPWA ? "text-[10px]" : "text-[11px] font-medium"
                } ${active ? "opacity-100" : "opacity-60"}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* 👤 Account */}
        <button
          onClick={() => navigate(profilePath)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full ${isPWA
            ? `active:scale-95 ${profileActive ? "text-primary" : "text-black dark:text-foreground/40"}`
            : `flex-1 active:scale-90 ${profileActive ? "text-primary" : "text-black dark:text-foreground/60"}`
            }`}
        >
          {isPWA ? (
            <User
              className={`h-6 w-6 transition-transform duration-300 ${profileActive ? "scale-110" : ""}`}
              strokeWidth={profileActive ? 3 : 2}
            />
          ) : (
            <div className={`h-[22px] w-[22px] flex items-center justify-center transition-transform duration-300 ${profileActive ? "scale-110" : ""}`}>
              {user ? (
                <ProfileIcon size="22px" className="text-current" />
              ) : (
                <UserAvatar user={user} size="sm" className="h-[22px] w-[22px] rounded-full" />
              )}
            </div>
          )}
          <span className={`font-bold tracking-tight ${isPWA ? "text-[10px]" : "text-[11px] font-medium"
            } ${profileActive ? "opacity-100" : "opacity-60"}`}>
            Compte
          </span>
        </button>
      </div>
    </nav>
  );
}
