/**
 * useAppLifecycle.ts — Hooks into foreground / background lifecycle events.
 *
 * Events handled:
 *  - `visibilitychange`  → fires when tab is hidden/shown
 *  - `pagehide`          → fires on tab close / navigation away
 *  - `freeze`            → fires on Chrome's "page lifecycle" freeze
 *
 * On background → persists the navigation snapshot.
 * On foreground → checks session expiry and either restores or clears.
 *
 * All listeners are cleaned up on unmount to prevent memory leaks.
 */

import { useEffect, useRef, useCallback } from "react";
import {
    saveSnapshot,
    loadSnapshot,
    clearSnapshot,
    SESSION_EXPIRY_MS,
} from "./navigationStorage";
import type { NavigationSnapshot } from "./navigationTypes";

interface UseAppLifecycleOptions {
    /** Called when the app resumes and the session is still valid */
    onRestore?: (snapshot: NavigationSnapshot) => void;
    /** Called when the app resumes but the session has expired */
    onExpired?: () => void;
    /** Provides the current snapshot to persist on background */
    getSnapshot: () => NavigationSnapshot;
}

export function useAppLifecycle(options: UseAppLifecycleOptions): void {
    const { onRestore, onExpired, getSnapshot } = options;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    // ── Background handler ────────────────────────────────────────────────

    const handleBackground = useCallback(() => {
        try {
            const snapshot = optionsRef.current.getSnapshot();
            saveSnapshot(snapshot);
        } catch {
            /* silently fail — quota or private mode */
        }
    }, []);

    // ── Foreground handler ────────────────────────────────────────────────

    const handleForeground = useCallback(() => {
        const snapshot = loadSnapshot();
        if (snapshot) {
            // loadSnapshot already checks SESSION_EXPIRY_MS
            optionsRef.current.onRestore?.(snapshot);
        } else {
            // Snapshot was null → either didn't exist or expired
            optionsRef.current.onExpired?.();
        }
    }, []);

    // ── Wire event listeners ──────────────────────────────────────────────

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                handleBackground();
            } else if (document.visibilityState === "visible") {
                handleForeground();
            }
        };

        const onPageHide = () => {
            handleBackground();
        };

        const onFreeze = () => {
            handleBackground();
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("pagehide", onPageHide);

        // `freeze` is part of the Page Lifecycle API (Chrome 68+)
        // Not all browsers support it, so we guard.
        if ("onfreeze" in document) {
            document.addEventListener("freeze", onFreeze);
        }

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("pagehide", onPageHide);
            if ("onfreeze" in document) {
                document.removeEventListener("freeze", onFreeze);
            }
        };
    }, [handleBackground, handleForeground]);
}
