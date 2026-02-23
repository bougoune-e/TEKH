import PhoneCard from "@/features/marketplace/PhoneCard";
import hpImg from "@/assets/illustrations/homepage/smartphones.jpeg";
import hpImg2 from "@/assets/illustrations/homepage/smartphone.jpeg";
import iphone from "@/assets/illustrations/homepage/iphone.jpeg";
import samsung from "@/assets/illustrations/homepage/samsungA35.jpeg";
import pixel from "@/assets/illustrations/homepage/google_pixel.jpeg";
import huawei from "@/assets/illustrations/homepage/huawei.jpeg";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Sparkles, BadgeCheck, Recycle, ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/core/api/utils";
import { useNavigate } from "react-router-dom";
import { usePWA } from "@/shared/hooks/usePWA";

const DealsSection = () => {
  const isPWA = usePWA();
  const deals = [
    { brand: "Apple", model: "iPhone 12", condition: "Très bon", price: 250000, originalPrice: 320000, image: iphone, tag: "Populaire" },
    { brand: "Samsung", model: "Galaxy A35", condition: "Bon", price: 180000, originalPrice: 220000, image: samsung, tag: "Vérifié" },
    { brand: "Google", model: "Pixel 6", condition: "Très bon", price: 210000, originalPrice: 260000, image: pixel, tag: "Nouveau" },
    { brand: "Huawei", model: "P40", condition: "Correct", price: 150000, originalPrice: 195000, image: huawei },
  ];
  const newPhones = [
    { brand: "Apple", model: "iPhone 14 (Neuf)", condition: "Neuf", price: 600000, originalPrice: 650000, image: iphone, tag: "Nouveau" },
  ];

  const navigate = useNavigate();
  return (
    <section id="deals" className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" aria-hidden="true" />

      <div className={cn("relative z-10", isPWA ? "container mx-auto px-4 sm:px-6" : "container mx-auto px-4")}>
        {/* WEB: bloc titre + visuels comme avant (ref a1803ad / 3d0e150) */}
        {!isPWA && (
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Nos meilleurs <span className="text-primary">deals</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Les meilleurs deals d’échange équitable entre smartphones: marque, modèle et état pris en compte, compensation ajustée, transaction sécurisée.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                2025
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-green-600 text-white border-none shadow-md">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Neuf
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Recycle className="h-4 w-4" aria-hidden="true" />
                Reconditionné
              </span>
            </div>
            <div className="mt-6 max-w-4xl mx-auto">
              <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2">
                <div className="snap-start shrink-0 w-64 h-40 bg-card border border-border/60 rounded-2xl shadow overflow-hidden">
                  <img src={hpImg} alt="Smartphones" className="w-full h-full object-cover" />
                </div>
                <div className="snap-start shrink-0 w-64 h-40 bg-card border border-border/60 rounded-2xl shadow overflow-hidden">
                  <img src={hpImg2} alt="Sélection" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-5">
                <div className="rounded-2xl border border-border/60 shadow overflow-hidden w-full h-48 flex items-center justify-center bg-card">
                  <img src={hpImg} alt="Smartphones" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="rounded-2xl border border-border/60 shadow overflow-hidden w-full h-48 flex items-center justify-center bg-card">
                  <img src={hpImg2} alt="Sélection" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isPWA && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Nos meilleurs deals
            </h2>
            <button
              onClick={() => navigate('/deals')}
              className="text-xs font-black text-[#00FF41] uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              VOIR TOUT
            </button>
          </div>
        )}

        <Tabs defaultValue="refurbished" className="w-full" aria-label="Catégories de deals">
          <div className={cn("flex items-center justify-between overflow-x-auto no-scrollbar pb-2", !isPWA && "mb-8")}>
            <TabsList className={cn(
              "bg-transparent h-auto p-0 flex gap-6 border-none",
              !isPWA && "bg-zinc-100 dark:bg-zinc-900 p-1 rounded-[16px] border-2 border-border w-auto"
            )}>
              <TabsTrigger
                value="refurbished"
                className={isPWA
                  ? "bg-transparent border-none p-0 text-xl md:text-2xl font-black text-foreground/30 data-[state=active]:text-foreground transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary"
                  : "rounded-[12px] px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black"
                }
              >
                Reconditionnés
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className={isPWA
                  ? "bg-transparent border-none p-0 text-xl md:text-2xl font-black text-foreground/30 data-[state=active]:text-foreground transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary"
                  : "rounded-[12px] px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black"
                }
              >
                Neufs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="refurbished" className="mt-0">
            {deals.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-card/40">
                Aucune offre disponible pour le moment.
              </div>
            ) : isPWA ? (
              <div className="flex overflow-x-auto no-scrollbar scroll-horizontal pb-4 -mx-4 px-4 gap-4">
                {deals.map((deal, index) => (
                  <div key={index} className="min-w-[280px] shrink-0 scroll-snap-center">
                    <PhoneCard {...deal} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="deals-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {deals.map((deal, index) => (
                  <PhoneCard key={index} {...deal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            {newPhones.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-card/40">
                Aucun téléphone neuf disponible.
              </div>
            ) : isPWA ? (
              <div className="flex overflow-x-auto no-scrollbar scroll-horizontal pb-4 -mx-4 px-4 gap-4">
                {newPhones.map((phone, index) => (
                  <div key={index} className="min-w-[280px] shrink-0 scroll-snap-center">
                    <PhoneCard {...phone} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="deals-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newPhones.map((phone, index) => (
                  <PhoneCard key={index} {...phone} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/deals')}
            variant={isPWA ? "default" : "cta"}
            size="lg"
            aria-label="Voir tous les deals disponibles"
            className={cn("gap-2", isPWA && "bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black rounded-full")}
          >
            Voir tous les deals
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
