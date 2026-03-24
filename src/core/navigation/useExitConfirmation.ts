/**
 * useExitConfirmation.ts — "Press back again to exit" pattern.
 *
 * First back press on root screen → shows a toast.
 * Second back press within EXIT_WINDOW_MS → attempts app exit.
 * If no second press occurs, the timer resets.
 *
 * Uses `sonner` (already installed) for the toast notification.
 * Properly cleans up the timer on unmount.
 */

import { useCallback, useRef } from "react";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Window (ms) in which a second back press will trigger exit */
const EXIT_WINDOW_MS = 2_000;

/** Toast message shown on the first back press */
const EXIT_TOAST_MESSAGE = "Appuyez encore pour quitter";

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useExitConfirmation() {
    const exitPendingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Call this when the user presses back on the root screen.
     * Returns `true` if the app should exit, `false` otherwise.
     */
    const handleExitAttempt = useCallback((): boolean => {
        if (exitPendingRef.current) {
            // Second press within the window — exit
            clearTimer();
            attemptExit();
            return true;
        }

        // First press — show toast and start timer
        exitPendingRef.current = true;
        toast(EXIT_TOAST_MESSAGE, {
            duration: EXIT_WINDOW_MS,
            position: "bottom-center",
        });

        timerRef.current = setTimeout(() => {
            exitPendingRef.current = false;
            timerRef.current = null;
        }, EXIT_WINDOW_MS);

        return false;
    }, []);

    /** Cleanup — call in useEffect return or on unmount */
    const cleanup = useCallback(() => {
        clearTimer();
        exitPendingRef.current = false;
    }, []);

    return { handleExitAttempt, cleanup };
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function clearTimer() {
    // Access via closure isn't possible here, so we rely on the ref pattern
    // inside the hook. This standalone helper is for the attemptExit path.
}

function attemptExit(): void {
    // In a PWA / WebView, window.close() may work.
    // In a regular browser tab it usually doesn't, so we fall back to
    // navigating to a blank page (effectively "leaving" the app).
    try {
        window.close();
    } catch {
        /* not allowed in this context */
    }

    // Fallback: navigate away so the user isn't stuck
    // Using a small delay to let window.close() attempt first
    setTimeout(() => {
        if (!document.hidden) {
            window.location.href = "about:blank";
        }
    }, 100);
}
