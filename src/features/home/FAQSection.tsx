import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Qu'est-ce que la « Valeur Résiduelle Technique » (VRT) et comment est-elle calculée ?",
    answer: "La VRT est l'estimation scientifique de la valeur restante de votre appareil. Elle est calculée par notre algorithme en combinant le prix d'origine du constructeur, la dépréciation du marché local, l'état d'usure de votre batterie et les éventuels coûts de remise en état (écran, connecteur, etc.). C'est l'assurance d'un prix de reprise transparent et sans surprise."
  },
  {
    question: "Comment fonctionne le dépôt d'appareil et le paiement ?",
    answer: "Une fois votre estimation complétée en ligne, vous obtenez un code Dealbox unique. Vous pouvez vous rendre dans n'importe quel point partenaire agréé TEKH+. L'agent vérifie la conformité de l'appareil en quelques minutes, valide la transaction, et le transfert de fonds est immédiatement initié sur votre compte Wave, MTN MoMo, Orange Money ou Moov Flooz."
  },
  {
    question: "Je suis réparateur indépendant. Pourquoi devrais-je utiliser la suite de maintenance TEKH+ ?",
    answer: "Notre logiciel vous permet de structurer votre activité. Vous passez d'une gestion informelle sur papier à un véritable tableau de bord professionnel. En certifiant vos réparations avec le standard Dealbox, vous augmentez la confiance de vos clients, justifiez des tarifs plus élevés, et accédez à un flux de clients qualifiés envoyés par notre plateforme de Trade-In."
  },
  {
    question: "Que se passe-t-il si l'état réel de mon téléphone ne correspond pas à mon diagnostic en ligne ?",
    answer: "Pas d'inquiétude. Lors de la validation physique dans notre point partenaire, si une différence notable est constatée (par exemple, un écran non d'origine ou une batterie gonflée), l'agent vous proposera une réévaluation instantanée. Vous êtes totalement libre d'accepter la nouvelle offre ou de récupérer votre appareil gratuitement."
  },
  {
    question: "Les données personnelles stockées sur mon ancien téléphone sont-elles sécurisées ?",
    answer: "Oui, la sécurité de vos données est notre priorité. Avant toute validation finale de reprise, nos agents partenaires vous guident dans la réinitialisation complète de votre smartphone. Pour les professionnels, notre suite de maintenance intègre un protocole d'effacement sécurisé des données répondant aux normes internationales."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#064e3b]/5 dark:bg-[#00FF41]/10 border border-[#064e3b]/10 dark:border-[#00FF41]/20 mb-4">
            <HelpCircle className="w-4 h-4 text-[#064e3b] dark:text-[#00FF41]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] dark:text-[#00FF41]">
              FAQ Stratégique
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0a0a] dark:text-white mb-4 tracking-tighter">
            Questions Fréquentes
          </h2>
          <p className="text-[#404040] dark:text-zinc-400 font-bold max-w-xl mx-auto">
            Tout ce que vous devez savoir sur le standard Dealbox et notre suite logicielle.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-base md:text-lg text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-sm md:text-base text-muted-foreground border-t border-zinc-100/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/10 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
