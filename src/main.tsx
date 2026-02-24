import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/app/index.css";
import "@/core/config/i18n";

// PWA : enregistrer le SW qui sert index.html pour toutes les routes (évite 404 au rafraîchissement)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw-fallback.js", { scope: "/" }).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
