import React from 'react';
import { Smartphone, ShieldCheck, Zap, Clock } from 'lucide-react';

const stats = [
  { value: "500+", label: "Échanges réalisés", icon: Smartphone },
  { value: "4.8", label: "Note satisfaction", suffix: "/5", icon: ShieldCheck },
  { value: "< 2", label: "Minutes d'estimation", suffix: " min", icon: Zap },
  { value: "50", label: "Points de contrôle qualité", suffix: " pts", icon: Clock },
];

const WhyTekh = () => {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-black relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tighter">
            Pourquoi <span className="italic" style={{ color: '#00FF41' }}>TEKH+ ?</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto">
            Des chiffres qui parlent d'eux-mêmes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {stats.map(({ value, label, suffix, icon: Icon }) => (
            <div
              key={label}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-zinc-950 hover:border-[#00FF41]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#064e3b] dark:bg-[#00FF41]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white dark:text-[#00FF41]" />
              </div>
              <div className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter leading-none">
                {value}
                {suffix && <span className="text-2xl md:text-3xl text-[#064e3b] dark:text-[#00FF41]">{suffix}</span>}
              </div>
              <div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-tight">
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
