import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#064e3b]/25 blur-[120px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#00FF41]">
            Prêt à changer ?
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-6">
          Ton prochain téléphone<br />
          <span className="italic" style={{ color: "#00FF41" }}>t'attend déjà.</span>
        </h2>

        <p className="text-zinc-400 font-semibold text-base md:text-lg max-w-xl mx-auto mb-10">
          Estimation en moins de 2 minutes. Transaction sécurisée. Récupération à domicile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/simulateur")}
            className="group inline-flex items-center justify-center gap-3 bg-[#00FF41] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_32px_rgba(0,255,65,0.25)]"
          >
            <Zap className="w-4 h-4 shrink-0" />
            Estimer mon téléphone
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
          <button
            onClick={() => navigate("/deals")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white/70 border border-white/15 hover:border-white/35 hover:text-white transition-all"
          >
            Explorer les deals
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
