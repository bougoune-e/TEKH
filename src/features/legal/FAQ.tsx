import { useGoToFooter } from "@/shared/hooks/useGoToFooter";
import { ChevronLeft, HelpCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
    { q: "Qu’est-ce que TEKH+ ?", a: "TEKH+ est une plateforme togolaise qui permet d’acheter, vendre, échanger (swap) et faire certifier des appareils électroniques d’occasion. Chaque appareil certifié est fourni avec une Dealbox premium incluant un rapport de santé technique et une garantie de 6 mois." },
    { q: "Comment créer un compte ?", a: "Rendez-vous sur l’application TEKH+, cliquez sur « Créer un compte » et renseignez votre nom, email et mot de passe. Vous pouvez aussi vous connecter directement avec Google. La création de compte est gratuite et instantanée." },
    { q: "Comment acheter un appareil certifié ?", a: "Parcourez le catalogue dans la section « Deals », sélectionnez l’appareil de votre choix, vérifiez les détails et la fiche technique, puis validez la commande. Le paiement s’effectue via mobile money (Flooz, TMoney) ou carte bancaire. L’appareil vous est remis avec sa Dealbox et sa carte de garantie 6 mois." },
    { q: "Comment vendre ou échanger mon appareil ?", a: "Utilisez l’estimateur TEKH+ (section « Simulateur ») pour obtenir une cotation en temps réel. Si vous acceptez le prix, un rendez-vous est fixé dans un point TEKH+ pour vérification physique de l’appareil. Une fois validé, vous recevez votre règlement ou un bon d’échange selon votre choix." },
    { q: "Que couvre la certification TEKH+ ?", a: "Le processus de certification comporte 50 points de contrôle : état de l’écran et de la vitre, performance de la batterie (capacité réelle), qualité des appareils photo, état des capteurs, connectivité (WiFi, Bluetooth, 4G/5G), et vérification de l’IMEI pour s’assurer que l’appareil n’est ni volé ni bloqué." },
    { q: "Quelle est la durée de la garantie ?", a: "Tous les appareils certifiés TEKH+ bénéficient d’une garantie de 6 mois couvrant les défauts de fonctionnement non déclarés. La garantie ne couvre pas les dommages causés par une chute, l’eau ou une modification non autorisée. En cas de panne couverte, TEKH+ prend en charge la réparation ou le remplacement." },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons : Mobile money (Flooz et TMoney), carte bancaire (Visa/Mastercard) et virement bancaire. Toutes les transactions sont sécurisées. Pour les échanges (swap), un dépôt de garantie peut être demandé via notre SWAP Wallet." },
    { q: "Combien coûte la livraison ?", a: "La livraison est disponible sur Lomé et ses environs. Les frais sont calculés selon votre localisation et affichés avant la validation de la commande. Pour les clients en dehors de Lomé, un retrait en point relais TEKH+ est possible sans frais supplémentaires." },
    { q: "Comment retourner un appareil ?", a: "Vous disposez de 7 jours après réception pour signaler tout problème non déclaré. Contactez notre SAV à tekhswap@gmail.com ou via WhatsApp au +228 97 62 81 17 en précisant votre numéro de commande. Notre équipe organise la prise en charge sous 24h." },
    { q: "Que faire en cas de problème technique ?", a: "Contactez-nous par email à tekhswap@gmail.com ou par WhatsApp au +228 97 62 81 17. Notre équipe technique vous répond sous 24h en semaine. Pour les pannes couvertes par la garantie 6 mois, la réparation ou le remplacement est pris en charge gratuitement." },
    { q: "Qu’est-ce que les TekhPoints ?", a: "Les TekhPoints sont les points de fidélité TEKH+. Chaque transaction physique vous permet d’accumuler des points : 1 TekhPoint = 500 FCFA de valeur. Ils sont crédités par l’équipe TEKH+ après validation de votre transaction et peuvent être utilisés pour réduire le coût de votre prochain achat (jusqu’à 30% du montant total). Les points sont valables 6 mois." },
];

export default function FAQ() {
  const goToFooter = useGoToFooter();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-dvh bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <button onClick={() => goToFooter()} className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </button>

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
