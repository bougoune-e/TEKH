/**
 * useUIState.ts — Per-route UI state tracking hook.
 *
 * Components call `setUI(key, value)` to persist arbitrary UI state
 * (active tab, expanded accordion, selected filter, open modal, etc.)
 * into the current navigation entry.
 *
 * On route restore (back navigation or cold-start rehydration),
 * `getUI(key)` returns the previously saved value.
 *
 * Usage:
 *   const { getUI, setUI } = useUIState();
 *   const activeTab = getUI<string>("activeTab") ?? "all";
 *   const handleTabChange = (tab: string) => { setUI("activeTab", tab); setActiveTab(tab); };
 */

import { useCallback } from "react";
import { useNavigation } from "./NavigationProvider";

export function useUIState() {
    const { currentUIState, pushUIState } = useNavigation();

    /**
     * Read a UI state value for the current route.
     * Returns `undefined` if the key was never set.
     */
    const getUI = useCallback(
        <T = unknown>(key: string): T | undefined => {
            if (!currentUIState) return undefined;
            return currentUIState[key] as T | undefined;
        },
        [currentUIState]
    );

    /**
     * Set a UI state value for the current route.
     * The value must be JSON-serializable.
     */
    const setUI = useCallback(
        (key: string, value: unknown): void => {
            pushUIState(key, value);
        },
        [pushUIState]
    );

    return { getUI, setUI };
}
