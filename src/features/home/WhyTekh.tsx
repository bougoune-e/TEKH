import React from 'react';
import { Smartphone, ShieldCheck, Zap } from 'lucide-react';

const reasons = [
    {
        title: "Vitesse",
        desc: "Estimation instantanée et processus d'échange en quelques minutes.",
        icon: <Zap className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    },
    {
        title: "Sécurité",
        desc: "Transactions sécurisées et protection des données personnelles.",
        icon: <ShieldCheck className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    },
    {
        title: "Qualité",
        desc: "Appareils certifiés et testés par nos experts techniques.",
        icon: <Smartphone className="w-8 h-8 text-white" />,
        color: "bg-blue-600"
    }
];

const WhyTekh = () => {
    return (
        <section className="py-16 bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Pourquoi TEKH ?</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
                        La plateforme de référence pour une technologie accessible et durable.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {reasons.map((reason, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-col items-center text-center space-y-4"
                        >
                            <div className={`${reason.color} w-20 h-20 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                {reason.icon}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {reason.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed px-4">
                                {reason.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyTekh;
