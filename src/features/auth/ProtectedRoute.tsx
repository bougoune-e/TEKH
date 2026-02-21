import { Navigate } from "react-router-dom";
import { supabase } from "@/core/api/supabaseApi";
import { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    unsub = () => listener.subscription.unsubscribe();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
