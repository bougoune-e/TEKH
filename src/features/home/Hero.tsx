import React from "react";
import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePWA } from "@/shared/hooks/usePWA";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

const Hero = () => {
  const navigate = useNavigate();
  const isPWA = usePWA();
  const [bubble] = React.useState(() =>
    Math.random() > 0.5 ? "Besoin d'un diagnostic ?" : "Prêt pour un Swap ?"
  );
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background relative overflow-hidden min-h-[85dvh] flex flex-col justify-center">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: text + mascot */}
          <div className="space-y-6 animate-reveal">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group perspective-1000">
                <div className="absolute -top-12 -right-12 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-white dark:bg-zinc-900 border-2 border-primary text-foreground px-4 py-2 rounded-2xl rounded-bl-none shadow-xl font-bold text-sm whitespace-nowrap animate-float">
                    {bubble}
                  </div>
                </div>
                <div className="w-14 h-14 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-accent/20 shadow-glow animate-levitate bg-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 cursor-pointer">
                  <video
                    src={mascotVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-125"
                  />
                </div>
              </div>

              <h1 className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tighter text-black dark:text-white">
                <span className="block mb-1">Change ton</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-primary to-black dark:from-white dark:via-primary dark:to-white">téléphone,</span>
                <br />
                <span className="text-primary italic drop-shadow-sm font-black">pas ton budget.</span>
              </h1>
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0">
              Échangez votre smartphone cassé contre un modèle reconditionné ou neuf.
              Estimation instantanée, transaction sécurisée, et récupération à domicile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center md:items-start">
              <Button
                onClick={() => navigate('/simulateur')}
                className={isPWA
                  ? "group rounded-full px-6 py-5 shadow-[0_15px_30px_rgba(0,255,65,0.2)] bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black text-lg transition-all duration-300 active:scale-95"
                  : "group rounded-full px-6 py-4 font-bold text-base md:text-lg"
                }
              >
                Estimer mon téléphone
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate('/deals')} variant="outline" size="xl" className="rounded-full px-8 border-2 font-bold opacity-80 hover:opacity-100 bg-transparent text-foreground border-foreground/20">
                Voir les deals
              </Button>
            </div>
          </div>

          {/* RIGHT: Animated Trade-in Visualization */}
          <div className="relative flex items-center justify-center min-h-[320px]">
            <div className="trade-in-container">

              {/* Old Device */}
              <div className="ti-device ti-old">
                <span className="ti-label">ANCIEN</span>
                <div className="ti-screen"></div>
              </div>

              {/* Transfer Arrow with animated dot */}
              <div className="ti-arrow">
                <div className="ti-dot"></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* New Device */}
              <div className="ti-device ti-new">
                <span className="ti-label">NOUVEAU</span>
                <div className="ti-screen">
                  <div className="ti-value-fill"></div>
                </div>
                <div className="ti-badge">TEKH+</div>
              </div>
            </div>

            {/* Floating stat badges */}
            <div
              className="absolute top-6 left-4 bg-white dark:bg-zinc-900 border border-border rounded-2xl px-4 py-3 shadow-lg text-left animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimation</p>
              <p className="text-lg font-black text-foreground">≤ 2 min</p>
            </div>
            <div
              className="absolute bottom-6 right-4 bg-white dark:bg-zinc-900 border border-border rounded-2xl px-4 py-3 shadow-lg text-left animate-float"
              style={{ animationDelay: '1.2s' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certifié</p>
              <p className="text-lg font-black text-foreground">Grade A</p>
            </div>
          </div>

        </div>
      </div>


    </section>
  );
};

export default Hero;
