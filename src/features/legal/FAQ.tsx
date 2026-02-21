import { Link } from "react-router-dom";
import { ChevronLeft, HelpCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
    { q: "Qu’est-ce que TEKH+ ?", a: "TEKH+ est une plateforme qui permet d’acheter, vendre et faire certifier des appareils électroniques d’occasion en Afrique, avec garantie et services techniques inclus." },
    { q: "Comment créer un compte ?", a: "Téléchargez l’app ou inscrivez-vous sur tekhplus.com, puis suivez les étapes d’inscription." },
    { q: "Comment acheter un appareil certifié ?", a: "Parcourez notre catalogue, sélectionnez un appareil, validez la commande et payez en ligne. L’appareil est livré avec sa Dealbox et sa garantie." },
    { q: "Comment vendre mon appareil ?", a: "Utilisez notre outil de trade-in pour obtenir une estimation, puis envoyez-nous votre appareil pour certification." },
    { q: "Que couvre la certification TEKH+ ?", a: "La certification garantit que l’appareil est fonctionnel, sans défaut caché, et conforme à la description." },
    { q: "Quelle est la durée de la garantie ?", a: "Les appareils certifiés bénéficient d'une garantie technique pour une durée variable selon le pack choisi." },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "Mobile money (Flooz, TMoney), carte bancaire, virement." },
    { q: "Combien coûte la livraison ?", a: "Les frais de livraison sont calculés selon votre localisation et affichés avant validation de la commande." },
    { q: "Comment retourner un appareil ?", a: "Contactez notre SAV dans les [7] jours suivant la réception pour organiser le retour." },
    { q: "Que faire en cas de problème technique ?", a: "Contactez-nous via l’app ou support@tekhplus.com. Notre équipe vous assistera sous 24h." },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <HelpCircle className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Besoin d'aide ?</h1>
                    <p className="text-muted-foreground font-bold leading-relaxed">Retrouvez les réponses aux questions les plus fréquentes.</p>
                </header>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-2 border-black dark:border-white rounded-3xl overflow-hidden shadow-lg transition-all">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-6 text-left flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900"
                            >
                                <span className="font-black text-xl">{faq.q}</span>
                                {openIndex === i ? <Minus className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            </button>
                            {openIndex === i && (
                                <div className="p-6 bg-white dark:bg-black border-t-2 border-black dark:border-white font-bold leading-relaxed">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
