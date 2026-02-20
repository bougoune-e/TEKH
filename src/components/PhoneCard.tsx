import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Smartphone, Star, MapPin, Heart, ArrowRightLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function tagClasses(t?: string) {
  if (!t) return "bg-primary text-primary-foreground";
  const s = t.toLowerCase();
  if (s.includes("match parfait")) return "bg-emerald-600 text-white";
  if (s.includes("match partiel")) return "bg-amber-500 text-black";
  if (s.includes("proche")) return "bg-sky-600 text-white";
  if (s.includes("nouveau")) return "bg-indigo-600 text-white";
  if (s.includes("vérifié") || s.includes("verifie")) return "bg-blue-600 text-white";
  if (s.includes("populaire")) return "bg-rose-600 text-white";
  return "bg-primary text-primary-foreground";
}

function badgeClasses(b: string) {
  const s = b.toLowerCase();
  if (s.startsWith("correspondance")) return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  if (s.includes("confiance")) return "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (s.includes("négociable") || s.includes("negociable")) return "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800";
  if (s.includes("bon plan") || s.includes("🔥")) return "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
  if (s.includes("reconditionné") || s.includes("reconditionne")) return "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800";
  return "bg-muted text-foreground/90 border border-border/60";
}

interface PhoneCardProps {
  id?: string;
  brand: string;
  model: string;
  condition: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  tag?: string;
  badges?: string[];
  extraLine?: string;
  location?: string;
  createdAt?: string;
  onDelete?: (() => void) | null;
  variant?: "default" | "compact"; // We'll ignore this now as we want a uniform look
}

const PhoneCard = ({
  id,
  brand,
  model,
  condition,
  price,
  originalPrice,
  image,
  rating = 4.5,
  tag,
  badges = [],
  extraLine,
  location,
  createdAt,
  onDelete,
}: PhoneCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => { if (id) navigate(`/deal/${id}`); }}
      className="group relative bg-white dark:bg-[#0b0e14] border border-zinc-100 dark:border-white/5 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 scale-in shadow-sm cursor-pointer"
    >
      {/* Visual Badge Style SaaS */}
      {(tag || true) && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
          {tag && (
            <Badge className="bg-[#064e3b] dark:bg-primary text-white dark:text-black hover:bg-[#064e3b] dark:hover:bg-primary border-0 rounded-md font-black italic text-[9px] px-2 py-0.5 shadow-sm">
              {tag}
            </Badge>
          )}
          <Badge className="bg-black dark:bg-white text-white dark:text-black border-0 rounded-md font-black text-[8px] px-2 py-0.5 shadow-sm flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 fill-current" /> certifié TEKH+
          </Badge>
        </div>
      )}

      {/* Media with proper scale */}
      <div className="relative aspect-[4/5] bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden border-b border-zinc-100 dark:border-white/5">
        {image ? (
          <img
            src={image}
            alt={`${brand} ${model}`}
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
            <Smartphone className="w-10 h-10 text-slate-300 dark:text-zinc-700" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 2).map((b, i) => (
              <Badge key={i} variant="secondary" className="bg-white/40 hover:bg-white/60 text-black border-0 text-[8px] font-black uppercase rounded-full backdrop-blur-md">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm leading-none transition-colors">
              {brand} <span className="text-[#374151] dark:text-slate-500">{model}</span>
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] uppercase font-black border-slate-200 dark:border-white/10 text-[#374151] dark:text-slate-500 rounded-md h-5 px-1.5 bg-zinc-50 dark:bg-transparent">
                {condition}
              </Badge>
              {location && (
                <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {location}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-black dark:text-white tracking-tighter italic leading-none">
              {price.toLocaleString()} <span className="text-[10px] opacity-40 not-italic ml-0.5">FCFA</span>
            </p>
            {originalPrice && (
              <span className="text-[9px] text-slate-400 line-through">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {extraLine && (
          <p className="text-[9px] font-black text-[#064e3b] dark:text-primary uppercase tracking-wider py-1.5 border-t border-slate-100 dark:border-white/5 truncate">
            {extraLine}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <Button className="flex-1 h-9 rounded-full bg-black dark:bg-primary text-white dark:text-black font-black text-[10px] uppercase tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all border-0">
            Détails Deal
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="h-9 w-9 rounded-full border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneCard;
