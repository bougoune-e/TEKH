import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { AdminPWAInstall } from "../components/AdminPWAInstall";

const AdminLayout = () => {
  // Swaps manifest to admin-specific one (start_url: /admin, theme: green)
  // so "Add to Home Screen" installs the admin app separately from the main app.
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
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
      <AdminPWAInstall />
    </div>
  );
};

export default AdminLayout;
