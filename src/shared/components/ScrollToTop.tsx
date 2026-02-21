import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollRestorer — Restauration native-level du scroll.
 *
 * Stratégie :
 * - Désactive history.scrollRestoration du navigateur
 * - Sauvegarde scrollY dans sessionStorage en continu (par clé de visite)
 * - Sur POP (retour arrière) : masque le contenu, restaure le scroll, puis révèle
 * - Sur PUSH/REPLACE (nouvelle nav) : remet en haut
 *
 * Cela empêche le "flash" visuel de re-défilement.
 */
const ScrollRestorer = () => {
    const { pathname, key } = useLocation();
    const navType = useNavigationType();
    const isRestoring = useRef(false);

    // Désactive la gestion automatique du navigateur
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // useLayoutEffect pour bloquer le paint AVANT le premier rendu visible
    useLayoutEffect(() => {
        const scrollKey = `scroll-${key}`;

        if (navType === "POP") {
            const savedPosition = sessionStorage.getItem(scrollKey);
            if (savedPosition) {
                const y = parseInt(savedPosition, 10);
                isRestoring.current = true;

                // Masquer le contenu pour empêcher le flash visuel
                const root = document.getElementById("root");
                if (root) {
                    root.style.visibility = "hidden";
                }

                // Restaurer la position exacte
                window.scrollTo(0, y);

                // Révéler après que le scroll soit appliqué
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (root) {
                            root.style.visibility = "";
                        }
                        isRestoring.current = false;
                    });
                });
            }
        } else {
            // Navigation normale : scroll en haut instantanément
            window.scrollTo(0, 0);
        }
    }, [pathname, key, navType]);

    // Sauvegarde continue de la position
    useEffect(() => {
        const scrollKey = `scroll-${key}`;

        const handleScroll = () => {
            if (!isRestoring.current) {
                sessionStorage.setItem(scrollKey, window.scrollY.toString());
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [key]);

    return null;
};

export default ScrollRestorer;
