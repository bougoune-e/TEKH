/**
 * navigationTypes.ts — Shared TypeScript types for the navigation system.
 *
 * These types are decoupled from any React or storage concern so they
 * can be consumed by both the NavigationProvider and the persistence layer.
 */

/** Serializable per-route UI state (active tab index, expanded accordion IDs, etc.) */
export type UIStateMap = Record<string, unknown>;

/**
 * A single entry in the navigation history stack.
 * Each entry captures the route, scroll position, and any serializable UI state
 * at the time of navigation.
 */
export interface NavigationEntry {
    /** Route pathname, e.g. "/deals" */
    path: string;
    /** react-router location key — unique per visit */
    key: string;
    /** Vertical scroll position in pixels */
    scrollY: number;
    /** Arbitrary per-route UI state (tabs, filters, expanded sections, modals) */
    uiState: UIStateMap;
    /** Unix timestamp (ms) of when this entry was created / last updated */
    timestamp: number;
}

/**
 * Full navigation snapshot persisted to localStorage.
 * Used for cold-start rehydration and background/foreground restoration.
 */
export interface NavigationSnapshot {
    /** Ordered history stack */
    stack: NavigationEntry[];
    /** Index of the currently active entry in the stack */
    activeIndex: number;
    /** Unix timestamp (ms) of when the snapshot was saved */
    savedAt: number;
}
