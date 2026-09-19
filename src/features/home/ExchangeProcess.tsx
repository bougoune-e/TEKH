import offerImg from "@/assets/illustrations/deals/offer.png";
import fcfaImg from "@/assets/illustrations/deals/fcfa.jpg";
import swapImg from "@/assets/illustrations/deals/swap.jpeg";

const ExchangeProcess = () => {
    const steps = [
        {
            img: offerImg,
            title: "Consultez",
            desc: "Trouvez l’appareil certifié qui correspond à votre usage.",
        },
        {
            img: fcfaImg,
            title: "Évaluez",
            desc: "La soulte est calculée : votre téléphone contre le leur, en FCFA.",
        },
        {
            img: swapImg,
            title: "Échangez",
            desc: "Dépôt en Dealbox ou logistique TEKH+. Rien n’est livré à l’aveugle.",
        },
    ];

    return (
        <section className="py-20 md:py-28 bg-[hsl(142_30%_97%)] overflow-hidden">
            <div className="container mx-auto px-6 lg:px-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div className="space-y-3 max-w-xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--tekh-green))]">
                            Le SWAP
                        </p>
                        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[hsl(var(--tekh-navy))]">
                            Consulter, évaluer, échanger.
                        </h2>
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--tekh-navy))]/55 max-w-sm leading-relaxed">
                        Quatre étapes certifiées — de la vitrine jusqu’à la validation physique.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {steps.map((step, idx) => (
                        <div key={step.title} className="space-y-4">
                            <div className="relative h-36 md:h-48 overflow-hidden border border-[hsl(var(--tekh-navy))]/10">
                                <img src={step.img} alt="" className="w-full h-full object-cover" />
                                <span className="absolute top-3 left-3 h-7 w-7 bg-[hsl(var(--tekh-navy))] text-white flex items-center justify-center font-display text-sm">
                                    {idx + 1}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-display text-lg font-semibold text-[hsl(var(--tekh-navy))]">{step.title}</h3>
                                <p className="text-sm font-medium text-[hsl(var(--tekh-navy))]/55 leading-snug mt-1">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="space-y-4">
                        <div className="relative h-36 md:h-48 flex flex-col items-center justify-center bg-[hsl(var(--tekh-green))] text-white">
                            <span className="absolute top-3 left-3 h-7 w-7 bg-[hsl(var(--tekh-navy))] text-white flex items-center justify-center font-display text-sm">
                                4
                            </span>
                            <span className="font-display italic text-2xl">Validé</span>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-semibold text-[hsl(var(--tekh-navy))]">Deal validé</h3>
                            <p className="text-sm font-medium text-[hsl(var(--tekh-navy))]/55 leading-snug mt-1">
                                Échange finalisé, appareil prêt, TekhPoints crédités.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExchangeProcess;
