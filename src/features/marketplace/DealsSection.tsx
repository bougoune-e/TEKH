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
    { brand: "Apple", model: "iPhone 13", condition: "Très bon", price: 320000, originalPrice: 380000, image: iphone, tag: "Populaire" },
    { brand: "Samsung", model: "Galaxy A54", condition: "Neuf reconditionné", price: 220000, originalPrice: 280000, image: samsung, tag: "Vérifié" },
  ];
  const newPhones = [
    { brand: "Apple", model: "iPhone 14 (Neuf)", condition: "Neuf", price: 600000, originalPrice: 650000, image: iphone, tag: "Nouveau" },
    { brand: "Samsung", model: "Galaxy S24 (Neuf)", condition: "Neuf", price: 450000, originalPrice: 500000, image: samsung, tag: "Nouveau" },
    { brand: "Google", model: "Pixel 8 (Neuf)", condition: "Neuf", price: 380000, originalPrice: 420000, image: pixel, tag: "Nouveau" },
  ];

  const navigate = useNavigate();
  return (
    <section id="deals" className="py-16 md:py-24 relative">
      {/* Effet de fond subtil */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        {!isPWA && (
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                Les meilleurs <span className="text-blue-600">Deals</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                Découvrez notre sélection de smartphones reconditionnés et neufs au meilleur prix, certifiés par TEKH+.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <img src={hpImg} alt="Smartphones" className="rounded-2xl shadow-lg border border-slate-100" />
              <img src={hpImg2} alt="Smartphone" className="rounded-2xl shadow-lg mt-8 border border-slate-100" />
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
          <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar pb-2">
            <TabsList className={`bg-transparent h-auto p-0 flex gap-6 border-none ${!isPWA ? 'border-b border-border w-full' : ''}`}>
              <TabsTrigger
                value="refurbished"
                className={isPWA
                  ? "bg-transparent border-none p-0 text-xl md:text-2xl font-black text-foreground/30 data-[state=active]:text-foreground data-[state=active]:bg-transparent transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary after:transition-all"
                  : "bg-transparent border-none px-0 py-2 text-lg font-bold text-slate-400 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent transition-all relative data-[state=active]:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600"
                }
              >
                Reconditionnés
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className={isPWA
                  ? "bg-transparent border-none p-0 text-xl md:text-2xl font-black text-foreground/30 data-[state=active]:text-foreground data-[state=active]:bg-transparent transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 data-[state=active]:after:w-full after:h-[3px] after:bg-primary after:transition-all"
                  : "bg-transparent border-none px-0 py-2 text-lg font-bold text-slate-400 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent transition-all relative data-[state=active]:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600"
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
            ) : (
              <div className={cn(
                "gap-4",
                isPWA
                  ? "grid grid-cols-2 gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              )}>
                {deals.map((deal, index) => (
                  <div key={index}>
                    <PhoneCard {...deal} compact={isPWA} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className={cn(
              "gap-4",
              isPWA
                ? "grid grid-cols-2 gap-4"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            )}>
              {newPhones.map((phone, index) => (
                <div key={index}>
                  <PhoneCard {...phone} compact={isPWA} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/deals')}
            variant={isPWA ? "default" : "cta"}
            size="lg"
            aria-label="Voir tous les deals disponibles"
            className={`gap-2 ${isPWA ? 'bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black rounded-full' : ''}`}
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
