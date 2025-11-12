import PhoneCard from "./PhoneCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import imageOne from "@/assets/image-1.png";

const DealsSection = () => {
  const deals: any[] = [];
  const newPhones: any[] = [];

  return (
    <section id="deals" className="py-16 md:py-24 relative">
      {/* Effet de fond subtil */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Nos meilleurs{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">deals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de smartphones reconditionnés et neufs à prix imbattables
          </p>
          <div className="mt-6 flex justify-center">
            <img
              src={imageOne}
              alt="Sélection de smartphones"
              className="rounded-2xl border border-border/50 shadow-card-hover w-full max-w-xl h-auto"
              loading="lazy"
            />
          </div>
        </div>

        <Tabs defaultValue="refurbished" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="refurbished">Reconditionnés</TabsTrigger>
            <TabsTrigger value="new">Neufs</TabsTrigger>
          </TabsList>

          <TabsContent value="refurbished">
            {deals.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-card/40">
                Aucune offre disponible pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newPhones.map((phone, index) => (
                  <PhoneCard key={index} {...phone} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Voir tous les deals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
