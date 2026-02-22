import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Zap, Settings, LayoutGrid } from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";

import UserAvatar from "@/shared/components/UserAvatar";
import ProfileIcon from "@/shared/components/ProfileIcon";
import { usePWA } from "@/shared/hooks/usePWA";

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPWA = usePWA();

  const nav = [
    { to: "/", label: "Accueil", Icon: Home },
    { to: "/deals", label: "Explorer", Icon: Compass },
    {
      to: "/simulateur",
      label: isPWA ? "Estimation" : "Upgrade",
      Icon: isPWA ? Zap : LayoutGrid
    },
  ];

  const profileActive = pathname === "/profile" || pathname === "/login";
  const profilePath = user ? "/profile" : "/login";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-[62px] bg-background/90 backdrop-blur-xl border-t border-border/5 px-2 pb-1">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {nav.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full active:scale-90 ${active
                ? "text-primary"
                : "text-foreground/60"
                }`}
            >
              <Icon
                className={`h-[22px] w-[22px] transition-transform duration-300 ${active ? "scale-110" : ""}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-medium tracking-tight ${active ? "opacity-100" : "opacity-80"
                  }`}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* 👤 Profil User */}
        <button
          onClick={() => navigate(profilePath)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full active:scale-90 ${profileActive
            ? "text-primary"
            : "text-foreground/60"
            }`}
        >
          <div className={`h-[22px] w-[22px] flex items-center justify-center transition-transform duration-300 ${profileActive ? "scale-110" : ""}`}>
            {user ? (
              <ProfileIcon size="22px" className="text-current" />
            ) : (
              <UserAvatar user={user} size="sm" className="h-[22px] w-[22px] rounded-full" />
            )}
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight ${profileActive ? "opacity-100" : "opacity-80"
              }`}
          >
            Compte
          </span>
        </button>
      </div>
    </nav>
  );
}
