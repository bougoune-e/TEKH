import { LogOut, ChevronRight, Sun, Moon } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useAuth } from "@/features/auth/auth.context";
import logo from "@/assets/logos/robott.jpeg";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const parts = location.pathname.split("/").filter(Boolean).slice(1);
  const role = user?.app_metadata?.role || "ADMIN";

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/80 backdrop-blur shrink-0">
      {/* Mobile: logo + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <img src={logo} alt="Admin" className="md:hidden w-7 h-7 rounded-lg object-cover shrink-0" />
        <nav className="flex items-center text-sm text-muted-foreground min-w-0">
          <Link to="/admin" className="hover:text-foreground transition-colors font-semibold shrink-0">
            Admin
          </Link>
          {parts.map((p, i) => (
            <span className="flex items-center min-w-0" key={i}>
              <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="capitalize text-foreground font-black truncate">{p}</span>
            </span>
          ))}
        </nav>
      </div>

      {/* Theme toggle + role badge + logout */}
      <div className="flex items-center gap-2 text-sm shrink-0">
        <button
          onClick={toggleTheme}
          aria-label="Changer le thème"
          className="p-2 rounded-xl border border-border/50 hover:bg-accent transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <span className="hidden md:inline px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-xs uppercase tracking-widest">
          {role}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-sm font-semibold"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
