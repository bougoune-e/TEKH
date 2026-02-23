import { useState, useEffect, useCallback } from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * En PWA, détecte une nouvelle version déployée (script hash différent)
 * et propose de recharger pour éviter cache / dropdowns cassés.
 */
export default function NewVersionBanner() {
  const [show, setShow] = useState(false);

  const checkVersion = useCallback(async () => {
    try {
      const script = document.querySelector('script[type="module"][src*="assets/"]') as HTMLScriptElement | null;
      if (!script?.src) return;

      const url = `${window.location.origin}${window.location.pathname || "/"}`.replace(/#.*$/, "");
      const res = await fetch(url, { cache: "no-store", headers: { Pragma: "no-cache" } });
      const html = await res.text();
      const match = html.match(/script[^>]+type="module"[^>]+src="([^"]+assets\/[^"]+)"/);
      const latestSrc = match ? match[1].replace(/^\/+/, window.location.origin + "/") : null;
      const currentSrc = script.src;

      if (latestSrc && currentSrc && latestSrc !== currentSrc) {
        setShow(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, 60 * 1000);
    const onFocus = () => checkVersion();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkVersion]);

  const handleReload = () => {
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9998] animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-6 md:max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/95 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-foreground">
            Nouvelle version disponible
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
            Rechargez pour profiter des dernières mises à jour.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleReload}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
          >
            Recharger
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
