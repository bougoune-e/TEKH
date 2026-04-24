import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";

type Props = { children: React.ReactNode };

/**
 * Uses the shared AuthContext (same source as AdminRoute) to avoid
 * race conditions from duplicate Supabase session fetches.
 */
const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();
  const currentPath = window.location.pathname;

  if (loading) return null;
  if (!user) {
    return <Navigate to={`/login?redirect_to=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
