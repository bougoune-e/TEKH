import { useState, useEffect } from "react";
import { X, Share, Plus, ArrowDown } from "lucide-react";
import {
  isPWAInstallAvailable,
  isStandalonePWA,
  isIOSDevice,
  onPromptAvailable,
  triggerPWAInstall,
} from "@/core/pwa/pwaInstall";

const ONE_DAY = 24 * 60 * 60 * 1000;

/** Safari sur iOS = seul browser capable d'installer une PWA sur Apple */
function isSafariBrowser() {
  const ua = navigator.userAgent;
  // Safari contient "Safari" mais PAS "Chrome", "CriOS", "FxiOS", "GSA"
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|GSA|OPiOS/.test(ua);
}

/* ── Guide iOS ── bottom sheet avec étapes visuelles ── */
function IOSGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src="/icon-512.png" alt="TEKH+" className="w-10 h-10 rounded-xl shadow" />
            <div>
              <p className="font-black text-foreground text-sm">Installer TEKH+</p>
              <p className="text-xs text-muted-foreground">Accès rapide depuis l'écran d'accueil</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Étapes */}
        <div className="space-y-3 mb-6">
          {/* Étape 1 */}
          <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow">
              <Share className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Appuie sur Partager</p>
              <p className="text-xs text-muted-foreground leading-snug">Le bouton <span className="font-semibold">□↑</span> en bas de Safari</p>
            </div>
            <span className="text-xs font-black text-zinc-400">1</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
          </div>

          {/* Étape 2 */}
          <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b] flex items-center justify-center shrink-0 shadow">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">«&nbsp;Sur l'écran d'accueil&nbsp;»</p>
              <p className="text-xs text-muted-foreground leading-snug">Fais défiler le menu du bas</p>
            </div>
            <span className="text-xs font-black text-zinc-400">2</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
          </div>

          {/* Étape 3 */}
          <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 shadow">
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Appuie sur «&nbsp;Ajouter&nbsp;»</p>
              <p className="text-xs text-muted-foreground leading-snug">TEKH+ apparaît sur ton écran d'accueil</p>
            </div>
            <span className="text-xs font-black text-zinc-400">3</span>
          </div>
        </div>

        {/* Note Safari */}
        <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
          Fonctionne uniquement dans <span className="font-bold">Safari</span> sur iPhone/iPad.
          <br />Si tu utilises Chrome ou Firefox, ouvre d'abord ce lien dans Safari.
        </p>
      </div>
    </div>
  );
}

/* ── Banner Android/Desktop ── barre compacte en bas ── */
function AndroidBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-20 left-3 right-3 z-[100] animate-in slide-in-from-bottom duration-500">
      <div className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl shadow-2xl flex items-center justify-between gap-3 px-4 py-3 border border-white/10">
        <div className="flex items-center gap-3">
          <img src="/icon-512.png" alt="TEKH+" className="w-9 h-9 rounded-xl" />
          <div>
            <p className="text-xs font-black leading-none">Installer TEKH+</p>
            <p className="text-[10px] text-white/60 font-medium mt-0.5">Accès rapide, mode hors-ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onInstall}
            className="bg-[#059669] text-white h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-[#10b981] active:scale-95 transition-all"
          >
            Installer
          </button>
          <button onClick={onDismiss} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Composant principal ── */
const PWAInstallBanner = () => {
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const ios = isIOSDevice();

  useEffect(() => {
    if (isStandalonePWA()) return;

    const dismissedAt = localStorage.getItem("pwa_dismissed_at");
    if (dismissedAt && Date.now() - Number(dismissedAt) < ONE_DAY) return;

    if (ios) {
      // N'afficher que dans Safari — Chrome/Firefox iOS ne peuvent pas installer
      if (!isSafariBrowser()) return;
      const t = setTimeout(() => setShowIOS(true), 2000);
      return () => clearTimeout(t);
    }

    if (isPWAInstallAvailable()) {
      setShowAndroid(true);
    } else {
      return onPromptAvailable(() => setShowAndroid(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    const outcome = await triggerPWAInstall();
    if (outcome === "accepted" || outcome === "dismissed") setShowAndroid(false);
  };

  const handleDismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    localStorage.setItem("pwa_dismissed_at", Date.now().toString());
  };

  if (showIOS) return <IOSGuide onClose={handleDismiss} />;
  if (showAndroid) return <AndroidBanner onInstall={handleInstall} onDismiss={handleDismiss} />;
  return null;
};

export default PWAInstallBanner;
