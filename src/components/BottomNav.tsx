import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LayoutGrid, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import UserAvatar from "./UserAvatar";
import ProfileIcon from "./ProfileIcon";

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const nav = [
    { to: "/", label: "Accueil", Icon: Home },
    { to: "/deals", label: "Explorer", Icon: Compass },
    { to: "/simulateur", label: "Upgrade", Icon: LayoutGrid },
    { to: "/settings", label: "Paramètres", Icon: Settings },
  ];

  const profileActive = pathname === "/profile" || pathname === "/settings";
  const profilePath = user ? "/profile" : "/login";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-20 bg-background/80 backdrop-blur-2xl border-t border-border/10 pb-safe">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {nav.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${active
                ? "text-[#064e3b] dark:text-primary -translate-y-1"
                : "text-black dark:text-white"
                }`}
            >
              <Icon
                className={`h-6 w-6 transition-all duration-300 ${active ? "scale-110" : ""}`}
                strokeWidth={active ? 3 : 2}
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.2 : 1}
              />
              <span
                className={`text-[10px] font-black tracking-tighter uppercase ${active ? "opacity-100" : "opacity-100"
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
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${profileActive
            ? "text-[#064e3b] dark:text-primary -translate-y-1"
            : "text-black dark:text-white"
            }`}
        >
          <div className={`transition-all duration-300 ${profileActive ? "scale-110" : ""}`}>
            {user ? (
              <div className={`h-7 w-7 flex items-center justify-center transition-all ${profileActive ? 'ring-2 ring-[#064e3b] dark:ring-primary shadow-lg shadow-[#064e3b]/20 rounded-full' : ''}`}>
                <ProfileIcon size="24px" className="text-current" />
              </div>
            ) : (
              <UserAvatar user={user} size="sm" className={`h-7 w-7 rounded-full transition-all ${profileActive ? 'ring-2 ring-[#064e3b] dark:ring-primary shadow-lg shadow-[#064e3b]/20' : 'opacity-100'}`} />
            )}
          </div>
          <span
            className={`text-[10px] font-black tracking-tighter uppercase ${profileActive ? "opacity-100" : "opacity-100"
              }`}
          >
            Profil
          </span>
        </button>
      </div>
    </nav>
  );
}
