import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminDesktopSidebar, AdminMobileNav } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { AdminPWAInstall } from "../components/AdminPWAInstall";
import { Plus, X, Megaphone, Bell } from "lucide-react";
import { cn } from "@/core/api/utils";

/* ── FAB Speed-dial mobile ───────────────────────────────────── */
function AdminFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
      {/* Main FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
          "bg-primary text-primary-foreground active:scale-95",
          open && "rotate-45"
        )}
        aria-label="Actions rapides"
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Speed-dial actions */}
      {open && (
        <>
          <button
            onClick={() => go("/admin/notifications")}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-lg text-sm font-black transition-all active:scale-95"
          >
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </span>
            Envoyer une notification
          </button>
          <button
            onClick={() => go("/admin/annonces")}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-lg text-sm font-black transition-all active:scale-95"
          >
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </span>
            Publier une annonce
          </button>
        </>
      )}

      {/* Backdrop to close on tap outside */}
      {open && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

const AdminLayout = () => {
  // Swap manifest → admin version so "Add to Home Screen" installs the admin app
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href") ?? "/manifest.webmanifest";
    link?.setAttribute("href", "/admin-manifest.webmanifest");
    return () => {
      link?.setAttribute("href", prev);
    };
  }, []);

  return (
    <div className="min-h-dvh flex bg-background">
      {/* Desktop: fixed left sidebar */}
      <AdminDesktopSidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        {/* pb-20 on mobile so content doesn't hide behind bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile: bottom nav + drawer */}
      <AdminMobileNav />

      {/* Mobile FAB: quick post actions */}
      <AdminFAB />

      {/* PWA install prompt */}
      <AdminPWAInstall />
    </div>
  );
};

export default AdminLayout;
