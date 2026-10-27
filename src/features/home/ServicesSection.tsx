import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, ArrowRight } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";
import repairImg from "@/assets/illustrations/homepage/repair_image_phone.jpeg";

const servicePaths: Record<string, string> = {
  "maintenance": "/maintenance",
};

const services = [
  {
    id: "maintenance",
    title: "Maintenance IT",
    shortDesc: "Réparation, dépannage logiciel et remise en service de vos appareils.",
    longDesc: "Confiez vos smartphones, tablettes, ordinateurs et autres appareils à nos techniciens. Nous assurons le diagnostic, la réparation matérielle, le déblocage, la réinstallation de firmware et la remise en état, avec un devis clair avant intervention.",
    icon: Wrench,
    emoji: "🔧",
    color: "bg-zinc-900",
    borderColor: "border-[#00FF41]/20 dark:border-zinc-800",
    features: [
      "Écrans, batteries et connecteurs",
      "Déblocage et réparation logicielle",
      "Firmware, mises à jour et réinstallation système"
    ]
  }
];

export const servicesForAPropos = services;

const ServicesSection = () => {
  const isPWA = usePWA();
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-14">
          <h2 className={`${isPWA ? "text-3xl md:text-5xl font-black text-[#0a0a0a] dark:text-white mb-4 tracking-tighter" : "font-display text-4xl md:text-5xl font-semibold text-[hsl(var(--tekh-navy))] mb-4 tracking-tight"}`}>
            {isPWA ? "Maintenance IT" : "Réparer. Débloquer. Remettre en service."}
          </h2>
          <p className={`${isPWA ? "text-[#404040] dark:text-zinc-400 font-bold max-w-2xl mx-auto" : "text-[hsl(var(--tekh-navy))]/60 font-medium max-w-2xl mx-auto"}`}>
            {isPWA
              ? "Une prise en charge technique fiable pour vos appareils."
              : "Une maintenance complète pour les appareils qui doivent retrouver leur pleine capacité."}
          </p>
        </div>

        {isPWA ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(servicePaths[s.id] || "/a-propos#services")}
                className="bg-white dark:bg-zinc-900/40 p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border-2 border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center text-center active:scale-[0.98] hover:shadow-md transition-all min-h-0 min-w-0"
              >
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 shrink-0">{s.emoji}</span>
                <div className="w-full h-32 sm:h-40 mb-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10">
                  <img src={repairImg} alt="Technicien réparant un appareil" className="w-full h-full object-cover" />
                </div>
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
                className="group relative overflow-hidden rounded-[2rem] border border-[hsl(var(--tekh-navy))]/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center shadow-[0_18px_50px_-30px_hsl(var(--tekh-navy)/0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_60px_-28px_hsl(var(--tekh-navy)/0.45)]"
              >
                <div className="relative w-full md:w-72 h-52 md:h-64 shrink-0 overflow-hidden rounded-[1.5rem] border border-[hsl(var(--tekh-navy))]/10 dark:border-white/10">
                  <img src={repairImg} alt="Technicien réparant un appareil" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-2xl font-semibold text-[hsl(var(--tekh-navy))] dark:text-zinc-50 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[hsl(var(--tekh-navy))]/70 dark:text-zinc-200 font-medium leading-relaxed text-base">
                    {s.shortDesc}
                  </p>
                  <p className="text-[hsl(var(--tekh-navy))]/55 dark:text-zinc-300 font-medium text-sm leading-relaxed max-w-3xl">
                    {s.longDesc}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.features.map((feat) => (
                      <span key={feat} className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--tekh-green))] border border-[hsl(var(--tekh-green))]/25">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => navigate(servicePaths[s.id] || "/a-propos#services")}
                    className="w-full md:w-auto group inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--tekh-green))] text-white hover:bg-[hsl(142_76%_30%)] px-6 py-3.5 font-semibold text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5"
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
