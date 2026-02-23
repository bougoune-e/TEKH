import React from 'react';
import { RefreshCcw, Wrench, GraduationCap, Code } from 'lucide-react';
import { usePWA } from '@/shared/hooks/usePWA';

const services = [
    {
        title: "Trade-In & Échange",
        desc: "Mettez à niveau vos appareils avec notre système d'évaluation intelligente.",
        icon: <RefreshCcw className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    },
    {
        title: "Maintenance IT",
        desc: "Réparations professionnelles et support technique certifié.",
        icon: <Wrench className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    },
    {
        title: "Formation Tech",
        desc: "Apprenez le coding, Excel, les outils IA et bien plus.",
        icon: <GraduationCap className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    },
    {
        title: "Développement Web & Mobile",
        desc: "Solutions sur mesure pour entreprises et entrepreneurs.",
        icon: <Code className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    }
];

const ServicesSection = () => {
    const isPWA = usePWA();
    const iconColor = isPWA ? "bg-[#00FF41]" : "bg-blue-600";
    const textColor = isPWA ? "text-black" : "text-white";

    return (
        <section className="py-16 bg-slate-50 dark:bg-zinc-900/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Nos Services</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
                        Des solutions complètes pour tous vos besoins technologiques.
                    </p>
                </div>

                {isPWA ? (
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {services.map((service, idx) => (
                            <button
                                key={idx}
                                className="bg-white dark:bg-zinc-900/40 p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm active:scale-95 transition-all group flex flex-col items-center text-center backdrop-blur-sm"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/15 dark:bg-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                                    {React.cloneElement(service.icon as React.ReactElement, {
                                        className: "w-8 h-8 text-primary",
                                        strokeWidth: 2.5
                                    })}
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-80 group-hover:opacity-100">
                                    {service.title}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-600 group-hover:scale-110 transition-transform`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {service.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
                坐            </div>
        </section>
    );
};

export default ServicesSection;
