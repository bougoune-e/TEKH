import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/app/index.css";
import "@/core/config/i18n";

// ---------------------------------------------------------------------------
// 1. Synchronous path restoration (Anti-Splash Screen)
//    Check for a valid navigation snapshot BEFORE React initializes.
//    If we're at "/" but have a saved path, jump to it immediately.
// ---------------------------------------------------------------------------
let isReturningUser = false;

try {
  const raw = localStorage.getItem("tekh:nav-snapshot");
  if (raw) {
    const snapshot = JSON.parse(raw);
    const SESSION_EXPIRY_MS = 30 * 60 * 1000;
    if (snapshot.savedAt > Date.now() - SESSION_EXPIRY_MS) {
      isReturningUser = true;
      const active = snapshot.stack[snapshot.activeIndex];
      if (active && window.location.pathname === "/") {
        window.history.replaceState(null, "", active.path);
      }
    }
  }
} catch (e) {
  /* private mode / corrupted storage */
}

// Also check for logged-in user (Supabase stores auth tokens)
if (!isReturningUser) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        isReturningUser = true;
        break;
      }
    }
  } catch (e) {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// 2. Splash screen logic
//    - PWA standalone only: first-time users see splash 1.8s
//    - Web browser (non-standalone): skip splash entirely (non-professionnel)
//    - Returning users: toujours skip
// ---------------------------------------------------------------------------
const isStandalonePWA =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

if (isReturningUser || !isStandalonePWA) {
  if (typeof (window as any).hideSplashScreen === 'function') {
    (window as any).hideSplashScreen();
  }
} else {
  // PWA first-time → show splash 1.8s then fade out
  setTimeout(() => {
    if (typeof (window as any).hideSplashScreen === 'function') {
      (window as any).hideSplashScreen();
    }
  }, 1800);
}

// ---------------------------------------------------------------------------
// 3. Service Worker registration
//    Required for PWA installability (beforeinstallprompt won't fire without SW).
//    Registers sw-fallback.js which handles SPA routing (404 prevention)
//    and Web Push notifications.
// ---------------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw-fallback.js", { scope: "/" })
      .catch(() => {/* SW registration failure is non-fatal */});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
