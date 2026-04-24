import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(user: any): boolean {
  if (!user) return false;

  const email = (user.email || user.user_metadata?.email || "").trim().toLowerCase();
  const appMeta = user.app_metadata || {};
  const userMeta = user.user_metadata || {};

  const hasAdminRole =
    appMeta.role?.toUpperCase() === "ADMIN" ||
    userMeta.role?.toUpperCase() === "ADMIN";

  const isEmailListed = email ? ADMIN_EMAILS.includes(email) : false;

  if (isEmailListed || hasAdminRole) {
    if (import.meta.env.DEV) {
      console.log("[AdminAuth] Access granted for:", email, { hasAdminRole, isEmailListed });
    }
    return true;
  }

  console.warn("[AdminAuth] Access denied for:", email || "no-email", {
    expectedEmails: ADMIN_EMAILS,
    userRoles: { app: appMeta.role, user: userMeta.role }
  });
  return false;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const currentPath = window.location.pathname;

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  if (!user) {
    return <Navigate to={`/login?redirect_to=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (!isAdmin(user)) {
    return <Navigate to={`/admin-denied?email=${encodeURIComponent(user.email || "")}`} replace />;
  }

  return <>{children}</>;
}

export { isAdmin };
