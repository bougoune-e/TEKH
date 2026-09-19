import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Wrench, ArrowRight } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";

const servicePaths: Record<string, string> = {
  "trade-in": "/simulateur",
  "maintenance": "/maintenance",
};

const services = [
  {
    id: "trade-in",
    title: "Trade-In & Standard Dealbox",
    shortDesc: "Évaluation intelligente et revalorisation certifiée.",
    longDesc: "Déterminez instantanément la Valeur Résiduelle Technique (VRT) de votre smartphone grâce à notre algorithme d'estimation en temps réel. Profitez d'un processus de rachat ou d'échange sécurisé, transparent et basé sur un audit rigoureux de 50 points de contrôle. Recevez votre paiement immédiatement par Mobile Money.",
    icon: RefreshCcw,
    emoji: "📱",
    color: "bg-[#064e3b]",
    borderColor: "border-[#064e3b]/20 dark:border-zinc-800",
    features: [
      "Estimation VRT en temps réel",
      "Label Dealbox : 50 points d'audit",
      "Paiement Wave / MoMo instantané"
    ]
  },
  {
    id: "maintenance",
    title: "Suite Maintenance IT (TEKH OS)",
    shortDesc: "Le système d'exploitation des professionnels de la réparation.",
    longDesc: "Professionnalisez votre atelier et connectez votre activité à un écosystème industriel. Pilotez vos réparations, suivez vos clients par SMS automatiques, réalisez des diagnostics assistés par Vision (Edge AI) et accédez à notre catalogue de pièces détachées d'origine certifiée.",
    icon: Wrench,
    emoji: "🔧",
    color: "bg-zinc-900",
    borderColor: "border-[#00FF41]/20 dark:border-zinc-800",
    features: [
      "Diagnostic assisté par Vision (Edge AI)",
      "Gestion d'atelier & alertes SMS clients",
      "Catalogue de pièces d'origine certifiée"
    ]
  }
];

export const servicesForAPropos = services;

const ServicesSection = () => {
  const isPWA = usePWA();
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-14">
          <h2 className={`${isPWA ? "text-3xl md:text-5xl font-black text-[#0a0a0a] dark:text-white mb-4 tracking-tighter" : "font-display text-4xl md:text-5xl font-semibold text-[hsl(var(--tekh-navy))] mb-4 tracking-tight"}`}>
            {isPWA ? "Nos Services" : "Au-delà du SWAP"}
          </h2>
          <p className={`${isPWA ? "text-[#404040] dark:text-zinc-400 font-bold max-w-2xl mx-auto" : "text-[hsl(var(--tekh-navy))]/60 font-medium max-w-2xl mx-auto"}`}>
            {isPWA
              ? "Des solutions technologiques professionnelles pour le cycle de vie de vos appareils."
              : "Le trade-in pour chacun. La suite atelier pour les professionnels de la réparation."}
          </p>
        </div>

        {isPWA ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(servicePaths[s.id] || "/a-propos#services")}
                className="bg-white dark:bg-zinc-900/40 p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border-2 border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center text-center active:scale-[0.98] hover:shadow-md transition-all min-h-0 min-w-0"
              >
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 shrink-0">{s.emoji}</span>
                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 shrink-0 ${s.color}`}>
                  <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight sm:tracking-wider leading-tight px-0.5">
                  {s.title}
                </span>
                <p className="text-[10px] sm:text-xs font-medium text-[#404040] dark:text-zinc-400 mt-1.5 leading-snug line-clamp-2">
                  {s.shortDesc}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {services.map((s) => (
              <div
                key={s.id}
                className="group relative border border-[hsl(var(--tekh-navy))]/10 bg-white p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-16 h-16 flex items-center justify-center bg-[hsl(var(--tekh-navy))] text-white">
                    <s.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-2xl font-semibold text-[hsl(var(--tekh-navy))] tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[hsl(var(--tekh-navy))]/70 font-medium leading-relaxed text-base">
                    {s.shortDesc}
                  </p>
                  <p className="text-[hsl(var(--tekh-navy))]/55 font-medium text-sm leading-relaxed max-w-3xl">
                    {s.longDesc}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.features.map((feat) => (
                      <span key={feat} className="inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--tekh-green))] border border-[hsl(var(--tekh-green))]/25">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => navigate(servicePaths[s.id] || "/a-propos#services")}
                    className="w-full md:w-auto group inline-flex items-center justify-center gap-2 bg-[hsl(var(--tekh-green))] text-white hover:bg-[hsl(142_76%_30%)] px-6 py-3.5 font-semibold text-xs uppercase tracking-widest transition-all"
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
