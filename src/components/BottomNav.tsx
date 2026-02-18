import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LayoutGrid, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Icône user.svg inline — même style que les autres icônes nav
const UserSVG = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className="h-7 w-7 nav-icon"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? 0 : 1.5}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
    <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
  </svg>
);

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

  const profilePath = user ? "/profile" : "/login";
  const profileActive = pathname === "/profile";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-20 bg-background/60 backdrop-blur-2xl border-t border-border/10 pb-safe">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {nav.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? "text-primary -translate-y-1" : "text-black dark:text-white"}`}
            >
              <Icon
                className="h-7 w-7 nav-icon"
                strokeWidth={active ? 3 : 2}
                fill={active ? "currentColor" : "none"}
              />
              <span className={`text-[10px] font-black tracking-tight ${active ? "opacity-100" : "opacity-80"}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* 👤 Profil User — même style que les autres icônes */}
        <button
          onClick={() => navigate(profilePath)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${profileActive ? "text-primary -translate-y-1" : "text-black dark:text-white"}`}
        >
          <UserSVG active={profileActive} />
          <span className={`text-[10px] font-black tracking-tight ${profileActive ? "opacity-100" : "opacity-80"}`}>
            Profil
          </span>
        </button>
      </div>
    </nav>
  );
}
