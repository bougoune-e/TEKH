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
//    - Returning users (have session or are logged in): hide splash IMMEDIATELY
//    - First-time users: show the splash for 1.8s then fade out
// ---------------------------------------------------------------------------
if (isReturningUser) {
  // Returning user → skip splash entirely
  if (typeof (window as any).hideSplashScreen === 'function') {
    (window as any).hideSplashScreen();
  }
} else {
  // First-time user → show splash for 1.8s then fade out gracefully
  setTimeout(() => {
    if (typeof (window as any).hideSplashScreen === 'function') {
      (window as any).hideSplashScreen();
    }
  }, 1800);
}

createRoot(document.getElementById("root")!).render(<App />);
