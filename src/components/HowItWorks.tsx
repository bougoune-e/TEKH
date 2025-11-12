import { Smartphone, Search, ArrowRightLeft, CheckCircle } from "lucide-react";

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
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-subtle relative">
      {/* Effet de fond */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Comment ça{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">marche ?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et transparent en 4 étapes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    {/* Effet de glow animé */}
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-card p-5 rounded-2xl shadow-card border border-border/50 group-hover:border-primary/50 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-semibold bg-gradient-hero bg-clip-text text-transparent">
                      Étape {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-primary via-accent to-transparent -translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
