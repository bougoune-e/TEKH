import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-sm text-muted-foreground">Chargement…</div>
      </div>
    </div>
  );
}
