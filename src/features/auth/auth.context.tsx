import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

interface AuthValue {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  refreshUser: async () => { },
  signOut: async () => { },
});

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string || "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Détecte si ce chargement de page est le retour d'un callback OAuth
// (hash contient access_token) ou PKCE (query contient code).
const _isOAuthReturn =
  typeof window !== "undefined" &&
  (window.location.hash.includes("access_token") ||
    new URLSearchParams(window.location.search).has("code"));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch {
      // Supabase may not be configured or getUser may not be available
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Redirection automatique admin après callback OAuth Google
      if (
        event === "SIGNED_IN" &&
        session?.user &&
        _isOAuthReturn &&
        !window.location.pathname.startsWith("/admin")
      ) {
        const email = (session.user.email || session.user.user_metadata?.email || "").toLowerCase();
        if (isAdminEmail(email)) {
          window.location.replace("/admin");
        }
      }
    });
    unsub = () => data?.subscription?.unsubscribe?.();
    return () => {
      if (t) window.clearTimeout(t);
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
