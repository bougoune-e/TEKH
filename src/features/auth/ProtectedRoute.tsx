import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";

type Props = { children: React.ReactNode };

/**
 * Uses the shared AuthContext (same source as AdminRoute) to avoid
 * race conditions from duplicate Supabase session fetches.
 */
const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return null; // AuthProvider shows nothing while loading
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
