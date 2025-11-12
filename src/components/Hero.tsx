import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/image.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const scrollToSimulator = () => {
    document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-subtle relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30 animate-pulse-glow"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Change ton téléphone, pas ton budget
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Échangez votre smartphone cassé contre un modèle reconditionné ou neuf. 
              Estimation instantanée, transaction sécurisée, et récupération à domicile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={scrollToSimulator} variant="hero" size="xl" className="group shadow-glow hover:shadow-glow-accent">
                Estimer mon téléphone
                <ArrowRight className="group-hover:translate-x-1 transition-spring" />
              </Button>
              <Button onClick={() => navigate('/deals')} variant="outline" size="xl" className="border-border/50 hover:border-primary/50">
                Voir les deals
              </Button>
            </div>
          </div>

          <div className="relative perspective-1000 group">
            {/* Effet de glow derrière l'image */}
            <div className="absolute inset-0 bg-gradient-hero opacity-30 blur-3xl rounded-full animate-pulse-glow"></div>
            <div className="absolute -inset-4 bg-gradient-accent opacity-20 blur-2xl rounded-full"></div>
            
            {/* Image avec effet 3D */}
            <div className="relative transform-3d group-hover:scale-[1.02] transition-spring">
              <img
                src={heroImage}
                alt="Échange de téléphones"
                className="relative rounded-2xl shadow-card-hover w-full max-w-md md:max-w-lg h-auto mx-auto border border-border/50 group-hover:shadow-glow transition-shadow duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
