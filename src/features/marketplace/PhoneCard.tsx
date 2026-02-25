import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Smartphone, MapPin, ShoppingCart, Calendar, Clock } from "lucide-react";
import { cn } from "@/core/api/utils";

/** Format date de publication en relatif : "2 j", "20 jours", "1 mois", "1 an" */
function formatPublishedAgo(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 1) return "Aujourd'hui";
  if (diffDays === 1) return "1 jour";
  if (diffDays < 7) return `${diffDays} jours`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
  return `${Math.floor(diffDays / 365)} an`;
}
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
        "group overflow-hidden transition-all duration-200 cursor-pointer h-full flex flex-col hover:shadow-md",
        compact ? "rounded-[18px] border border-border/40 dark:border-white/[0.06] bg-card dark:bg-zinc-900/80" : "rounded-2xl border-slate-200/60 dark:border-white/5 bg-white dark:bg-zinc-950 hover:border-primary/20"
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted/30 dark:bg-zinc-800/50", compact ? "aspect-[4/3] max-h-[92px]" : "aspect-[4/3]")}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={model}
            className={cn("h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]", compact ? "p-1" : "p-4")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Smartphone className={cn("text-muted-foreground/50", compact ? "w-7 h-7" : "w-12 h-12")} />
          </div>
        )}
        {/* Date de publication — style CoinAfrique (badge en bas à gauche sur l'image) */}
        {compact && publishedDate && (
          <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-medium">
            <Clock className="h-2.5 w-2.5" />
            {formatPublishedAgo(publishedDate)}
          </span>
        )}
        {imageCount > 1 && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[9px] font-medium">
            {imageCount}
          </span>
        )}
        {tag && (
          <Badge className={cn("absolute top-1.5 left-1.5 z-10 font-medium border-none shadow-sm", compact ? "text-[8px] px-1.5 py-0" : "top-3 left-3 text-[9px]", tagClasses(tag))}>
            {tag}
          </Badge>
        )}
      </div>

      <CardHeader className={compact ? "px-2.5 pt-1.5 pb-0" : "p-4 pb-2"}>
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0 flex-1">
            <p className={cn("text-[9px] font-medium text-muted-foreground uppercase tracking-wide truncate", compact ? "mb-0.5" : "mb-1 text-xs")}>
              {brand}
            </p>
            <h3 className={cn(
              "text-foreground leading-tight group-hover:text-foreground/90 transition-colors",
              compact ? "text-[10px] font-medium leading-snug line-clamp-2" : "text-sm font-semibold line-clamp-1"
            )}>
              {model}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("flex-1 min-h-0", compact ? "px-2.5 py-0" : "p-4 pt-0")}>
        <div className={cn("flex flex-wrap gap-1", compact ? "mb-0" : "mb-3 gap-1.5")}>
          {badges.map((badge, idx) => (
            <Badge key={idx} variant="secondary" className={cn("border-none font-medium", compact ? "hidden" : "text-[10px] px-2 py-0", badgeClasses(badge))}>
              {badge}
            </Badge>
          ))}
          {condition && (
            <Badge variant="outline" className={cn("border-border/60 text-muted-foreground font-medium", compact ? "text-[8px] px-1.5 py-0 h-4" : "text-[10px] px-2 py-0", "dark:border-white/10")}>
              {condition}
            </Badge>
          )}
        </div>
        {(publishedDate || location) && !compact && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">Valable 72h</span>
            {publishedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Publié le {new Date(publishedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        "mt-auto border-t border-border/30 dark:border-white/[0.06]",
        compact ? "px-2.5 py-1.5 pt-1" : "p-4 pt-0",
        !compact && "bg-muted/20 dark:bg-transparent"
      )}>
        <div className={cn("flex items-center justify-between w-full", compact ? "gap-1" : "pt-3 gap-2")}>
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "font-bold tracking-tight text-primary dark:text-[#059669]",
              compact ? "text-[13px]" : "text-xl"
            )}>
              {price.toLocaleString()} <span className={cn("text-muted-foreground font-medium", compact ? "text-[9px]" : "text-[10px]")}>FCFA</span>
            </span>
            {originalPrice && (
              <span className={cn("text-muted-foreground line-through opacity-80", compact ? "text-[8px]" : "text-xs")}>
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleCartClick}
            className={cn(
              "shrink-0 rounded-xl",
              compact ? "w-7 h-7" : "w-10 h-10",
              "bg-[#064e3b] hover:bg-[#065f46] dark:bg-[#059669] dark:hover:bg-[#10b981] text-white border-0 shadow-sm"
            )}
          >
            <ShoppingCart className={compact ? "w-3.5 h-3.5" : "w-5 h-5"} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhoneCard;
