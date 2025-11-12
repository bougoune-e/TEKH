import { NavLink } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Smartphone, RefreshCw, Boxes, Tags, BarChart3, Settings, Handshake, PhoneCall } from "lucide-react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/annonces", label: "Annonces", icon: Smartphone },
  { to: "/admin/deals", label: "Deals", icon: Handshake },
  { to: "/admin/dealbox", label: "DealBox", icon: Boxes },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/stats", label: "Stats", icon: BarChart3 },
  { to: "/admin/settings", label: "Paramètres", icon: Settings },
];

const AdminSidebar = () => {
  return (
    <SidebarProvider className="w-64 border-r bg-sidebar">
      <div className="h-screen sticky top-0 p-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-30 blur-xl rounded-xl" />
            <div className="relative bg-gradient-hero p-2 rounded-lg">
              <PhoneCall className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div className="text-lg font-semibold tracking-tight">DealBox Admin</div>
        </div>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end as boolean | undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-smooth",
                  isActive
                    ? "active bg-gradient-subtle text-primary shadow-card"
                    : "hover:bg-muted hover:shadow-card-hover"
                )
              }
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 group-[.active]:opacity-100" />
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </SidebarProvider>
  );
};

export default AdminSidebar;
