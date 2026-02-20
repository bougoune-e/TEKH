import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: text + mascot */}
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
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Estimation</p>
              <p className="text-lg font-black text-foreground">≤ 2 min</p>
            </div>
            <div
              className="absolute bottom-6 right-4 bg-white dark:bg-zinc-900 border border-border rounded-2xl px-4 py-3 shadow-lg text-left animate-float"
              style={{ animationDelay: '1.2s' }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Certifié</p>
              <p className="text-lg font-black text-foreground">Grade A</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes reveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes levitate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes ti-moveDot {
          0%   { left: -16px; opacity: 0; }
          30%  { opacity: 1; }
          100% { left: 84px; opacity: 0; }
        }
        @keyframes ti-fillUp {
          0%, 20%  { height: 0%; }
          80%, 100% { height: 100%; }
        }
        @keyframes ti-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,78,59,0.3); }
          50%       { box-shadow: 0 0 0 16px rgba(6,78,59,0); }
        }

        .animate-levitate { animation: levitate 4s ease-in-out infinite; }
        .animate-float    { animation: float 3.5s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .shadow-glow      { box-shadow: 0 0 25px rgba(6,78,59,0.2); }

        /* ─── Trade-in widget ─── */
        .trade-in-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
          padding: 60px 40px;
        }

        .ti-device {
          width: 88px;
          height: 158px;
          border: 3px solid currentColor;
          border-radius: 18px;
          position: relative;
          background: #ffffff;
        }
        .dark .ti-device { background: #18181b; }

        .ti-label {
          position: absolute;
          top: -26px;
          width: 100%;
          text-align: center;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.5px;
          color: currentColor;
          opacity: 0.5;
        }

        .ti-screen {
          margin: 8px;
          height: calc(100% - 16px);
          background: #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        .dark .ti-screen { background: #27272a; }

        /* Old phone: faded + scaled down */
        .ti-old {
          opacity: 0.45;
          transform: scale(0.87);
        }

        /* New phone: green border + pulse glow */
        .ti-new {
          border-color: #064e3b;
          color: #064e3b;
          animation: ti-pulse 2s ease-in-out infinite;
        }
        .dark .ti-new {
          border-color: #00FF41;
          color: #00FF41;
          animation: ti-pulse 2s ease-in-out infinite;
        }

        .ti-badge {
          position: absolute;
          bottom: -28px;
          width: 100%;
          text-align: center;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #064e3b;
        }
        .dark .ti-badge { color: #00FF41; }

        /* Arrow area */
        .ti-arrow {
          position: relative;
          width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        /* Animated travelling dot */
        .ti-dot {
          width: 9px;
          height: 9px;
          background: #064e3b;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          animation: ti-moveDot 2s infinite ease-in-out;
        }
        .dark .ti-dot { background: #00FF41; }

        /* Value fill animation inside new phone */
        .ti-value-fill {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(to top, #064e3b, #10b981);
          animation: ti-fillUp 2s infinite ease-in-out;
        }
        .dark .ti-value-fill {
          background: linear-gradient(to top, #00FF41, #10b981);
        }
      `}</style>
    </section>
  );
};

export default Hero;
