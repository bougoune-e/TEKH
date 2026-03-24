/**
 * NavigationProvider.tsx — Central navigation context & provider.
 *
 * Owns the navigation history stack and exposes helpers to push/pop
 * entries, detect the root screen, and persist/restore snapshots.
 *
 * Lifecycle flow:
 *  1. On mount → attempt snapshot rehydration from localStorage
 *  2. On every route change → push entry to stack + persist snapshot
 *  3. On background → save snapshot (via useAppLifecycle)
 *  4. On foreground → validate expiry, conditionally restore
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useMemo,
} from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import type {
    NavigationEntry,
    NavigationSnapshot,
    UIStateMap,
} from "./navigationTypes";
import { saveSnapshot, loadSnapshot, clearSnapshot } from "./navigationStorage";

// ─── Context shape ──────────────────────────────────────────────────────────

interface NavigationContextValue {
    /** Go back to the previous entry in the stack */
    goBack: () => void;
    /** Whether there is a previous entry to go back to */
    canGoBack: () => boolean;
    /** Whether the user is currently on the root screen (index 0) */
    isRootScreen: () => boolean;
    /** Merge arbitrary UI state into the current stack entry */
    pushUIState: (key: string, value: unknown) => void;
    /** Read the UI state map for the current entry (or null on fresh nav) */
    currentUIState: UIStateMap | null;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

/** Root-level paths that are considered "home" */
const ROOT_PATHS = new Set(["/"]);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navType = useNavigationType();

    // Mutable ref so event handlers always see latest stack
    const stackRef = useRef<NavigationEntry[]>([]);
    const activeIndexRef = useRef<number>(-1);
    // Track the current entry's UI state separately so we can expose it reactively
    const [currentUIState, setCurrentUIState] =
        React.useState<UIStateMap | null>(null);

    // Flag: did we already attempt cold-start rehydration?
    const hydratedRef = useRef(false);

    // ── Cold-start rehydration ────────────────────────────────────────────

    useEffect(() => {
        if (hydratedRef.current) return;
        hydratedRef.current = true;

        const snapshot = loadSnapshot();
        if (snapshot && snapshot.stack.length > 0) {
            stackRef.current = snapshot.stack;
            activeIndexRef.current = snapshot.activeIndex;

            const active = snapshot.stack[snapshot.activeIndex];
            if (active) {
                setCurrentUIState(active.uiState);

                // Navigate to the persisted path if we're not already there
                if (location.pathname !== active.path) {
                    navigate(active.path, { replace: true });
                }

                // Restore scroll position after a frame (content needs to render first)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, active.scrollY);
                    });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Track route changes ───────────────────────────────────────────────

    useEffect(() => {
        const entry: NavigationEntry = {
            path: location.pathname,
            key: location.key,
            scrollY: 0,
            uiState: {},
            timestamp: Date.now(),
        };

        if (navType === "POP") {
            // User pressed back — try to find the previous matching entry
            const idx = stackRef.current.findIndex(
                (e) => e.key === location.key
            );
            if (idx >= 0) {
                activeIndexRef.current = idx;
                setCurrentUIState(stackRef.current[idx].uiState);
            }
        } else {
            // PUSH or REPLACE — trim forward history and push new entry
            if (navType === "PUSH") {
                // Remove any entries after the current index (forward stack)
                stackRef.current = stackRef.current.slice(
                    0,
                    activeIndexRef.current + 1
                );
                stackRef.current.push(entry);
                activeIndexRef.current = stackRef.current.length - 1;
            } else {
                // REPLACE — update the current entry in-place
                if (activeIndexRef.current >= 0) {
                    stackRef.current[activeIndexRef.current] = entry;
                } else {
                    stackRef.current.push(entry);
                    activeIndexRef.current = 0;
                }
            }
            setCurrentUIState(entry.uiState);
        }

        // Persist after every route change
        persistSnapshot();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, location.key, navType]);

    // ── Continuous scroll tracking ────────────────────────────────────────

    useEffect(() => {
        const handleScroll = () => {
            const idx = activeIndexRef.current;
            if (idx >= 0 && stackRef.current[idx]) {
                stackRef.current[idx].scrollY = window.scrollY;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ── Helpers ───────────────────────────────────────────────────────────

    const persistSnapshot = useCallback(() => {
        const snapshot: NavigationSnapshot = {
            stack: stackRef.current,
            activeIndex: activeIndexRef.current,
            savedAt: Date.now(),
        };
        saveSnapshot(snapshot);
    }, []);

    const goBack = useCallback(() => {
        if (activeIndexRef.current > 0) {
            navigate(-1);
        }
    }, [navigate]);

    const canGoBack = useCallback(() => {
        return activeIndexRef.current > 0;
    }, []);

    const isRootScreen = useCallback(() => {
        return (
            activeIndexRef.current <= 0 ||
            ROOT_PATHS.has(location.pathname)
        );
    }, [location.pathname]);

    const pushUIState = useCallback(
        (key: string, value: unknown) => {
            const idx = activeIndexRef.current;
            if (idx >= 0 && stackRef.current[idx]) {
                stackRef.current[idx].uiState[key] = value;
                setCurrentUIState({ ...stackRef.current[idx].uiState });
                // Persist immediately so background save captures the latest state
                persistSnapshot();
            }
        },
        [persistSnapshot]
    );

    // ── Context value (stable reference) ──────────────────────────────────

    const value = useMemo<NavigationContextValue>(
        () => ({
            goBack,
            canGoBack,
            isRootScreen,
            pushUIState,
            currentUIState,
        }),
        [goBack, canGoBack, isRootScreen, pushUIState, currentUIState]
    );

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Access the navigation context.
 * Must be used inside <NavigationProvider>.
 */
export function useNavigation(): NavigationContextValue {
    const ctx = useContext(NavigationContext);
    if (!ctx) {
        throw new Error("useNavigation must be used within <NavigationProvider>");
    }
    return ctx;
}
