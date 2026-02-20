import { useState, useEffect } from "react";
import { Smartphone, X } from "lucide-react";
import { toast } from "sonner";

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Initial delay of 1 minute (60,000ms)
        const timer = setInterval(() => {
            // Show periodic notification if not in standalone mode
            if (!window.matchMedia("(display-mode: standalone)").matches) {
                toast("📲 Installez TΞKΗ+ sur votre écran d'accueil", {
                    description: "Pour une meilleure expérience, installez l'application.",
                    action: {
                        label: "Installer",
                        onClick: () => handleInstallClick(),
                    },
                    duration: 5000,
                });
            }
        }, 60000);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            clearInterval(timer);
        };
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    return null;
};

export default PWAInstallBanner;
