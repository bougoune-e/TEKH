import AboutSection from "@/features/home/AboutSection";

const APropos = () => {
  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase">À propos de <span className="text-primary">TΞKΗ+</span></h1>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Notre Engagement pour l'Inclusion Numérique</h2>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">
              Chez TΞKΗ+, nous croyons que l'accès à une technologie de pointe ne doit pas être un luxe. Notre mission est de démocratiser l'accès aux outils numériques de haute qualité en Afrique par un modèle circulaire innovant.
            </p>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              L'inclusion numérique ne signifie pas seulement "avoir un téléphone", mais posséder un appareil <strong className="text-black dark:text-white">performant, certifié et durable</strong>. C'est pourquoi nous avons créé le standard DEALBOX, garantissant que chaque transaction renforce l'autonomie numérique de nos utilisateurs.
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-[40px] border-2 border-black dark:border-white shadow-2xl flex flex-col justify-center">
            <blockquote className="text-2xl font-black italic text-black dark:text-white mb-6">
              "Réduire la fracture numérique, un échange à la fois."
            </blockquote>
            <p className="font-bold text-primary uppercase tracking-widest text-sm">Vision TEKH+ 2030</p>
          </div>
        </div>

        <section className="mb-20 space-y-12">
          <div className="prose prose-zinc dark:prose-invert max-w-none font-bold leading-relaxed text-lg">
            <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter border-l-8 border-primary pl-6 mb-8">Pourquoi nous existons</h2>
            <p>
              Le marché traditionnel de l'occasion est souvent synonyme d'incertitude et de risques. TΞKΗ+ transforme cette expérience en un processus <strong className="text-black dark:text-white">transparent, sécurisé et valorisant</strong>. Nous ne nous contentons pas de faciliter des échanges ; nous bâtissons une infrastructure de confiance pour l'économie circulaire africaine.
            </p>
            <p>
              En mettant l'accent sur l'inclusion numérique de bonne qualité, nous permettons à des milliers d'étudiants, d'entrepreneurs et de familles d'accéder à des outils qui étaient auparavant hors de portée, tout en préservant l'environnement.
            </p>
          </div>
        </section>

      </div>
      <AboutSection />
    </main>
  );
};

export default APropos;
