import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Wrench, GraduationCap, Code, ArrowRight } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";

const servicePaths: Record<string, string> = {
  "trade-in": "/simulateur",
  "maintenance": "/maintenance",
  "formation": "/formation",
  "dev": "/dev-web",
};

const services = [
  {
    id: "trade-in",
    title: "Trade-In & Échange",
    shortDesc: "Échangez votre ancien appareil contre un reconditionné ou neuf.",
    longDesc: "Mettez à niveau vos appareils avec notre système d'évaluation intelligente. Estimation instantanée, valeur équitable et récupération à domicile.",
    icon: RefreshCcw,
    emoji: "📱",
    color: "bg-[#064e3b]",
    borderColor: "border-[#0a1628]",
  },
  {
    id: "maintenance",
    title: "Maintenance IT",
    shortDesc: "Réparations et support technique certifié.",
    longDesc: "Réparations professionnelles et support technique certifié. Diagnostic, réparation smartphone/PC et garantie sur les interventions.",
    icon: Wrench,
    emoji: "🔧",
    color: "bg-[#0a1628]",
    borderColor: "border-[#064e3b]",
  },
  {
    id: "formation",
    title: "Formation Tech",
    shortDesc: "Coding, Excel, outils IA et compétences numériques.",
    longDesc: "Apprenez le coding, Excel, les outils IA et bien plus. Formations adaptées aux entrepreneurs et aux particuliers pour monter en compétence.",
    icon: GraduationCap,
    emoji: "🎓",
    color: "bg-[#064e3b]",
    borderColor: "border-[#0a1628]",
  },
  {
    id: "dev",
    title: "Développement Web & Mobile",
    shortDesc: "Sites, applis et solutions sur mesure.",
    longDesc: "Solutions sur mesure pour entreprises et entrepreneurs : sites web, applications mobiles et PWA pour développer votre présence digitale.",
    icon: Code,
    emoji: "💻",
    color: "bg-[#0a1628]",
    borderColor: "border-[#064e3b]",
  },
];

export const servicesForAPropos = services;

const ServicesSection = () => {
  const isPWA = usePWA();
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-[#f0f9f4] dark:bg-[#0a1628]/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0a0a] dark:text-white mb-4 tracking-tighter">
            Nos Services
          </h2>
          <p className="text-[#404040] dark:text-zinc-400 font-bold max-w-2xl mx-auto">
            Des solutions complètes pour tous vos besoins technologiques.
          </p>
        </div>

        {isPWA ? (
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(servicePaths[s.id] || "/a-propos#services")}
                className="bg-white dark:bg-zinc-900/40 p-6 rounded-[28px] border-2 border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center text-center active:scale-[0.98] hover:shadow-md transition-all"
              >
                <span className="text-4xl mb-3">{s.emoji}</span>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-black text-[#0a0a0a] dark:text-white uppercase tracking-widest">
                  {s.title}
                </span>
                <p className="text-[10px] font-bold text-[#404040] dark:text-zinc-400 mt-1 line-clamp-2">
                  {s.shortDesc}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <Link
                key={s.id}
                to={servicePaths[s.id] || "/a-propos#services"}
                className={`rounded-2xl border-2 ${s.borderColor} bg-white dark:bg-zinc-900 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group block text-left`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl" aria-hidden>{s.emoji}</span>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.color} text-white`}>
                    <s.icon className="w-7 h-7" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#0a0a0a] dark:text-white mb-3 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[#404040] dark:text-zinc-400 font-bold leading-relaxed text-sm mb-6">
                  {s.shortDesc}
                </p>
                <p className="text-[#404040] dark:text-zinc-500 font-semibold text-xs leading-relaxed mb-6">
                  {s.longDesc}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#064e3b] dark:text-[#059669] hover:underline">
                  En savoir plus
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}

        {!isPWA && (
          <div className="text-center mt-12">
            <Link
              to="/a-propos#services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#064e3b] dark:bg-[#00FF41] text-white dark:text-black font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Voir toutes les descriptions
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
