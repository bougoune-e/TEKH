import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";

function isAdmin(user: any): boolean {
  const role = user?.app_metadata?.role;
  return typeof role === "string" && role.toUpperCase() === "ADMIN";
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
