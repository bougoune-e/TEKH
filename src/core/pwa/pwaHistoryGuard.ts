/**
 * Sur PWA Android, le premier « Retour » peut fermer l’app si la pile d’historique est vide.
 * On ajoute une entrée factice une fois par session pour que le premier retour reste dans l’app.
 */
const KEY = "tekh:pwa-history-guard-v1";

export function installPWAHistoryGuard(isPWA: boolean): void {
  if (typeof window === "undefined" || !isPWA) return;
  try {
    if (sessionStorage.getItem(KEY) === "1") return;
    sessionStorage.setItem(KEY, "1");
    const { pathname, search, hash } = window.location;
    window.history.pushState({ tekhGuard: true }, "", pathname + search + hash);
  } catch {
    /* private mode / quota */
  }
}
