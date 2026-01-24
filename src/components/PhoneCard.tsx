import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Smartphone, Star, MapPin, Heart, ArrowRightLeft } from "lucide-react";
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

  // Dynamic brand icon lookup from assets if available
  const modules = import.meta.glob<{ default: string }>("../../assets/icons/brands/*.svg", { eager: true, import: "default" });
  const brandIcon = (() => {
    const entries = Object.entries(modules);
    const slug = brand.toLowerCase();
    const found = entries.find(([p]) => p.toLowerCase().includes(slug));
    return found ? (found[1] as unknown as string) : undefined;
  })();

  const timeAgo = (() => {
    if (!createdAt) return undefined;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "Maintenant";
    if (min < 60) return `${min} m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    return d === 0 ? "Auj." : `${d} j`;
  })();

  // Calculate 'Class' based on condition/price (mock logic for now)
  const trustClass = condition === 'Neuf' ? 'A+' : condition === 'Très bon' ? 'A' : condition === 'Bon' ? 'B' : 'C';

  return (
    <Card
      onClick={() => { if (id) navigate(`/deal/${id}`); }}
      className="group relative cursor-pointer overflow-hidden bg-card border border-border/50 rounded-[28px] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/5] w-full bg-muted/20 flex items-center justify-center relative overflow-hidden">

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
            {tag && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider ${tagClasses(tag)}`}>
                {tag}
              </span>
            )}
            <span className="bg-white/90 backdrop-blur dark:bg-black/70 text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/20 shadow-sm">
              CLASSE {trustClass}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); /* TODO: Toggle fav */ }}
              className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur flex items-center justify-center text-foreground hover:scale-110 transition-transform shadow-sm"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Image */}
          {image ? (
            <img
              src={image}
              alt={`${brand} ${model}`}
              className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-muted-foreground/40">
              <Smartphone className="h-16 w-16" />
            </div>
          )}

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <Button size="sm" className="rounded-full font-semibold gap-2 bg-white text-black hover:bg-white/90 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <ArrowRightLeft className="h-4 w-4" />
              Swap Now
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-[15px] leading-tight text-foreground line-clamp-2">{brand} {model}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span className="font-medium bg-muted px-1.5 py-0.5 rounded">{condition}</span>
              {timeAgo && <span>• {timeAgo}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground line-through opacity-70">
              {originalPrice ? `${originalPrice.toLocaleString()} F` : ""}
            </span>
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
            </span>
          </div>
        </div>

        {extraLine && (
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded w-fit">
            {extraLine}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneCard;
