/**
 * Module singleton for PWA install prompt.
 * Auto-captures `beforeinstallprompt` at module load so any component
 * (Footer, banner, etc.) can trigger installation at any time,
 * regardless of UI cooldowns or component mount state.
 */

let _prompt: any = null;
const _listeners: Array<() => void> = [];

// Auto-capture as soon as this module is imported — no UI component required.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _prompt = e;
    _listeners.forEach((fn) => fn());
  });
}

/** Subscribe to prompt availability changes (returns unsubscribe fn). */
export function onPromptAvailable(fn: () => void) {
  _listeners.push(fn);
  return () => {
    const idx = _listeners.indexOf(fn);
    if (idx !== -1) _listeners.splice(idx, 1);
  };
}

/** True if the browser has a deferred install prompt ready. */
export function isPWAInstallAvailable() {
  return !!_prompt;
}

/** True if running as an installed standalone PWA. */
export function isStandalonePWA() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/** True if the device is iOS (Safari install is manual). */
export function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Trigger the native install prompt.
 * Returns 'accepted' | 'dismissed' | 'unavailable'.
 */
export async function triggerPWAInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!_prompt) return "unavailable";
  _prompt.prompt();
  const { outcome } = await _prompt.userChoice;
  _prompt = null;
  return outcome === "accepted" ? "accepted" : "dismissed";
}
