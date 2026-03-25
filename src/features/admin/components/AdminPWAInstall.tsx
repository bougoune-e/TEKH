import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import {
  isPWAInstallAvailable,
  isStandalonePWA,
  onPromptAvailable,
  triggerPWAInstall,
} from "@/core/pwa/pwaInstall";

/**
 * Install banner for the Admin PWA.
 * Relies on the pwaInstall singleton which auto-captures `beforeinstallprompt`.
 * When on /admin pages, AdminLayout swaps the manifest to admin-manifest.webmanifest
 * (scope: "/admin"), so Chrome fires a separate beforeinstallprompt for the admin app.
 */
const DISMISS_KEY = "tekh:admin-pwa-dismiss";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const AdminPWAInstall = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalonePWA()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < SEVEN_DAYS) return;

    if (isPWAInstallAvailable()) {
      setVisible(true);
    } else {
      return onPromptAvailable(() => setVisible(true));
    }
  }, []);

  const install = async () => {
    const outcome = await triggerPWAInstall();
    if (outcome === "accepted" || outcome === "dismissed") setVisible(false);
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
