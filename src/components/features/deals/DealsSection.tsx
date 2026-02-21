import PhoneCard from "@/components/features/deals/PhoneCard";
import hpImg from "@/assets/illustrations/homepage/smartphones.jpeg";
import hpImg2 from "@/assets/illustrations/homepage/smartphone.jpeg";
import iphone from "@/assets/illustrations/homepage/iphone.jpeg";
import samsung from "@/assets/illustrations/homepage/samsungA35.jpeg";
import pixel from "@/assets/illustrations/homepage/google_pixel.jpeg";
import huawei from "@/assets/illustrations/homepage/huawei.jpeg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BadgeCheck, Recycle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DealsSection = () => {
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
      {/* Effet de fond subtil */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Nos meilleurs <span className="text-primary">deals</span>
          </h2>
          <p className="text-lg text-foreground max-w-3xl mx-auto">
            Les meilleurs deals d’échange équitable entre smartphones: marque/modèle/état pris en compte, compensation ajustée si besoin, et transaction sécurisée.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              2025
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-green-600 text-white border-none shadow-md">
              <BadgeCheck className="h-4 w-4 text-white" aria-hidden="true" />
              Neuf
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Recycle className="h-4 w-4" aria-hidden="true" />
              Reconditionné
            </span>
          </div>
          <div className="mt-6 max-w-4xl mx-auto">
            <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-4">
              <div className="snap-start shrink-0 w-64 h-40 bg-card border border-border/60 rounded-2xl shadow-card overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-muted/60" aria-hidden="true"></div>
                <img src={hpImg} alt="Smartphones récents" className="w-full h-full object-cover" />
              </div>
              <div className="snap-start shrink-0 w-64 h-40 bg-card border border-border/60 rounded-2xl shadow-card overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-muted/60" aria-hidden="true"></div>
                <img src={hpImg2} alt="Sélection 2025" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-5">
              <div className="group relative bg-card border border-border/60 rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden w-full h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-muted/60" aria-hidden="true"></div>
                <img src={hpImg} alt="Smartphones récents" className="relative max-w-full max-h-full object-contain" />
              </div>
              <div className="group relative bg-card border border-border/60 rounded-2xl shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden w-full h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-muted/60" aria-hidden="true"></div>
                <img src={hpImg2} alt="Sélection 2025" className="relative max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="refurbished" className="w-full flex flex-col items-center" aria-label="Catégories de deals">
          <TabsList className="flex w-auto mx-auto mb-8 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-[16px] border-2 border-black dark:border-white overflow-hidden h-auto">
            <TabsTrigger
              value="refurbished"
              className="rounded-[12px] px-8 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black transition-all duration-300 min-w-max"
            >
              Reconditionnés
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="rounded-[12px] px-8 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black transition-all duration-300 min-w-max"
            >
              Neufs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="refurbished">
            {deals.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-card/40">
                Aucune offre disponible pour le moment.
              </div>
            ) : (
              <div className="deals-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {deals.map((deal, index) => (
                  <PhoneCard key={index} {...deal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
            {newPhones.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-card/40">
                Aucun téléphone neuf disponible pour le moment.
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
          <Button onClick={() => navigate('/deals')} variant="cta" size="lg" aria-label="Voir tous les deals disponibles" className="gap-2">
            Voir tous les deals
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
