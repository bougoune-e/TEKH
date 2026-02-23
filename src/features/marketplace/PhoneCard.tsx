import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Smartphone, MapPin, ShoppingCart } from "lucide-react";
import { cn } from "@/core/api/utils";
import { usePWA } from "@/shared/hooks/usePWA";
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
}

const PhoneCard = ({
  id,
  brand,
  model,
  condition,
  price,
  originalPrice,
  image,
  tag,
  badges = [],
  location,
}: PhoneCardProps) => {
  const navigate = useNavigate();
  const isPWA = usePWA();

  return (
    <Card
      onClick={() => { if (id) navigate(`/deal/${id}`); }}
      className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col hover:shadow-lg rounded-2xl",
        isPWA
          ? "phone-card"
          : "border-slate-200/60 dark:border-white/5 hover:border-blue-500/30 bg-white dark:bg-zinc-950"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-zinc-900/50">
        {image ? (
          <img
            src={image}
            alt={model}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Smartphone className="w-12 h-12 text-slate-200" />
          </div>
        )}
        {tag && (
          <Badge className={`absolute top-3 left-3 z-10 font-bold border-none shadow-sm ${tagClasses(tag)}`}>
            {tag}
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              {brand}
            </p>
            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {model}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map((badge, idx) => (
            <Badge key={idx} variant="secondary" className={`text-[10px] px-2 py-0 border-none font-medium ${badgeClasses(badge)}`}>
              {badge}
            </Badge>
          ))}
          {condition && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-slate-200 text-slate-600 font-medium">
              {condition}
            </Badge>
          )}
        </div>
        {location && (
          <div className="flex items-center text-slate-400 text-[11px] font-medium">
            <MapPin className="h-3 w-3 mr-1" />
            {location}
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        "p-4 pt-0 mt-auto",
        !isPWA && "border-t border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-transparent"
      )}>
        <div className="flex items-center justify-between w-full pt-3">
          <div className="flex flex-col">
            <span className={cn(
              "text-xl font-black",
              isPWA ? "text-[#00FF41]" : "text-slate-900 dark:text-white"
            )}>
              {price.toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span>
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through opacity-70">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <Button size="icon" className={cn(
            "w-10 h-10 rounded-xl shadow-lg shrink-0",
            isPWA ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          )}>
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhoneCard;
