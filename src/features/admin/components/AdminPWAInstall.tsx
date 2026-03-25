import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

/**
 * Banière d'installation PWA dédiée à l'admin.
 * - Écoute `beforeinstallprompt` pour afficher une invite native
 * - Masquée si déjà en mode standalone (application installée)
 * - Rejetable via localStorage (ne réapparaît pas pendant 7 jours)
 */
const DISMISS_KEY = "tekh:admin-pwa-dismiss";

export const AdminPWAInstall = () => {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Déjà installé → ne pas afficher
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Rejeté récemment → ne pas afficher
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setPrompt(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-zinc-900 border border-[#00FF41]/20 rounded-2xl p-4 shadow-2xl shadow-black/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-[#00FF41]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm leading-tight">Installer l'app Admin</p>
          <p className="text-zinc-400 text-xs font-semibold mt-0.5">
            Accès direct sans navigateur, session persistante.
          </p>
        </div>
        <button
          onClick={install}
          className="shrink-0 flex items-center gap-1.5 bg-[#00FF41] text-black px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <Download className="w-3 h-3" />
          Installer
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
};
