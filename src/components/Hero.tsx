import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroExchange from "@/assets/illustrations/homepage/smartphones.jpeg";
import swap2 from "@/assets/illustrations/homepage/swap_2.jpeg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6" style={{ animation: 'reveal 700ms ease-out both' }}>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group perspective-1000">
                <div className="absolute -top-12 -right-12 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-white dark:bg-zinc-900 border-2 border-primary text-foreground px-4 py-2 rounded-2xl rounded-bl-none shadow-xl font-bold text-sm whitespace-nowrap animate-float">
                    {Math.random() > 0.5 ? "Besoin d'un diagnostic ?" : "Prêt pour un Swap ?"}
                  </div>
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-accent/20 shadow-glow animate-levitate bg-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 cursor-pointer">
                  <video
                    src={mascotVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-150"
                  />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-8xl font-black leading-[1] tracking-tighter text-black dark:text-white">
                <span className="block mb-2">Change ton</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-primary to-black dark:bg-none dark:text-white">téléphone,</span>
                <br />
                <span className="text-primary italic drop-shadow-sm font-black">pas ton budget.</span>
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Échangez votre smartphone cassé contre un modèle reconditionné ou neuf.
              Estimation instantanée, transaction sécurisée, et récupération à domicile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/simulateur')} variant="default" size="xl" className="group rounded-full px-8 shadow-xl">
                Estimer mon téléphone
                <ArrowRight className="group-hover:translate-x-1 transition-spring" />
              </Button>
              <Button onClick={() => navigate('/deals')} variant="outline" size="xl" className="rounded-full px-8 border-2">
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
      <style>{`
        @keyframes reveal { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes levitate { 
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-levitate { animation: levitate 4s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .shadow-glow { box-shadow: 0 0 25px rgba(6, 78, 59, 0.2); }
      `}</style>
    </section>
  );
};

export default Hero;
