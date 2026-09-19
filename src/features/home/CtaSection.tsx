import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(var(--tekh-navy))] overflow-hidden web-grain">
      <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[hsl(var(--tekh-green))]/25 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(142_55%_62%)] mb-6">
            Commencer
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-white tracking-tight leading-[1.05] mb-6">
            Ton prochain téléphone
            <span className="block italic font-medium text-[hsl(142_55%_62%)]">t’attend déjà.</span>
          </h2>
          <p className="text-white/65 font-medium text-base md:text-lg max-w-xl mb-10 leading-relaxed">
            Estimation en moins de 2 minutes. SWAP certifié. Dépôt en Dealbox. Récupération suivie.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate("/simulateur")}
              className="group inline-flex items-center justify-center gap-2 bg-[hsl(var(--tekh-green))] text-white px-8 py-4 font-semibold text-sm tracking-wide hover:bg-[hsl(142_76%_30%)] transition-all"
            >
              Estimer mon téléphone
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/deals")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-sm text-white/80 border border-white/20 hover:border-white/50 hover:text-white transition-all"
            >
              Explorer les deals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
