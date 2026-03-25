import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/core/api/utils";
import {
  LayoutGrid, Users, Smartphone, Boxes, Tags, BarChart3,
  Settings, Handshake, ChevronRight, X, Menu, LogOut,
} from "lucide-react";
import { getRole } from "@/core/api/auth";
import { useAuth } from "@/features/auth/auth.context";
import logo from "@/assets/logos/robott.jpeg";

const items = [
  { to: "/admin",             label: "Dashboard",    icon: LayoutGrid,  end: true },
  { to: "/admin/annonces",    label: "Annonces",     icon: Smartphone },
  { to: "/admin/deals",       label: "Deals",        icon: Handshake },
  { to: "/admin/users",       label: "Utilisateurs", icon: Users },
  { to: "/admin/dealbox",     label: "DealBox",      icon: Boxes },
  { to: "/admin/categories",  label: "Catégories",   icon: Tags },
  { to: "/admin/stats",       label: "Stats",        icon: BarChart3 },
  { to: "/admin/settings",    label: "Paramètres",   icon: Settings },
];

// 5 primary items for the mobile bottom bar; rest are in the drawer
const PRIMARY = items.slice(0, 4);

/* ── Desktop sidebar ─────────────────────────────── */
export const AdminDesktopSidebar = () => {
  const { signOut } = useAuth();
  const handleLogout = async () => {
    localStorage.removeItem("tekh:nav-snapshot");
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border/50 bg-card flex-col h-dvh sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <img src={logo} alt="TΞKΗ+ Admin" className="w-8 h-8 rounded-lg object-cover" />
        <div>
          <div className="text-sm font-black tracking-tight text-foreground">TΞKΗ+ Admin</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getRole()}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end as boolean | undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span>{label}</span>
                {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

/* ── Mobile bottom bar + slide-over drawer ───────── */
export const AdminMobileNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const handleLogout = async () => {
    setDrawerOpen(false);
    localStorage.removeItem("tekh:nav-snapshot");
    await signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border/50 flex items-center justify-around px-2 pb-safe h-16">
        {PRIMARY.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end as boolean | undefined}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all flex-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
          </NavLink>
        ))}
        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground flex-1"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Plus</span>
        </button>
      </nav>

      {/* Slide-over drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Sheet */}
          <div className="relative w-full bg-card rounded-t-3xl border-t border-border/50 p-4 pb-safe">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Admin" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-sm font-black tracking-tight">TΞKΗ+ Admin</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end as boolean | undefined}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wide leading-tight">{label}</span>
                </NavLink>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 text-red-500 font-black text-sm"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Legacy export for backward compat
const AdminSidebar = AdminDesktopSidebar;
export default AdminSidebar;
