import { Smartphone, Search, ArrowRightLeft, CheckCircle } from "lucide-react";
import offerImg from "../../assets/illustrations/deals/offer.png";
import fcfaImg from "../../assets/illustrations/deals/fcfa.jpg";
import swapImg from "../../assets/illustrations/deals/swap.jpeg";
import badgeImg from "../../assets/illustrations/deals/badge.svg";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Estimez votre téléphone",
      description: "Utilisez le simulateur pour estimer la valeur de votre appareil selon le modèle et l'état",
    },
    {
      icon: ArrowRightLeft,
      title: "Créez ou proposez un SWAP",
      description: "Publiez votre offre avec photos et détails, ou proposez un troc partiel à un autre membre",
    },
    {
      icon: Smartphone,
      title: "Négociation & sécurité",
      description: "Discutez via la messagerie et sécurisez la compensation via SWAP Wallet (aucun échange hors plateforme n'est couvert)",
    },
    {
      icon: CheckCircle,
      title: "Finalisez l'échange",
      description: "Remise en main propre ou envoi selon accord. Les fonds sont libérés une fois l'échange confirmé",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Comment ça <span className="text-primary">marche ?</span>
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Un processus simple et transparent en 4 étapes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="relative bg-card p-5 rounded-2xl shadow-card border border-border">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">Étape {index + 1}</div>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Séquence deals: miniatures (offer → fcfa → swap → badge) */}
        <div className="hidden md:flex items-center justify-center gap-8 mt-12">
          <img src={offerImg} alt="Offres de deals" className="h-32 w-auto rounded-2xl border border-border/50 shadow-card" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M9 18l6-6-6-6"/></svg>
          <img src={fcfaImg} alt="CFA" className="h-28 w-auto rounded-2xl border border-border/50 shadow-card" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M9 18l6-6-6-6"/></svg>
          <img src={swapImg} alt="Échange direct" className="h-32 w-auto rounded-2xl border border-border/50 shadow-card" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M9 18l6-6-6-6"/></svg>
          <img src={badgeImg} alt="Échange réussi" className="h-28 w-auto rounded-2xl border border-border/50 shadow-card" />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
