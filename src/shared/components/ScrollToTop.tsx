import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollRestorer — Gère la restauration du scroll native-level.
 * Utilise sessionStorage pour mémoriser la position par 'key' (identifiant de visite unique).
 */
const ScrollRestorer = () => {
    const { pathname, key } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // Désactive la gestion automatique du navigateur pour éviter les conflits
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useEffect(() => {
        const scrollKey = `scroll-${key}`;

        if (navType === "POP") {
            // Retour arrière : restauration instantanée
            const savedPosition = sessionStorage.getItem(scrollKey);
            if (savedPosition) {
                const y = parseInt(savedPosition, 10);
                // Utiliser behavior: 'instant' ou scrollTo direct pour éviter l'effet de glissement
                window.scrollTo(0, y);
            }
        } else {
            // Nouvelle navigation : on repart du haut
            window.scrollTo(0, 0);
        }

        // Sauvegarde la position lors du scroll ou avant de quitter
        const handleScroll = () => {
            sessionStorage.setItem(scrollKey, window.scrollY.toString());
        };

        // On sauvegarde aussi de manière préventive sur l'événement avant déchargement
        const handleUnload = () => {
            sessionStorage.setItem(scrollKey, window.scrollY.toString());
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [pathname, key, navType]);

    return null;
};

export default ScrollRestorer;
