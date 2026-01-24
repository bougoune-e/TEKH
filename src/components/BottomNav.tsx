import { Link, useLocation } from "react-router-dom";
import { Home, Repeat, Calculator, User, Search } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = [
    { to: "/", label: "Accueil", Icon: Home },
    { to: "/simulateur", label: "Simulateur", Icon: Calculator },
    { to: "/diagnose", label: "Diagnostic", Icon: Repeat },
    { to: "/deals", label: "Swaps", Icon: Search },
  ];
  const last = user
    ? { to: "/profile", label: "Profil", Icon: User as any }
    : { to: "/login", label: "Se connecter", Icon: User as any };
  const nav = [...base, last];
  const colorMap: Record<string, string> = {
    'Accueil': 'text-sky-500',
    'Swaps': 'text-emerald-500',
    'Simulateur': 'text-violet-500',
    'Profil': 'text-amber-500',
    'Se connecter': 'text-rose-500',
    'Diagnostic': 'text-blue-500',
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
      <div className="mx-auto max-w-3xl px-3 py-2 h-16 rounded-2xl border border-white/30 bg-white/70 dark:bg-black/40 backdrop-blur-md shadow-xl flex items-center justify-around">
        {nav.map(({ to, label, Icon }) => {
          const active = pathname === to;
          const color = colorMap[label] || 'text-primary';
          return (
            <Link key={to} to={to} className="flex flex-col items-center justify-center gap-1">
              <div className="relative flex items-center justify-center">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${active ? 'bg-white shadow-md dark:bg-white/10' : 'bg-transparent'}`}>
                  {label === 'Profil' && user ? (
                    <UserAvatar user={user} size="sm" />
                  ) : (
                    <Icon className={`h-6 w-6 ${active ? 'text-primary' : color}`} />
                  )}
                </div>
                {active && <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <span className={`text-[10px] leading-none ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
