const testimonials = [
  {
    name: "Aïcha K.",
    text: "Échange rapide et sécurisé. Mon nouveau téléphone est impeccable, livré le lendemain !",
    role: "Vendeuse & acheteuse",
    avatar: "A",
  },
  {
    name: "Moussa D.",
    text: "L'estimation m'a bien aidé à fixer mon prix. Support réactif et transaction claire.",
    role: "Acheteur",
    avatar: "M",
  },
  {
    name: "Patrick N.",
    text: "Reconditionnement sérieux. Batterie comme neuve, appareil testé sur tous les points.",
    role: "Client reconditionné",
    avatar: "P",
  },
];

const stats = [
  { value: "500+", label: "Échanges réalisés" },
  { value: "4.8/5", label: "Satisfaction client" },
  { value: "72h", label: "Délai max livraison" },
  { value: "50 pts", label: "Contrôles qualité" },
];

const TrustSection = () => {
  return (
    <section className="py-16 md:py-24 bg-[#f0f9f4] dark:bg-[#0a1628]/40 border-t border-border">
      <div className="container mx-auto px-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-[#064e3b] dark:text-[#00FF41] tracking-tighter">
                {value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Ils nous font confiance
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
            >
              <blockquote className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-semibold flex-1">
                "{t.text}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#064e3b] flex items-center justify-center text-white font-black text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t.role}</div>
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
