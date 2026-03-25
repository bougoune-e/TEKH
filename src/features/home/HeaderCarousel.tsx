import React from "react";
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

export const HeaderCarousel = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-dvh bg-[#0a1628] flex items-center overflow-hidden">
      {/* Gradient ambiance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b]/25 via-[#0a1628] to-[#0a1628]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Green accent glow top-left */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#064e3b]/20 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-dvh py-28 lg:py-0">

          {/* ─── LEFT : content ─── */}
          <div className="space-y-8 max-w-xl">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#00FF41]">
                Togo · Lomé · L'échange intelligent
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter">
              Change ton<br />
              téléphone,<br />
              <span className="italic" style={{ color: "#00FF41" }}>pas ton budget.</span>
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-zinc-400 font-semibold leading-relaxed">
              Échangez votre smartphone cassé contre un modèle reconditionné
              certifié. Estimation instantanée, transaction sécurisée,
              récupération à domicile.
            </p>

            {/* CTAs */}
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

          {/* ─── RIGHT : image stack ─── */}
          <div className="relative h-[380px] md:h-[480px] lg:h-[600px] hidden md:block">
            {IMAGES.map((src, i) => (
              <div
                key={src}
                className="absolute rounded-[28px] overflow-hidden border border-white/10 shadow-2xl"
                style={{
                  width: "62%",
                  aspectRatio: "3 / 4",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${(i - 1) * 7}deg) translateX(${(i - 1) * 56}px) translateY(${i === 1 ? -16 : 8}px)`,
                  zIndex: i === 1 ? 3 : i === 2 ? 2 : 1,
                  transition: "transform 0.4s ease",
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ opacity: i === 1 ? 0.95 : 0.65 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            ))}

            {/* TEKH+ label on front card */}
            <div
              className="absolute z-10 bottom-[12%] left-[20%] px-4 py-2 rounded-full bg-[#00FF41] text-black text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              TΞKΗ+ Certified
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
        <div className="w-px h-10 bg-white hero-scroll-line" />
        <span className="text-[9px] text-white uppercase tracking-[0.2em] font-black">Scroll</span>
      </div>

      <style>{`
        .hero-scroll-line {
          animation: heroScroll 2s ease-in-out infinite;
          transform-origin: top;
        }
        @keyframes heroScroll {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </section>
  );
};
