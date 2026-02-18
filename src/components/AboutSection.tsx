import logo from "@/assets/logos/robott.jpeg";

const AboutSection = () => {
  return (
    <section id="a-propos" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Header Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={logo} alt="TΞKΗ+" className="h-16 w-16 rounded-2xl ring-2 ring-primary/20 shadow-2xl" />
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black dark:text-white">L'Excellence <br /><span className="text-primary">Technologique.</span></h2>
              </div>
              <p className="text-xl text-slate-500 font-bold leading-relaxed">
                TΞKΗ+ n'est pas simplement une marketplace. C’est un écosystème conçu pour redéfinir la consommation électronique en Afrique, en alliant innovation, sécurité et économie circulaire.
              </p>
            </div>
            <div className="relative group p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[40px] border-2 border-black dark:border-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl uppercase tracking-tighter select-none">TEKH</div>
              <p className="relative z-10 text-2xl font-black italic text-black dark:text-white">"Notre ambition est de faire du Togo le hub de l'excellence en reconditionnement électronique."</p>
            </div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">Notre Mission</h3>
              <p className="text-slate-500 font-bold leading-relaxed">
                Démocratiser l'accès aux technologies de pointe en offrant une alternative intelligente au neuf. Nous facilitons l'échange fluide, l'achat certifié et la vente simplifiée pour que chaque citoyen puisse monter en gamme sans compromettre son budget.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">Notre Vision</h3>
              <p className="text-slate-500 font-bold leading-relaxed">
                Devenir la référence absolue de la confiance numérique. Nous bâtissons une infrastructure où la certification DEALBOX devient le standard de qualité pour tout appareil de seconde main, garantissant transparence totale et sérénité absolue.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">Nos Valeurs</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <span className="text-slate-500 font-bold">Innovation Technologique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <span className="text-slate-500 font-bold">Responsabilité Écologique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <span className="text-slate-500 font-bold">Équité Transférable</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Deep Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12 font-bold leading-relaxed text-lg">
            <section className="space-y-4">
              <h3 className="text-3xl font-black text-black dark:text-white">Pourquoi choisir TΞKΗ+ ?</h3>
              <p>
                Dans un marché souvent saturé par l'incertitude et les contrefaçons, TΞKΗ+ s'impose comme un tiers de confiance. Nous avons développé des algorithmes de cotation propriétaires qui analysent en temps réel le marché local et international pour offrir le prix le plus juste, tant pour le vendeur que pour l'acheteur.
              </p>
              <p>
                Notre processus de certification ne se limite pas à un simple contrôle visuel. Chaque appareil entrant dans notre circuit subit une batterie de 50 points de contrôle techniques, du diagnostic batterie à l'intégrité logicielle, avant d'être scellé sous la garantie exclusive DEALBOX.
              </p>
            </section>

            <section className="space-y-4 p-10 bg-black dark:bg-white text-white dark:text-black rounded-[40px] shadow-2xl">
              <h3 className="text-3xl font-black">L'Impact Environnemental</h3>
              <p className="opacity-80">
                Chaque téléphone échangé ou reconditionné via TΞKΗ+ représente une économie significative de ressources naturelles (Lithium, Cobalt, Terres rares) et une réduction massive de l’empreinte carbone. Nous croyons que la technologie de demain ne doit pas détruire la planète d'aujourd'hui.
              </p>
              <div className="flex gap-8 mt-6">
                <div><span className="block text-4xl font-black">80kg</span> <span className="text-xs uppercase font-black opacity-60">CO2 Économisés / unité</span></div>
                <div><span className="block text-4xl font-black">200g</span> <span className="text-xs uppercase font-black opacity-60">Déchets Minerais en moins</span></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
