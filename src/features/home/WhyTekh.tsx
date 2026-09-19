import React from 'react';
import { Smartphone, ShieldCheck, Zap, Clock } from 'lucide-react';

const stats = [
  { value: "500+", label: "Échanges réalisés", icon: Smartphone },
  { value: "4.8", label: "Note satisfaction", suffix: "/5", icon: ShieldCheck },
  { value: "< 2", label: "Minutes d'estimation", suffix: " min", icon: Zap },
  { value: "50", label: "Points de contrôle", suffix: " pts", icon: Clock },
];

const WhyTekh = () => {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--tekh-navy)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--tekh-navy)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--tekh-green))] mb-3">
            Preuves
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[hsl(var(--tekh-navy))] tracking-tight">
            Pourquoi les gens SWAP chez TEKH+
          </h2>
          <p className="mt-4 text-[hsl(var(--tekh-navy))]/60 font-medium max-w-lg leading-relaxed">
            Moins cher que le neuf, plus sûr qu’une petite annonce, plus utile qu’un tiroir oublié.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map(({ value, label, suffix, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col p-6 md:p-8 border border-[hsl(var(--tekh-navy))]/10 bg-[hsl(142_30%_97%)]"
            >
              <Icon className="w-5 h-5 text-[hsl(var(--tekh-green))] mb-6" strokeWidth={1.5} />
              <div className="font-display text-4xl md:text-5xl font-semibold text-[hsl(var(--tekh-navy))] tracking-tight leading-none">
                {value}
                {suffix && <span className="text-2xl text-[hsl(var(--tekh-green))]">{suffix}</span>}
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--tekh-navy))]/45 leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTekh;
