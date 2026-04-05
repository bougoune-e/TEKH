/**
 * AuthSheet — Popup/Bottom-sheet d'invitation à la connexion.
 * Apparaît quand une action protégée est déclenchée sans être connecté.
 * Mobile : slide-up depuis le bas. Desktop : modal centré.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn, UserPlus, Smartphone, ShieldCheck, Zap } from "lucide-react";
import logo from "@/assets/logos/robott.jpeg";

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthSheetState {
  open: boolean;
  reason?: string;
}

interface AuthSheetContextValue {
  showAuth: (reason?: string) => void;
  hideAuth: () => void;
}

const AuthSheetContext = createContext<AuthSheetContextValue>({
  showAuth: () => {},
  hideAuth: () => {},
});

export function useAuthSheet() {
  return useContext(AuthSheetContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthSheetState>({ open: false });

  const showAuth = useCallback((reason?: string) => {
    setState({ open: true, reason });
  }, []);

  const hideAuth = useCallback(() => {
    setState({ open: false });
  }, []);

  return (
    <AuthSheetContext.Provider value={{ showAuth, hideAuth }}>
      {children}
      {state.open && (
        <AuthSheetModal reason={state.reason} onClose={hideAuth} />
      )}
    </AuthSheetContext.Provider>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const PERKS = [
  { icon: Smartphone, text: "Simulez un échange en quelques clics" },
  { icon: ShieldCheck, text: "Publiez et gérez vos annonces" },
  { icon: Zap, text: "Accédez à votre historique & TekhPoints" },
];

function AuthSheetModal({ reason, onClose }: { reason?: string; onClose: () => void }) {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet — slide up on mobile, centered on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connexion requise"
        className="
          fixed z-[90] bg-white dark:bg-zinc-950 shadow-2xl
          /* mobile: bottom sheet */
          bottom-0 left-0 right-0 rounded-t-[28px]
          /* desktop: centered modal */
          md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:rounded-2xl md:max-w-md md:w-full
          animate-in slide-in-from-bottom-4 duration-300 ease-out
          md:animate-in md:fade-in md:zoom-in-95
        "
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-4 pb-8">
          {/* Logo + titre */}
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="TΞKΗ+" className="w-10 h-10 rounded-xl border border-slate-100 dark:border-zinc-800 object-cover" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">TΞKΗ+</p>
              <h2 className="text-lg font-black leading-tight text-slate-900 dark:text-white">
                Connectez-vous pour continuer
              </h2>
            </div>
          </div>

          {/* Raison contextuelle */}
          {reason && (
            <div className="mb-5 px-3 py-2.5 rounded-xl bg-primary/8 dark:bg-primary/10 border border-primary/20">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">
                {reason}
              </p>
            </div>
          )}

          {/* Avantages */}
          <ul className="space-y-2.5 mb-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="space-y-2.5">
            <button
              onClick={() => goTo("/login")}
              className="w-full h-12 rounded-xl bg-primary text-black font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </button>
            <button
              onClick={() => goTo("/signup")}
              className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-zinc-700 font-black text-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all text-slate-700 dark:text-slate-300"
            >
              <UserPlus className="w-4 h-4" />
              Créer un compte gratuitement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
