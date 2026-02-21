import { Button } from "@/shared/ui/button";
import { LogOut, ChevronRight } from "lucide-react";
import { logout, getRole } from "@/core/api/auth";
import { useLocation, Link } from "react-router-dom";

const AdminHeader = () => {
  const role = getRole();
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean).slice(1); // remove 'admin'

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur">
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground transition-smooth">Dashboard</Link>
        {parts.map((p, i) => (
          <span className="flex items-center" key={i}>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="capitalize text-foreground">{p}</span>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="px-2 py-1 rounded-md bg-muted text-foreground/80">{role}</span>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Déconnexion
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
