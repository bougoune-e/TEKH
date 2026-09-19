const testimonials = [
  {
    name: "Aïcha K.",
    text: "Échange rapide et sécurisé. Mon nouveau téléphone est impeccable, livré le lendemain.",
    role: "SWAP effectué",
    avatar: "A",
  },
  {
    name: "Moussa D.",
    text: "L’estimation m’a aidé à comprendre la vraie valeur. Transaction claire, pas de surprise en Dealbox.",
    role: "Estimation + dépôt",
    avatar: "M",
  },
  {
    name: "Patrick N.",
    text: "Reconditionnement sérieux. Batterie comme neuve, appareil testé sur tous les points.",
    role: "Appareil Grade A",
    avatar: "P",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-[hsl(var(--tekh-navy))]/8">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--tekh-green))] mb-3">
            Confiance
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[hsl(var(--tekh-navy))] tracking-tight">
            Ils ont déjà changé de téléphone sans changer de budget.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="border border-[hsl(var(--tekh-navy))]/10 p-8 flex flex-col gap-6 bg-[hsl(142_30%_97%)]"
            >
              <blockquote className="text-[hsl(var(--tekh-navy))]/80 text-[15px] leading-relaxed font-medium flex-1">
                “{t.text}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--tekh-navy))] flex items-center justify-center text-white font-display text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[hsl(var(--tekh-navy))]">{t.name}</div>
                  <div className="text-xs text-[hsl(var(--tekh-navy))]/45 font-medium">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
