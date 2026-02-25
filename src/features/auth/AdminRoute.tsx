import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(user: any): boolean {
  if (!user) return false;
  const appMeta = (user as any)?.app_metadata || {};
  if (appMeta.role === "ADMIN" || appMeta.role === "admin") return true;
  const userMeta = (user as any)?.user_metadata || {};
  if (userMeta.role === "ADMIN" || userMeta.role === "admin") return true;
  const u = user as any;
  const email = (u?.email || u?.user_metadata?.email || "").trim().toLowerCase();
  return email ? ADMIN_EMAILS.includes(email) : false;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return <Navigate to="/login?from=admin" replace />;
  if (!isAdmin(user)) return <Navigate to="/admin-denied" replace />;

  return <>{children}</>;
}

export { isAdmin };
