import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Smartphone, ShieldCheck, Megaphone, Tag } from 'lucide-react';
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
    brand: string | null;
};

const staticSlides = [
    {
        image: carousel1,
        badge: "Promotion",
        title: "Change ton téléphone,",
        highlight: "pas ton budget.",
        desc: "Échange ton ancien smartphone contre un modèle certifié Grade A.",
        cta: "Estimer mon téléphone",
        path: "/simulateur",
        icon: <Zap className="w-5 h-5" />,
        isAdmin: false,
    },
    {
        image: carousel2,
        badge: "Nouveau",
        title: "Les derniers modèles",
        highlight: "sont arrivés.",
        desc: "iPhone 15, Galaxy S24... Profite des meilleurs deals du moment.",
        cta: "Voir les offres",
        path: "/deals",
        icon: <Smartphone className="w-5 h-5" />,
        isAdmin: false,
    },
    {
        image: carousel3,
        badge: "Certifié",
        title: "Qualité Premium",
        highlight: "Garantie 12 mois.",
        desc: "Tous nos appareils sont testés sur 50 points de contrôle par nos experts.",
        cta: "Découvrir TEKH+",
        path: "/a-propos",
        icon: <ShieldCheck className="w-5 h-5" />,
        isAdmin: false,
    }
];

export const HomeCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [adminAnnonces, setAdminAnnonces] = useState<AdminAnnonce[]>([]);
    const navigate = useNavigate();

    // Charger les annonces admin publiées
    useEffect(() => {
        import("@/core/api/supabaseApi").then(({ supabase }) => {
            supabase
                .from("deals")
                .select("id, title, description, images, price, brand")
                .eq("status", "published")
                .eq("seller_name", "Admin")
                .order("created_at", { ascending: false })
                .limit(5)
                .then(({ data }) => {
                    if (data?.length) setAdminAnnonces(data);
                })
                .catch(() => {});
        });
    }, []);

    // Construire les slides dynamiques (annonces admin en premier)
    const adminSlides = adminAnnonces.map((a) => ({
        image: a.images?.[0] || carousel1,
        badge: "Annonce TEKH+",
        title: a.title,
        highlight: a.price ? `${a.price.toLocaleString()} FCFA` : "",
        desc: a.description || a.title,
        cta: "Voir les deals",
        path: "/deals",
        icon: <Megaphone className="w-5 h-5" />,
        isAdmin: true,
    }));

    const slides = [...adminSlides, ...staticSlides];
    const total = slides.length;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, 6000);
        return () => clearInterval(timer);
    }, [total]);

    // Reset si index out of range après changement de slides
    useEffect(() => {
        if (current >= total) setCurrent(0);
    }, [total, current]);

    return (
        <div className="relative w-full h-[500px] md:h-[600px] bg-black overflow-hidden group">
            {/* Story indicators (stories-style) */}
            {adminAnnonces.length > 0 && (
                <div className="absolute top-4 left-0 right-0 z-30 flex items-center gap-1 px-4">
                    {slides.map((s, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-0.5 flex-1 rounded-full transition-all duration-300 cursor-pointer",
                                i === current
                                    ? "bg-white"
                                    : i < current
                                    ? "bg-white/60"
                                    : "bg-white/20"
                            )}
                            onClick={() => setCurrent(i)}
                        />
                    ))}
                </div>
            )}

            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover opacity-60 scale-105"
                        />
                        <div className={cn(
                            "absolute inset-0",
                            slide.isAdmin
                                ? "bg-gradient-to-t from-black via-black/50 to-black/20"
                                : "bg-gradient-to-t from-black via-black/40 to-transparent"
                        )} />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-6 md:p-16 pb-24 md:pb-32 container mx-auto">
                        <div className={cn(
                            "max-w-2xl space-y-4 transition-all duration-700 transform",
                            index === current ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        )}>
                            {/* Badge */}
                            <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md",
                                slide.isAdmin
                                    ? "bg-amber-500/20 border border-amber-400/40"
                                    : "bg-[#00FF41]/20 border border-[#00FF41]/30"
                            )}>
                                {slide.isAdmin
                                    ? <Tag className="w-3 h-3 text-amber-400" />
                                    : <Sparkles className="w-3 h-3 text-[#00FF41]" />
                                }
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    slide.isAdmin ? "text-amber-400" : "text-[#00FF41]"
                                )}>
                                    {slide.badge}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1] tracking-tighter">
                                {slide.title}
                                {slide.highlight && (
                                    <>
                                        <br />
                                        <span className={cn(
                                            "italic",
                                            slide.isAdmin ? "text-amber-400" : "text-[#00FF41]"
                                        )}>
                                            {slide.highlight}
                                        </span>
                                    </>
                                )}
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-300 font-semibold max-w-lg leading-snug line-clamp-2">
                                {slide.desc}
                            </p>

                            <button
                                onClick={() => navigate(slide.path)}
                                className={cn(
                                    "group flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all mt-6",
                                    slide.isAdmin
                                        ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                                        : "bg-[#00FF41] text-black shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                                )}
                            >
                                {slide.icon}
                                {slide.cta}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 p-2 bg-black/20 backdrop-blur-md rounded-full">
                {slides.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            i === current
                                ? s.isAdmin
                                    ? "bg-amber-400 w-8 shadow-[0_0_10px_#fbbf24]"
                                    : "bg-[#00FF41] w-8 shadow-[0_0_10px_#00FF41]"
                                : "bg-white/30"
                        )}
                    />
                ))}
            </div>

            {/* Indicateur admin actif */}
            {slides[current]?.isAdmin && (
                <div className="absolute top-10 right-4 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            )}
        </div>
    );
};
