import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollRestorer — sauvegarde la position de scroll de chaque route
 * dans sessionStorage et la restaure lors du retour (bouton Back).
 *
 * - Navigation vers une nouvelle route → scroll en haut
 * - Retour arrière (popstate) → restaure la position exacte
 */
const ScrollRestorer = () => {
    const { pathname, key } = useLocation();
    const isPopState = useRef(false);

    // Détecte si la navigation est un retour arrière (popstate)
    useEffect(() => {
        const handlePopState = () => {
            isPopState.current = true;
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    useEffect(() => {
        const storageKey = `scroll-${pathname}`;

        if (isPopState.current) {
            // Retour arrière : restaure la position sauvegardée
            const saved = sessionStorage.getItem(storageKey);
            if (saved !== null) {
                const y = parseInt(saved, 10);
                // Petit délai pour laisser le DOM se rendre
                requestAnimationFrame(() => {
                    window.scrollTo({ top: y, behavior: "instant" });
                });
            }
            isPopState.current = false;
        } else {
            // Navigation normale : remonte en haut
            window.scrollTo({ top: 0, behavior: "instant" });
        }

        // Sauvegarde la position avant de quitter la page
        const saveScroll = () => {
            sessionStorage.setItem(storageKey, String(window.scrollY));
        };

        window.addEventListener("scroll", saveScroll, { passive: true });
        return () => window.removeEventListener("scroll", saveScroll);
    }, [pathname, key]);

    return null;
};

export default ScrollRestorer;
