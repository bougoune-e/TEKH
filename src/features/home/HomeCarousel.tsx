import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Smartphone, ShieldCheck } from 'lucide-react';
import { cn } from "@/core/api/utils";
import carousel1 from "@/assets/illustrations/homepage/smartphones.jpeg";
import carousel2 from "@/assets/illustrations/homepage/smartphone.jpeg";
import carousel3 from "@/assets/illustrations/homepage/iphone.jpeg";

type AdminAnnonce = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  price: number | null;
};

// Slides statiques de fallback
const STATIC_SLIDES = [
  {
    image: carousel1,
    badge: "Promotion",
    title: "Change ton téléphone,",
    highlight: "pas ton budget.",
    desc: "Échange ton ancien smartphone contre un modèle certifié Grade A.",
    cta: "Estimer mon téléphone",
    path: "/simulateur",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    image: carousel2,
    badge: "Nouveau",
    title: "Les derniers modèles",
    highlight: "sont arrivés.",
    desc: "iPhone 17, Galaxy S26, Samsung A56, Tecno Spark Slim... Profite des meilleurs deals.",
    cta: "Voir les offres",
    path: "/deals",
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    image: carousel3,
    badge: "Certifié",
    title: "Qualité Premium",
    highlight: "Garantie 06 mois.",
    desc: "Tous nos appareils sont testés sur 50 points de contrôle.",
    cta: "Découvrir TEKH+",
    path: "/a-propos",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
];

export const HomeCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [annonces, setAnnonces] = useState<AdminAnnonce[]>([]);
  const navigate = useNavigate();

  // Charger les annonces admin publiées avec image
  useEffect(() => {
    import("@/core/api/supabaseApi").then(({ supabase }) => {
      supabase
        .from("annonces")
        .select("id, title, description, images, price")
        .eq("status", "published")
        .eq("seller_name", "Admin")
        .not("images", "is", null)
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data?.length) setAnnonces(data.filter((a) => a.images?.length > 0));
        })
        .catch(() => { });
    });
  }, []);

  // Si des annonces admin existent → les afficher en priorité
  // Sinon → slides statiques
  const hasAnnonces = annonces.length > 0;
  const total = hasAnnonces ? annonces.length : STATIC_SLIDES.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);

  useEffect(() => {
    setCurrent(0);
  }, [hasAnnonces]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative w-full h-[480px] md:h-[580px] bg-black overflow-hidden">

      {/* ── AFFICHES ADMIN (mode poster plein écran) ── */}
      {hasAnnonces && annonces.map((a, i) => (
        <div
          key={a.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Image affiche plein cadre */}
          <img
            src={a.images![0]}
            alt={a.title}
            className="w-full h-full object-cover"
          />

          {/* Léger dégradé bas pour le texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badge "Annonce" en haut */}
          <div className="absolute top-5 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF41]/90 backdrop-blur-sm text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
              <Sparkles className="w-3 h-3" />
              Annonce TEKH+
            </span>
          </div>

          {/* Contenu bas */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 z-20 p-5 pb-16 transition-all duration-500",
              i === current ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight mb-1.5">
              {a.title}
            </h2>
            {a.description && (
              <p className="text-sm text-white/70 font-medium mb-3 line-clamp-2">{a.description}</p>
            )}
            <div className="flex items-center gap-3">
              {a.price ? (
                <span className="text-[#00FF41] font-black text-lg">
                  {a.price.toLocaleString()} FCFA
                </span>
              ) : null}
              <button
                onClick={() => navigate(`/deals/${a.id}`)}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Voir le deal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── SLIDES STATIQUES (mode texte + image background) ── */}
      {!hasAnnonces && STATIC_SLIDES.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-55 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-6 pb-20 transition-all duration-500",
              i === current ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            )}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF41]/20 border border-[#00FF41]/30 mb-3">
              <Sparkles className="w-3 h-3 text-[#00FF41]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">{slide.badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tighter">
              {slide.title}<br />
              <span className="text-[#00FF41] italic">{slide.highlight}</span>
            </h1>
            <p className="text-base text-zinc-300 font-medium mt-2 mb-4 max-w-sm leading-snug">{slide.desc}</p>
            <button
              onClick={() => navigate(slide.path)}
              className="group inline-flex items-center gap-2.5 bg-[#00FF41] text-black px-7 py-3.5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)]"
            >
              {slide.icon}
              {slide.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}

      {/* ── Indicateurs (dots) ── */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "bg-[#00FF41] w-6 h-1.5 shadow-[0_0_8px_#00FF41]"
                : "bg-white/30 w-1.5 h-1.5 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
};
