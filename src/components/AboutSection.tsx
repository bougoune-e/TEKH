const AboutSection = () => {
  return (
    <section id="a-propos" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/assets/logos/robot.png" alt="Tekh" className="h-10 w-10 rounded-md ring-1 ring-border" />
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">À propos de Tekh</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tekh est une plateforme d'échange d'appareils électroniques qui simplifie les transactions entre particuliers.
              Estimation instantanée, compensation équitable et logistique fluide.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Notre mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Offrir une alternative intelligente et responsable au renouvellement d'appareils, en rendant l'échange accessible,
              sûr et avantageux pour tous.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Nos engagements</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span><span>Estimation transparente et rapide</span></li>
              <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span><span>Transactions sécurisées</span></li>
              <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span><span>Reconditionnement responsable</span></li>
              <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span><span>Support réactif</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
