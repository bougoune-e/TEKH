import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Clock } from "lucide-react";

const IMAGES = [
  "/header/header-1.png",
  "/header/header-2.png",
  "/header/header-3.png",
];

const trust = [
  { icon: Zap, value: "< 2 min", label: "Estimation" },
  { icon: ShieldCheck, value: "Grade A", label: "Certifié" },
  { icon: Clock, value: "50 pts", label: "Contrôles" },
];

/**
 * Positions des 3 cartes selon leur slot.
 * slot 0 = front, slot 1 = droite-derrière, slot 2 = gauche-fond
 */
const CARD_SLOTS = [
  {
    transform: "translate(-50%, -50%) rotate(0deg) translateX(0px) translateY(-12px) scale(1.06)",
    zIndex: 3,
    opacity: 1,
  },
  {
    transform: "translate(-50%, -50%) rotate(9deg) translateX(62px) translateY(8px) scale(0.9)",
    zIndex: 2,
    opacity: 0.7,
  },
  {
    transform: "translate(-50%, -50%) rotate(-8deg) translateX(-54px) translateY(16px) scale(0.81)",
    zIndex: 1,
    opacity: 0.38,
  },
];

export const HeaderCarousel = () => {
  const navigate = useNavigate();
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setFront((f) => (f + 1) % 3), 3800);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="relative min-h-dvh bg-black flex items-center overflow-hidden">
      {/* Gradient ambiance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b]/25 via-black to-black" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#064e3b]/18 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#064e3b]/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-dvh py-28 lg:py-0">

          {/* ─── LEFT : content ─── */}
          <div className="space-y-8 max-w-xl">

            {/* Badge — sans mention géographique */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#00FF41]">
                Échange · Certifié · Sécurisé
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter">
              Change ton<br />
              téléphone,<br />
              <span className="italic" style={{ color: "#00FF41" }}>pas ton budget.</span>
            </h1>

            <p className="text-base md:text-lg text-zinc-400 font-semibold leading-relaxed">
              Échangez votre smartphone cassé contre un modèle reconditionné
              certifié. Estimation instantanée, transaction sécurisée,
              récupération à domicile.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/simulateur")}
                className="group inline-flex items-center justify-center gap-3 bg-[#00FF41] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_32px_rgba(0,255,65,0.22)]"
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

            {/* Trust row */}
            <div className="flex items-center gap-8 pt-2 border-t border-white/10">
              {trust.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#00FF41] shrink-0" />
                  <div>
                    <div className="text-sm font-black text-white leading-tight">{value}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT : deck de cartes animé ─── */}
          <div
            className="relative h-[380px] md:h-[500px] lg:h-[620px] hidden md:block"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {IMAGES.map((src, i) => {
              const slot = (i - front + 3) % 3;
              const pos = CARD_SLOTS[slot];
              return (
                <div
                  key={src}
                  onClick={() => setFront(i)}
                  className="absolute rounded-[28px] overflow-hidden border border-white/10 cursor-pointer"
                  style={{
                    width: "60%",
                    aspectRatio: "3 / 4",
                    top: "50%",
                    left: "50%",
                    transform: pos.transform,
                    zIndex: pos.zIndex,
                    opacity: pos.opacity,
                    boxShadow: `0 ${20 + slot * 10}px ${40 + slot * 14}px rgba(0,0,0,${0.35 - slot * 0.1})`,
                    transition: "transform 0.85s cubic-bezier(0.34, 1.1, 0.64, 1), opacity 0.85s ease, box-shadow 0.85s ease",
                  }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, rgba(0,0,0,${0.15 + slot * 0.12}), transparent 55%)` }}
                  />
                </div>
              );
            })}

            {/* TEKH+ Certified badge */}
            <div className="absolute bottom-[14%] left-[16%] z-10 pointer-events-none">
              <span className="px-4 py-2 rounded-full bg-[#00FF41] text-black text-[10px] font-black uppercase tracking-widest shadow-lg inline-block">
                TΞKΗ+ Certified
              </span>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFront(i)}
                  className="transition-all duration-500 p-0 border-none bg-transparent"
                  style={{
                    width: front === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: front === i ? "#00FF41" : "rgba(255,255,255,0.25)",
                    boxShadow: front === i ? "0 0 8px rgba(0,255,65,0.6)" : "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25 pointer-events-none">
        <div className="w-px h-10 bg-white hero-scroll-line" />
        <span className="text-[9px] text-white uppercase tracking-[0.2em] font-black">Scroll</span>
      </div>

      <style>{`
        .hero-scroll-line {
          animation: heroScroll 2s ease-in-out infinite;
        }
        @keyframes heroScroll {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </section>
  );
};
