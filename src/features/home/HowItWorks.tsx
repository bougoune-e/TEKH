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
      description: "Discutez via la messagerie et sécurisez la compensation via SWAP Wallet",
    },
    {
      icon: CheckCircle,
      title: "Finalisez l'échange",
      description: "Remise en main propre ou envoi selon accord. Les fonds sont libérés une fois l'échange confirmé",
    },
  ];

  const nums = ["01", "02", "03", "04"];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-3 mb-14">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Processus</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white">
            Comment ça <span className="text-primary italic">marche ?</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto font-medium">
            Un processus simple et transparent en 4 étapes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="relative group">
                {/* Connector line between steps (desktop only) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+44px)] w-[calc(100%-88px)] border-t-2 border-dashed border-border/60 z-0" />
                )}

                <div className="relative flex flex-col items-center text-center space-y-4 z-10">
                  {/* Icon box with background number */}
                  <div className="relative">
                    {/* Giant step number — background watermark */}
                    <span
                      className="absolute -top-3 -left-3 text-[80px] font-black leading-none select-none pointer-events-none"
                      style={{ color: 'currentColor', opacity: 0.04 }}
                      aria-hidden="true"
                    >
                      {nums[index]}
                    </span>
                    {/* Icon container */}
                    <div className="relative w-20 h-20 bg-card border-2 border-border rounded-3xl flex items-center justify-center shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300">
                      <Icon className="h-9 w-9 text-primary" strokeWidth={1.75} />
                    </div>
                    {/* Step badge */}
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white dark:text-black text-[10px] font-black flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 px-2">
                    <h3 className="text-base font-black text-black dark:text-white tracking-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.description}</p>
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

export default HowItWorks;
