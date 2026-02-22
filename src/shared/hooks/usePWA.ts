import { useState, useEffect } from "react";

/**
 * usePWA — Detects if the app is running in "standalone" mode (installed PWA)
 * or if it's being accessed via a mobile browser (often treated as PWA context by users).
 */
export const usePWA = () => {
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const checkPWA = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone
                || document.referrer.includes('android-app://');

            // For development and user preference, we might also consider small screens 
            // as "PWA-like" context if that's the intention.
            setIsPWA(isStandalone);
        };

        checkPWA();
        window.matchMedia('(display-mode: standalone)').addListener(checkPWA);
    }, []);

    return isPWA;
};
