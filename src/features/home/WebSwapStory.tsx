import { ArrowRight, Recycle, ShieldCheck, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pillars = [
  {
    n: "01",
    icon: Smartphone,
    title: "Vous apportez un téléphone",
    body: "Cassé, ancien, ou simplement trop petit : on estime sa valeur réelle en moins de deux minutes, selon l’état et le marché ouest-africain.",
  },
  {
    n: "02",
    icon: Recycle,
    title: "TEKH+ le transforme en SWAP",
    body: "Ce n’est pas une vente sèche. L’appareil entre dans un circuit certifié Dealbox : 50 points de contrôle, reconditionnement, puis échange.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Vous repartez avec un autre",
    body: "Upgrade, équivalent, ou soulte en FCFA. Transaction tracée, dépôt en point relais, et logistique jusqu’à la remise.",
  },
];

const WebSwapStory = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[hsl(var(--tekh-green))]" aria-hidden="true" />

      <div className="container mx-auto px-6 lg:px-16 py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-16 md:mb-20">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--tekh-green))]">
              Ce que fait TΞKΗ+
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-[hsl(var(--tekh-navy))] leading-[1.08]">
              Votre téléphone ne se vend pas.
              <span className="block italic font-medium text-[hsl(var(--tekh-green))]">
                Il devient un autre téléphone.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base md:text-lg text-[hsl(var(--tekh-navy))]/70 leading-relaxed max-w-md font-medium">
              TΞKΗ+ est la plateforme d’échange certifié de smartphones en Afrique de l’Ouest.
              Estimation, reconditionnement, compensation en FCFA, et retrait sécurisé — un seul geste : le SWAP.
            </p>
            <button
              type="button"
              onClick={() => navigate("/simulateur")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--tekh-green))] hover:gap-3 transition-all"
            >
              Lancer une estimation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[hsl(var(--tekh-navy))]/10 border border-[hsl(var(--tekh-navy))]/10">
          {pillars.map(({ n, icon: Icon, title, body }) => (
            <article
              key={n}
              className="bg-white p-8 md:p-10 space-y-5 hover:bg-[hsl(142_30%_97%)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-display italic text-3xl text-[hsl(var(--tekh-green))]">{n}</span>
                <Icon className="w-6 h-6 text-[hsl(var(--tekh-navy))]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-[hsl(var(--tekh-navy))] leading-snug">
                {title}
              </h3>
              <p className="text-sm md:text-[15px] text-[hsl(var(--tekh-navy))]/65 leading-relaxed font-medium">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WebSwapStory;
