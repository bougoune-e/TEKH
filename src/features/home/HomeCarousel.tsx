import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Smartphone, ShieldCheck } from 'lucide-react';
import { cn } from "@/core/api/utils";
import carousel1 from "@/assets/illustrations/homepage/smartphones.jpeg";
import carousel2 from "@/assets/illustrations/homepage/smartphone.jpeg";
import carousel3 from "@/assets/illustrations/homepage/iphone.jpeg";

const slides = [
    {
        image: carousel1,
        badge: "Promotion",
        title: "Change ton téléphone,",
        highlight: "pas ton budget.",
        desc: "Échange ton ancien smartphone contre un modèle certifié Grade A.",
        cta: "Estimer mon téléphone",
        path: "/simulateur",
        icon: <Zap className="w-5 h-5" />
    },
    {
        image: carousel2,
        badge: "Nouveau",
        title: "Les derniers modèles",
        highlight: "sont arrivés.",
        desc: "iPhone 15, Galaxy S24... Profite des meilleurs deals du moment.",
        cta: "Voir les offres",
        path: "/deals",
        icon: <Smartphone className="w-5 h-5" />
    },
    {
        image: carousel3,
        badge: "Certifié",
        title: "Qualité Premium",
        highlight: "Garantie 12 mois.",
        desc: "Tous nos appareils sont testés sur 50 points de contrôle par nos experts.",
        cta: "Découvrir TEKH+",
        path: "/a-propos",
        icon: <ShieldCheck className="w-5 h-5" />
    }
];

export const HomeCarousel = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[500px] md:h-[600px] bg-black overflow-hidden group">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-6 md:p-16 pb-24 md:pb-32 container mx-auto">
                        <div className={cn(
                            "max-w-2xl space-y-4 transition-all duration-700 transform",
                            index === current ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        )}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF41]/20 border border-[#00FF41]/30 backdrop-blur-md">
                                <Sparkles className="w-3 h-3 text-[#00FF41]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">
                                    {slide.badge}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1] tracking-tighter">
                                {slide.title}<br />
                                <span className="text-[#00FF41] italic">{slide.highlight}</span>
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-300 font-semibold max-w-lg leading-snug">
                                {slide.desc}
                            </p>

                            <button
                                onClick={() => navigate(slide.path)}
                                className="group flex items-center gap-3 bg-[#00FF41] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)] mt-6"
                            >
                                {slide.icon}
                                {slide.cta}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 p-2 bg-black/20 backdrop-blur-md rounded-full">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            i === current ? "bg-[#00FF41] w-8 shadow-[0_0_10px_#00FF41]" : "bg-white/30"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};
