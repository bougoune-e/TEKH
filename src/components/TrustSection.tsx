const brandModules = import.meta.glob<{ default: string }>("@/assets/icons/brands/*.svg", { eager: true, import: "default" });
const partnerLogos = Object.values(brandModules).slice(0, 8) as unknown as string[];

const testimonials = [
  { name: "Aïcha", text: "Échange rapide et sécurisé. Mon nouveau téléphone est impeccable !", role: "Vendeuse & acheteuse" },
  { name: "Moussa", text: "Bon support et messagerie claire. L'estimation m'a bien aidé.", role: "Acheteur" },
  { name: "Patrick", text: "Reconditionnement sérieux, batterie comme neuve.", role: "Client reconditionné" },
];

const TrustSection = () => {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Ils nous font confiance</h2>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {testimonials.map((t) => (
            <figure key={t.name} className="bg-card border border-border rounded-2xl p-5 shadow-card">
              <blockquote className="text-foreground mb-3">“{t.text}”</blockquote>
              <figcaption className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t.name}</span> — {t.role}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Partner logos */}
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
          {partnerLogos.map((url, i) => (
            <img key={i} src={url} alt="Partenaire" className="h-8 w-auto" />)
          )}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
