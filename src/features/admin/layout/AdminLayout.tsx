import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AdminDesktopSidebar, AdminMobileNav } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { AdminPWAInstall } from "../components/AdminPWAInstall";

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

      {/* PWA install prompt */}
      <AdminPWAInstall />
    </div>
  );
};

export default AdminLayout;
