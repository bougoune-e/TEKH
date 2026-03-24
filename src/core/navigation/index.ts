/**
 * Barrel export for the navigation module.
 *
 * All navigation-related types, hooks, and providers are exported from here
 * so consumers can import from "@core/navigation".
 */

export { NavigationProvider, useNavigation } from "./NavigationProvider";
export { useBackNavigation } from "./useBackNavigation";
export { useAppLifecycle } from "./useAppLifecycle";
export { useExitConfirmation } from "./useExitConfirmation";
export { useUIState } from "./useUIState";
export {
    saveSnapshot,
    loadSnapshot,
    clearSnapshot,
    SESSION_EXPIRY_MS,
} from "./navigationStorage";
export type {
    NavigationEntry,
    NavigationSnapshot,
    UIStateMap,
} from "./navigationTypes";
