import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function PageLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return <div className="min-h-dvh w-full bg-background" />;

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">
          TEKH<span className="italic">+</span>
        </div>
      </div>
    </div>
  );
}
