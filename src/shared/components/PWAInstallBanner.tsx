import { useState, useEffect } from "react";
import { Smartphone, X, Share, PlusSquare } from "lucide-react";
import {
  isPWAInstallAvailable,
  isStandalonePWA,
  isIOSDevice,
  onPromptAvailable,
  triggerPWAInstall,
} from "@/core/pwa/pwaInstall";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

const PWAInstallBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ios = isIOSDevice();

    useEffect(() => {
        // Already installed — never show
        if (isStandalonePWA()) return;

        // Dismissed recently — respect cooldown
        const dismissedAt = localStorage.getItem("pwa_dismissed_at");
        if (dismissedAt && Date.now() - Number(dismissedAt) < THREE_DAYS) return;

        if (ios) {
            // iOS: show after 2 seconds (no native prompt available)
            const t = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(t);
        }

        // Android/desktop: show when the singleton has captured the prompt
        if (isPWAInstallAvailable()) {
            setIsVisible(true);
        } else {
            return onPromptAvailable(() => setIsVisible(true));
        }
    }, [ios]);

    const handleInstallClick = async () => {
        if (ios) return; // iOS: user follows Share icon instructions shown in UI
        const outcome = await triggerPWAInstall();
        if (outcome === "accepted" || outcome === "dismissed") {
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa_dismissed_at", Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-700">
            <div className="bg-black text-white p-2.5 shadow-2xl flex items-center justify-between gap-3 border-b border-white/5 backdrop-blur-md bg-black/95">
                <div className="flex items-center gap-3 pl-2">
                    <div className="h-9 w-9 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                        <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-primary">
                            TΞKΗ+ App
                        </p>
                        <p className="text-[9px] font-bold text-white/70 leading-tight uppercase tracking-tight">
                            {ios
                                ? "Partagez puis 'Sur l'écran d'accueil'"
                                : "TΞKΗ+, pour un accès au numérique pour tous."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 pr-1">
                    {!ios && (
                        <button
                            onClick={handleInstallClick}
                            className="bg-primary text-black h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                        >
                            Installer
                        </button>
                    )}
                    {ios && (
                        <div className="flex items-center gap-1.5 opacity-90 scale-90 py-1.5 px-3 bg-white/5 rounded-lg border border-white/10">
                            <Share className="h-4 w-4" />
                            <span className="text-sm font-light text-white/40">|</span>
                            <PlusSquare className="h-4 w-4" />
                        </div>
                    )}
                    <button
                        onClick={handleDismiss}
                        aria-label="Fermer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-white/60"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
