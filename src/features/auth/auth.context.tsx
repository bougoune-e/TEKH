import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

interface AuthValue {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  refreshUser: async () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    setUser(updatedUser);
  };

  useEffect(() => {
    if (!supabase?.auth?.getSession) {
      setLoading(false);
      return;
    }
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // Après OAuth redirect, les tokens arrivent dans le hash ; un 2e getSession après un court délai
    // aide sur mobile/WebView où le hash est parfois traité après le premier rendu.
    const t = isSupabaseConfigured
      ? window.setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) setUser(data.session.user);
          });
        }, 800)
      : 0;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    unsub = () => data?.subscription?.unsubscribe?.();
    return () => {
      if (t) window.clearTimeout(t);
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
