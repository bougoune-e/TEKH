import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { saveJson, loadJson } from "@/core/pwa/tekhSession";

/** Scroll vers un élément ancre après navigation SPA */
function scrollToHash(hash: string) {
    if (!hash) return;
    const id = hash.replace("#", "");
    let attempts = 0;
    const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts++ < 10) {
            setTimeout(tryScroll, 100);
        }
    };
    requestAnimationFrame(tryScroll);
}

/**
 * ScrollRestorer — Restauration native du scroll avec mécanisme de retry pour contenu dynamique.
 */
const ScrollRestorer = () => {
    const { pathname, hash, key } = useLocation();
    const navType = useNavigationType();
    const isRestoring = useRef(false);
    const retryTimer = useRef<NodeJS.Timeout | null>(null);

    // Désactive la restauration native du navigateur
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useLayoutEffect(() => {
        const scrollKey = `scroll-${key}`;

        if (navType === "POP") {
            let savedPosition = sessionStorage.getItem(scrollKey);
            if (!savedPosition) {
                const coldY = loadJson<number>(`scroll-path:${pathname}`, true);
                if (coldY != null) savedPosition = String(coldY);
            }

            if (savedPosition) {
                const targetY = parseInt(savedPosition, 10);
                isRestoring.current = true;

                const root = document.getElementById("root");
                if (root) root.style.visibility = "hidden";

                // Mécanisme de Retry : On insiste pour atteindre TargetY
                // car le contenu (deals, carousels) peut charger de manière asynchrone.
                let attempts = 0;
                const maxAttempts = 20; // ~1 seconde max

                const performScroll = () => {
                    window.scrollTo(0, targetY);

                    // Si on a atteint la position ou si on a trop attendu
                    const reached = Math.abs(window.scrollY - targetY) < 10;
                    const maxedOut = window.scrollY >= (document.documentElement.scrollHeight - window.innerHeight - 50);

                    if (reached || maxedOut || attempts >= maxAttempts) {
                        if (retryTimer.current) clearInterval(retryTimer.current);

                        requestAnimationFrame(() => {
                            if (root) root.style.visibility = "";
                            isRestoring.current = false;
                        });
                    }
                    attempts++;
                };

                performScroll(); // Premier essai immédiat
                retryTimer.current = setInterval(performScroll, 50);
            }
        } else {
            if (hash) {
                scrollToHash(hash);
            } else {
                window.scrollTo(0, 0);
            }
        }

        return () => {
            if (retryTimer.current) clearInterval(retryTimer.current);
        };
    }, [pathname, hash, key, navType]);

    // Tracking continu du scroll
    useEffect(() => {
        const scrollKey = `scroll-${key}`;
        const handleScroll = () => {
            if (!isRestoring.current) {
                const y = window.scrollY;
                sessionStorage.setItem(scrollKey, y.toString());
                saveJson(`scroll-path:${pathname}`, y, true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [key, pathname]);

    return null;
};

export default ScrollRestorer;
