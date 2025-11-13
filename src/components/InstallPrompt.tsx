import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

// Local, minimal type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" } & Record<string, any>>;
}

const isStandalone = () => {
  // iOS
  // @ts-ignore
  if (window.navigator.standalone) return true;
  // Other (Chrome, Edge)
  return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!isStandalone()) setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      console.log("SWAP installé en PWA");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const handleInstall = async () => {
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === "accepted") {
        setVisible(false);
        setDeferred(null);
      } else {
        // Keep banner hidden for this session; it will reappear on next beforeinstallprompt
        setVisible(false);
      }
    } catch (e) {
      console.warn("Install prompt failed", e);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <Card className="w-full max-w-lg bg-card/95 border-border/60 shadow-lg p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-hero text-primary-foreground">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">Installer SWAP</div>
          <div className="text-sm text-muted-foreground">Ajoutez SWAP à votre écran d’accueil pour une expérience rapide et hors ligne.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setVisible(false)}>Plus tard</Button>
          <Button onClick={handleInstall}>Installer</Button>
        </div>
      </Card>
    </div>
  );
}
