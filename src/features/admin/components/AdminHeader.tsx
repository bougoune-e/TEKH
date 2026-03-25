import { LogOut, ChevronRight } from "lucide-react";
import { logout, getRole } from "@/core/api/auth";
import { useLocation, Link } from "react-router-dom";
import logo from "@/assets/logos/robott.jpeg";

const AdminHeader = () => {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean).slice(1); // remove 'admin'

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

      {/* Role badge + logout (desktop only) */}
      <div className="hidden md:flex items-center gap-3 text-sm shrink-0">
        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-xs uppercase tracking-widest">
          {getRole()}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-sm font-semibold"
        >
          <LogOut className="h-3.5 w-3.5" /> Déconnexion
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
