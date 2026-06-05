import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { getStoredReferralCode, registerReferee } from "@/core/api/referral";

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

    // Initial session restore
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        setLoading(false);
      } else {
        // Fallback: PKCE flow exchanges code asynchronously on WebView
        // Try getUser() which forces a token refresh if a session cookie exists
        try {
          const { data: { user: u } } = await supabase.auth.getUser();
          setUser(u ?? null);
        } catch {
          setUser(null);
        }
        setLoading(false);
      }
    });

    // After OAuth/PKCE redirect, tokens may arrive after first render on mobile
    // Wait longer than before to allow code exchange to complete in WebView
    const t = isSupabaseConfigured
      ? window.setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) setUser(data.session.user);
        });
      }, 1500)
      : 0;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Redirect to /reset-password when user clicks password reset email link
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
        return;
      }

      // Handle referral registration
      if (session?.user) {
        const code = getStoredReferralCode();
        if (code) {
          registerReferee(session.user.id, code).catch(console.error);
        }
      }

      // Redirection spécifique (ex: PASSWORD_RECOVERY) gérée ici.
      // La redirection Admin est désormais gérée par Login.tsx et AuthCallback.tsx 
      // pour éviter les conflits entre APK Standard et APK Admin.
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
