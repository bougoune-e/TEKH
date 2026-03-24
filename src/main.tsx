import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/app/index.css";
import "@/core/config/i18n";

// Synchronous path restoration (Anti-Splash Screen)
// Check for a valid navigation snapshot BEFORE React initializes.
// If we're at "/" but have a saved path, jump to it immediately.
try {
  const raw = localStorage.getItem("tekh:nav-snapshot");
  if (raw) {
    const snapshot = JSON.parse(raw);
    const SESSION_EXPIRY_MS = 30 * 60 * 1000;
    if (snapshot.savedAt > Date.now() - SESSION_EXPIRY_MS) {
      const active = snapshot.stack[snapshot.activeIndex];
      if (active && window.location.pathname === "/") {
        window.history.replaceState(null, "", active.path);
      }
    }
  }
} catch (e) {
  /* private mode / corrupted storage */
}

// Hide the static index.html splash screen immediately
if (typeof (window as any).hideSplashScreen === 'function') {
  (window as any).hideSplashScreen();
}

createRoot(document.getElementById("root")!).render(<App />);
