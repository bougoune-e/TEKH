import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Clock, Recycle } from "lucide-react";

const IMAGES = [
  "/header/header-1.png",
  "/header/header-2.png",
  "/header/header-3.png",
];

const trust = [
  { icon: Recycle, value: "SWAP", label: "Pas de vente sèche" },
  { icon: ShieldCheck, value: "Grade A", label: "Certifié Dealbox" },
  { icon: Clock, value: "< 2 min", label: "Estimation" },
];

const CARD_SLOTS = [
  {
    transform: "translate(-50%, -50%) rotate(-2deg) translateX(0px) translateY(-6px) scale(1.04)",
    zIndex: 3,
    opacity: 1,
  },
  {
    transform: "translate(-50%, -50%) rotate(7deg) translateX(56px) translateY(12px) scale(0.86)",
    zIndex: 2,
    opacity: 0.72,
  },
  {
    transform: "translate(-50%, -50%) rotate(-9deg) translateX(-50px) translateY(18px) scale(0.78)",
    zIndex: 1,
    opacity: 0.4,
  },
];

export const HeaderCarousel = () => {
  const navigate = useNavigate();
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setFront((f) => (f + 1) % 3), 4200);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden web-grain bg-[hsl(var(--tekh-navy))]">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--tekh-green) / 0.5) 1px, transparent 1px), linear-gradient(to right, hsl(var(--tekh-green) / 0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute -top-48 -left-32 w-[640px] h-[640px] rounded-full bg-[hsl(var(--tekh-green))]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-dvh py-24 lg:py-0">
          <div className="lg:col-span-6 space-y-8 max-w-2xl">
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              <span className="h-px w-8 bg-[hsl(var(--tekh-green))]" />
              Échange certifié · Afrique de l’Ouest
            </p>

            <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[4.35rem] font-semibold text-white leading-[1.02] tracking-tight">
              Change ton téléphone,
              <span className="block italic font-medium text-[hsl(142_55%_62%)]">
                pas ton budget.
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-lg font-medium">
              Apportez un smartphone — même cassé. TEKH+ calcule sa valeur, le reconditionne,
              et vous le transforme en un appareil certifié. Compensation en FCFA, retrait en Dealbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/simulateur")}
                className="group inline-flex items-center justify-center gap-2 bg-[hsl(var(--tekh-green))] text-white px-8 py-4 rounded-sm font-semibold text-sm tracking-wide transition-all hover:bg-[hsl(142_76%_30%)] active:scale-[0.98]"
              >
                Estimer mon téléphone
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/deals")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm font-medium text-sm text-white border border-white/25 hover:bg-white/5 hover:border-white/50 transition-all"
              >
                Voir les appareils certifiés
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {trust.map(({ icon: Icon, value, label }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[hsl(142_55%_62%)]">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold text-white">{value}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/45 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="lg:col-span-6 relative h-[280px] sm:h-[360px] md:h-[480px] lg:h-[580px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {IMAGES.map((src, i) => {
              const slot = (i - front + 3) % 3;
              const pos = CARD_SLOTS[slot];
              return (
                <button
                  type="button"
                  key={src}
                  onClick={() => setFront(i)}
                  className="absolute rounded-sm overflow-hidden border border-white/15 cursor-pointer p-0"
                  style={{
                    width: "58%",
                    aspectRatio: "3 / 4",
                    top: "50%",
                    left: "52%",
                    transform: pos.transform,
                    zIndex: pos.zIndex,
                    opacity: pos.opacity,
                    boxShadow: `0 ${18 + slot * 8}px ${36 + slot * 12}px rgba(0,0,0,${0.4 - slot * 0.1})`,
                    transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s ease",
                  }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover no-dim" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--tekh-navy))]/50 to-transparent" />
                </button>
              );
            })}

            <div className="absolute bottom-[12%] left-[18%] z-10 pointer-events-none">
              <span className="px-3 py-1.5 bg-white text-[hsl(var(--tekh-navy))] text-[10px] font-semibold uppercase tracking-[0.18em]">
                Certifié Dealbox
              </span>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFront(i)}
                  aria-label={`Visuel ${i + 1}`}
                  className="p-0 border-none transition-all duration-500"
                  style={{
                    width: front === i ? 22 : 7,
                    height: 7,
                    borderRadius: 0,
                    background: front === i ? "hsl(var(--tekh-green))" : "rgba(255,255,255,0.28)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
