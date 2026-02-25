import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Smartphone, MapPin, ShoppingCart, Calendar } from "lucide-react";
import { cn } from "@/core/api/utils";
import { usePWA } from "@/shared/hooks/usePWA";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/features/marketplace/cart.context";
import { toast } from "sonner";

function tagClasses(t?: string) {
  if (!t) return "bg-primary text-primary-foreground";
  const s = t.toLowerCase();
  if (s.includes("grade") || s.includes("neuf") || s.includes("scellé")) return "bg-[#00FF41] text-black font-black";
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
  /** Plusieurs URLs d’images (la première est affichée, un badge indique le nombre) */
  images?: string[];
  rating?: number;
  tag?: string;
  badges?: string[];
  extraLine?: string;
  location?: string;
  createdAt?: string;
  publishedAt?: string;
  onDelete?: (() => void) | null;
  /** En PWA / Explorer : carte compacte (grille 2 colonnes) */
  compact?: boolean;
}

const PhoneCard = ({
  id,
  brand,
  model,
  condition,
  price,
  originalPrice,
  image,
  images,
  tag,
  badges = [],
  location,
  createdAt,
  publishedAt,
  compact = false,
}: PhoneCardProps) => {
  const publishedDate = publishedAt || createdAt;
  const mainImage = image || images?.[0];
  const imageCount = images?.length ?? (image ? 1 : 0);
  const navigate = useNavigate();
  const isPWA = usePWA();
  const { addToCart } = useCart();

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    addToCart({ id, brand, model, price, image: mainImage });
    toast.success("Ajouté au panier", {
      description: brand && model ? `${brand} ${model}` : "Article ajouté.",
      action: {
        label: "Voir le panier",
        onClick: () => navigate("/panier"),
      },
    });
  };

  return (
    <Card
      onClick={() => { if (id) navigate(`/deal/${id}`); }}
      className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col hover:shadow-lg rounded-2xl",
        compact && "rounded-xl",
        isPWA
          ? "phone-card"
          : "border-slate-200/60 dark:border-white/5 hover:border-blue-500/30 bg-white dark:bg-zinc-950"
      )}
    >
      <div className={cn("relative overflow-hidden bg-slate-50 dark:bg-zinc-900/50", compact ? "aspect-[4/3] max-h-[100px]" : "aspect-[4/3]")}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={model}
            className={cn("h-full w-full object-contain transition-transform duration-500 group-hover:scale-105", compact ? "p-1.5" : "p-4")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Smartphone className={cn("text-slate-200", compact ? "w-8 h-8" : "w-12 h-12")} />
          </div>
        )}
        {imageCount > 1 && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
            {imageCount} photos
          </span>
        )}
        {tag && (
          <Badge className={cn("absolute top-2 left-2 z-10 font-bold border-none shadow-sm", compact ? "text-[9px] px-1.5 py-0" : "top-3 left-3", tagClasses(tag))}>
            {tag}
          </Badge>
        )}
      </div>

      <CardHeader className={compact ? "p-2 pb-0" : "p-4 pb-2"}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className={cn("font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1", compact ? "text-[9px]" : "text-xs")}>
              {brand}
            </p>
            <h3 className={cn("font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors", compact ? "text-xs" : "")}>
              {model}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("flex-1", compact ? "p-2 pt-0 min-h-0" : "p-4 pt-0")}>
        <div className={cn("flex flex-wrap gap-1.5", compact ? "mb-1" : "mb-3")}>
          {badges.map((badge, idx) => (
            <Badge key={idx} variant="secondary" className={cn("border-none font-medium", compact ? "text-[8px] px-1.5 py-0 hidden" : "text-[10px] px-2 py-0", badgeClasses(badge))}>
              {badge}
            </Badge>
          ))}
          {condition && (
            <Badge variant="outline" className={cn("border-slate-200 text-slate-600 font-medium", compact ? "text-[8px] px-1.5 py-0" : "text-[10px] px-2 py-0")}>
              {condition}
            </Badge>
          )}
        </div>
        {(publishedDate || location) && !compact && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              Valable 72h
            </span>
            {publishedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Publié le {new Date(publishedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        "pt-0 mt-auto",
        compact ? "p-2" : "p-4 pt-0",
        !isPWA && "border-t border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-transparent"
      )}>
        <div className={cn("flex items-center justify-between w-full", compact ? "pt-1" : "pt-3")}>
          <div className="flex flex-col">
            <span className={cn(
              "font-black tracking-tighter",
              compact ? "text-base" : "text-2xl",
              isPWA ? "text-[#00FF41]" : "text-slate-900 dark:text-white"
            )}>
              {price.toLocaleString()} <span className={cn("text-slate-400 font-bold", compact ? "text-[8px]" : "text-[10px]")}>FCFA</span>
            </span>
            {originalPrice && (
              <span className={cn("text-slate-400 line-through opacity-70", compact ? "text-[9px]" : "text-xs")}>
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleCartClick}
            className={cn(
              "rounded-xl shadow-lg shrink-0",
              compact ? "w-8 h-8" : "w-10 h-10",
              isPWA ? "bg-[#064e3b] hover:bg-[#065f46] text-white" : "bg-[#064e3b] hover:bg-[#065f46] text-white dark:bg-[#059669] dark:hover:bg-[#10b981]"
            )}
          >
            <ShoppingCart className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhoneCard;
