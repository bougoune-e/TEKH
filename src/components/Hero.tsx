import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroExchange from "../../assets/illustrations/homepage/smartphones.jpeg";
import swap2 from "../../assets/illustrations/homepage/swap_2.jpeg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6" style={{ animation: 'reveal 700ms ease-out both' }}>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Change ton téléphone, pas ton budget
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Échangez votre smartphone cassé contre un modèle reconditionné ou neuf. 
              Estimation instantanée, transaction sécurisée, et récupération à domicile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/simulateur')} variant="default" size="xl" className="group">
                Estimer mon téléphone
                <ArrowRight className="group-hover:translate-x-1 transition-spring" />
              </Button>
              <Button onClick={() => navigate('/deals')} variant="default" size="xl">
                Voir les deals
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 content-start">
              <div className="h-24 sm:h-28 rounded-xl overflow-hidden border border-border bg-card">
                <img src={heroExchange} alt="Échanger votre téléphone" className="w-full h-full object-cover" />
              </div>
              <div className="h-32 sm:h-36 rounded-xl overflow-hidden border border-border bg-card">
                <img src={swap2} alt="Échanges de téléphones" className="w-full h-full object-cover" />
              </div>
              <div className="h-20 sm:h-24 rounded-xl overflow-hidden border border-border bg-card">
                <img src={heroExchange} alt="Offres smartphones" className="w-full h-full object-cover" />
              </div>
              <div className="h-24 sm:h-28 rounded-xl overflow-hidden border border-border bg-card">
                <img src={swap2} alt="Sélection reconditionnée" className="w-full h-full object-cover" />
              </div>
              <div className="h-28 sm:h-32 rounded-xl overflow-hidden border border-border bg-card">
                <img src={heroExchange} alt="Meilleurs deals" className="w-full h-full object-cover" />
              </div>
              <div className="h-20 sm:h-24 rounded-xl overflow-hidden border border-border bg-card">
                <img src={swap2} alt="Smartphones 2025" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes reveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  );
};

export default Hero;
