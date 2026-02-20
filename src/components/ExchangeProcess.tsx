import offerImg from "@/assets/illustrations/deals/offer.png";
import fcfaImg from "@/assets/illustrations/deals/fcfa.jpg";
import swapImg from "@/assets/illustrations/deals/swap.jpeg";

/** SVG coche de validation — noire sur fond vert */
const ValidationSVG = () => (
    <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" stroke="rgba(0,0,0,0.35)" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
        <path d="M22 42L34 54L58 28" stroke="black" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ExchangeProcess = () => {
    const steps = [
        {
            img: offerImg,
            title: "Consultez",
            desc: "Trouvez le deal qui vous correspond.",
        },
        {
            img: fcfaImg,
            title: "Évaluez",
            desc: "Compensation calculée par notre algorithme.",
        },
        {
            img: swapImg,
            title: "Échangez",
            desc: "En lieu sûr ou via notre logistique.",
        },
    ];

    return (
        <section className="py-10 md:py-16 bg-white dark:bg-black overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white">
                        Le processus <span className="italic" style={{ color: '#00FF41' }}>SWAP.</span>
                    </h2>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Échangez votre appareil en 4 étapes certifiées.
                    </p>
                </div>

                {/* Grille 4 colonnes même sur mobile — images très petites */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 items-start">
                    {steps.map((step, idx) => (
                        <div key={idx} className="space-y-2 group">
                            <div className="relative h-20 md:h-28 rounded-[14px] overflow-hidden border-2 border-black dark:border-white shadow-md group-hover:scale-[1.03] transition-transform duration-400">
                                <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 h-5 w-5 bg-black dark:bg-white text-white dark:text-black rounded-md flex items-center justify-center font-black text-[10px] shadow">
                                    {idx + 1}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[11px] md:text-sm font-black text-black dark:text-white leading-tight">{step.title}</h3>
                                <p className="text-[9px] md:text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug hidden md:block">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Étape 4 : Validation verte */}
                    <div className="space-y-2 group">
                        <div
                            className="relative h-20 md:h-28 rounded-[14px] flex flex-col items-center justify-center border-2 border-black dark:border-white shadow-md group-hover:scale-[1.03] transition-transform duration-400"
                            style={{ backgroundColor: '#00FF41' }}
                        >
                            <ValidationSVG />
                            <div className="absolute top-1 left-1 h-5 w-5 bg-black text-white rounded-md flex items-center justify-center font-black text-[10px] shadow border border-white/20">
                                4
                            </div>
                            <span className="mt-1 px-2 py-0.5 bg-black text-white rounded-full font-black text-[7px] md:text-[9px] uppercase tracking-widest">
                                Terminé !
                            </span>
                        </div>
                        <div>
                            <h3 className="text-[11px] md:text-sm font-black text-black dark:text-white leading-tight">Deal Validé</h3>
                            <p className="text-[9px] md:text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug hidden md:block">
                                Échange finalisé, appareil prêt.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExchangeProcess;
