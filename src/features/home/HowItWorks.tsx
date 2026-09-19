import { Smartphone, Search, ArrowRightLeft, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Estimez",
      description: "Modèle, état, batterie : la VRT (valeur résiduelle) s’affiche en quelques questions.",
    },
    {
      icon: ArrowRightLeft,
      title: "Choisissez le SWAP",
      description: "Un appareil certifié en face, ou une compensation en FCFA. Tout est calculé, rien n’est caché.",
    },
    {
      icon: Smartphone,
      title: "Déposez en Dealbox",
      description: "Un agent vérifie l’appareil. QR de dépôt, suivi logistique, expertise au centre TEKH+.",
    },
    {
      icon: CheckCircle,
      title: "Reprenez le neuf d’usage",
      description: "Appareil Grade A, garantie, TekhPoints. L’ancien entre dans le circuit, pas à la poubelle.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[hsl(var(--tekh-navy))] text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mb-16 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(142_55%_62%)]">
            Le parcours
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08]">
            Quatre gestes. Un échange.
          </h2>
          <p className="text-white/65 font-medium text-base md:text-lg leading-relaxed">
            Pas une marketplace d’annonces. Un circuit d’échange, du simulateur jusqu’au point relais.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative pl-0 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display italic text-5xl text-[hsl(var(--tekh-green))]/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-3 w-6 h-px bg-white/20" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
