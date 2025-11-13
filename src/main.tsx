import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// PWA service worker registration
// Register PWA service worker only in production
if (import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        if (confirm("Nouvelle version disponible. Recharger ?")) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log("L’application est prête à fonctionner hors ligne.");
      },
    });
  });
}
