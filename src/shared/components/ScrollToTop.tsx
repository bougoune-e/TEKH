import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { saveJson, loadJson } from "@/core/pwa/tekhSession";

/**
 * ScrollRestorer — Native-level scroll restoration.
 *
 * Strategy:
 * - Disables browser-native history.scrollRestoration
 * - Saves scrollY into sessionStorage (per location key) for in-session restores
 * - Also mirrors to localStorage (per pathname) for cold-start rehydration
 * - On POP (back): hides content, restores scroll, then reveals (no flash)
 * - On PUSH/REPLACE: scrolls to top
 *
 * The localStorage layer is consumed by the NavigationProvider on cold start
 * to set the correct scrollY before the first paint.
 */
const ScrollRestorer = () => {
    const { pathname, key } = useLocation();
    const navType = useNavigationType();
    const isRestoring = useRef(false);

    // Disable browser-managed scroll restoration
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // useLayoutEffect to block paint BEFORE the first visible render
    useLayoutEffect(() => {
        const scrollKey = `scroll-${key}`;

        if (navType === "POP") {
            // Try sessionStorage first (fastest, tab-scoped)
            let savedPosition = sessionStorage.getItem(scrollKey);

            // Fallback: localStorage per-path (cold-start case)
            if (!savedPosition) {
                const coldY = loadJson<number>(`scroll-path:${pathname}`, true);
                if (coldY != null) savedPosition = String(coldY);
            }

            if (savedPosition) {
                const y = parseInt(savedPosition, 10);
                isRestoring.current = true;

                // Hide content to prevent visual flash
                const root = document.getElementById("root");
                if (root) {
                    root.style.visibility = "hidden";
                }

                // Restore exact position
                window.scrollTo(0, y);

                // Reveal after scroll is applied
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
            // Normal navigation: scroll to top
            window.scrollTo(0, 0);
        }
    }, [pathname, key, navType]);

    // Continuous scroll position tracking
    useEffect(() => {
        const scrollKey = `scroll-${key}`;

        const handleScroll = () => {
            if (!isRestoring.current) {
                const y = window.scrollY;
                // Fast tab-scoped save
                sessionStorage.setItem(scrollKey, y.toString());
                // Durable per-path save for cold-start rehydration
                saveJson(`scroll-path:${pathname}`, y, true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [key, pathname]);

    return null;
};

export default ScrollRestorer;
