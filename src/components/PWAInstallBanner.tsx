import { useState, useEffect } from "react";
import { Smartphone, X, Share, PlusSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const PWAInstallBanner = () => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Check if dismissed recently
        const dismissedAt = localStorage.getItem("pwa_dismissed_at");
        if (dismissedAt) {
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - Number(dismissedAt) < oneDay) return;
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // For iOS, we show it after a short delay since there's no event
        if (isIOSDevice) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // iOS users need to be shown instructions (handled in render)
            return;
        }

        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa_dismissed_at", Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-[#064e3b] text-white p-3 shadow-lg flex items-center justify-between gap-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                            TΞKΗ+ App
                        </p>
                        <p className="text-[10px] font-medium text-white/80 leading-tight">
                            {isIOS
                                ? "Appuyez sur 'Partager' puis 'Sur l'écran d'accueil'"
                                : "Installez l'application pour une expérience fluide."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isIOS && (
                        <button
                            onClick={handleInstallClick}
                            className="bg-white text-[#064e3b] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-zinc-100 transition-colors whitespace-nowrap"
                        >
                            Installer
                        </button>
                    )}
                    {isIOS && (
                        <div className="flex items-center gap-1 opacity-80 scale-75 origin-right">
                            <Share className="h-5 w-5" />
                            <span className="text-xl">+</span>
                            <PlusSquare className="h-5 w-5" />
                        </div>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
