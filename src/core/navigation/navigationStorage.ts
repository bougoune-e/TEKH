/**
 * navigationStorage.ts — Persistence layer for navigation state.
 *
 * Fully decoupled from React and the NavigationProvider so it can be
 * unit-tested independently. Uses the existing tekhSession helpers
 * (which write to localStorage / sessionStorage with the "tekh:" prefix).
 */

import { saveJson, loadJson } from "@/core/pwa/tekhSession";
import type { NavigationSnapshot } from "./navigationTypes";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Key used in localStorage for the navigation snapshot */
const SNAPSHOT_KEY = "nav-snapshot";

/**
 * Session expiry threshold in milliseconds.
 * If the user returns after this duration, we discard the snapshot
 * and start a fresh session.
 *
 * Default: 30 minutes.
 */
export const SESSION_EXPIRY_MS = 30 * 60 * 1000;

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Save the full navigation snapshot to localStorage.
 * Called on every route change and when the app goes to background.
 */
export function saveSnapshot(snapshot: NavigationSnapshot): void {
    saveJson(SNAPSHOT_KEY, snapshot, /* useLocal */ true);
}

/**
 * Load and validate the navigation snapshot from localStorage.
 *
 * Returns `null` if:
 * - No snapshot exists
 * - The snapshot is corrupted / fails validation
 * - The session has expired (gap > SESSION_EXPIRY_MS)
 */
export function loadSnapshot(): NavigationSnapshot | null {
    const snapshot = loadJson<NavigationSnapshot>(SNAPSHOT_KEY, /* useLocal */ true);

    if (!snapshot) return null;

    // Structural validation
    if (
        !Array.isArray(snapshot.stack) ||
        typeof snapshot.activeIndex !== "number" ||
        typeof snapshot.savedAt !== "number"
    ) {
        clearSnapshot();
        return null;
    }

    // Session expiry check
    const elapsed = Date.now() - snapshot.savedAt;
    if (elapsed > SESSION_EXPIRY_MS) {
        clearSnapshot();
        return null;
    }

    return snapshot;
}

/**
 * Remove the persisted snapshot (e.g. on logout or session expiry).
 */
export function clearSnapshot(): void {
    try {
        localStorage.removeItem("tekh:" + SNAPSHOT_KEY);
    } catch {
        /* quota / private mode */
    }
}
