/**
 * useBackNavigation.ts — Wires the browser back button / popstate
 * to the navigation provider's goBack logic.
 *
 * On non-root screens it pops the stack normally.
 * On root screens it delegates to the exit-confirmation hook.
 *
 * Must be rendered inside <NavigationProvider> and <BrowserRouter>.
 * Cleans up all listeners on unmount (no memory leaks).
 */

import { useEffect, useCallback } from "react";
import { useNavigation } from "./NavigationProvider";

interface UseBackNavigationOptions {
    /** Called when back is pressed on the root screen */
    onRootBack?: () => void;
}

export function useBackNavigation(
    options: UseBackNavigationOptions = {}
): void {
    const { goBack, isRootScreen } = useNavigation();
    const { onRootBack } = options;

    const handleBack = useCallback(
        (e: PopStateEvent) => {
            if (isRootScreen()) {
                // Prevent the default pop behavior and delegate to exit logic
                // We push a replacement entry so the user stays on the page
                window.history.pushState(null, "", window.location.href);
                onRootBack?.();
            }
            // Non-root: the browser already performed history.back(),
            // react-router-dom will fire a POP navigation which the
            // NavigationProvider handles automatically.
        },
        [isRootScreen, onRootBack]
    );

    useEffect(() => {
        // Push an initial entry so the first back press fires popstate
        // instead of closing the tab/PWA.
        window.history.pushState(null, "", window.location.href);

        window.addEventListener("popstate", handleBack);
        return () => {
            window.removeEventListener("popstate", handleBack);
        };
    }, [handleBack]);
}
